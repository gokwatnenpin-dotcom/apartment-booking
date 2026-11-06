const prisma = require('../prisma');
const { sendBookingEmail, sendReceiptEmail, sendCancellationEmail } = require('../services/brevo');

async function initializePaystack(booking) {
  if (!process.env.PAYSTACK_SECRET_KEY) throw new Error('Paystack is not configured');
  const email = booking.user?.email || booking.guestEmail;
  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, amount: Math.round(Number(booking.totalPrice) * 100), currency: 'NGN', reference: booking.paymentReference, callback_url: `${process.env.CLIENT_URL}/payment/callback`, metadata: { bookingId: booking.id } }),
  });
  const result = await response.json();
  if (!response.ok || !result.status) throw new Error(result.message || 'Paystack could not initialize payment');
  return result.data.authorization_url;
}

// POST /api/bookings
const create = async (req, res, next) => {
  try {
    const { apartmentId, checkIn, checkOut, guests, guestName, guestEmail } = req.body;
    const userId = req.user?.id || null;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ message: 'Check-out must be after check-in' });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (checkInDate < today) {
      return res.status(400).json({ message: 'Check-in date cannot be in the past' });
    }

    // Atomic transaction: check overlap then create
    const booking = await prisma.$transaction(async (tx) => {
      const apartment = await tx.apartment.findUnique({ where: { id: apartmentId } });
      if (!apartment) {
        const err = new Error('Apartment not found');
        err.statusCode = 404;
        throw err;
      }
      if (!apartment.isAvailable) {
        const err = new Error('This apartment is not available for booking');
        err.statusCode = 400;
        throw err;
      }
      if (parseInt(guests) > apartment.maxGuests) {
        const err = new Error(`Maximum ${apartment.maxGuests} guests allowed for this apartment`);
        err.statusCode = 400;
        throw err;
      }

      // Check for overlapping non-cancelled bookings
      const overlapping = await tx.booking.findFirst({
        where: {
          apartmentId,
          OR: [
            { status: 'CONFIRMED' },
            { status: 'PENDING', reservationExpiresAt: { gt: new Date() } },
          ],
          AND: [
            { checkIn: { lt: checkOutDate } },
            { checkOut: { gt: checkInDate } },
          ],
        },
      });

      if (overlapping) {
        const err = new Error('This apartment is already booked for the selected dates');
        err.statusCode = 409;
        throw err;
      }

      const msPerDay = 1000 * 60 * 60 * 24;
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / msPerDay);
      const totalPrice = parseFloat(apartment.pricePerNight.toString()) * nights;

      return tx.booking.create({
        data: {
          userId,
          guestName: userId ? null : guestName.trim(),
          guestEmail: userId ? null : guestEmail.trim(),
          apartmentId,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          guests: parseInt(guests),
          totalPrice,
          status: 'PENDING',
          paymentReference: `zestay_${Date.now()}_${require('crypto').randomBytes(6).toString('hex')}`,
          paymentToken: require('crypto').randomBytes(32).toString('hex'),
          reservationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
        include: {
          apartment: {
            select: { id: true, title: true, location: true, images: true, pricePerNight: true },
          },
          user: { select: { id: true, name: true, email: true } },
        },
      });
    }, { isolationLevel: 'Serializable' });

    const continueUrl = `${process.env.CLIENT_URL}/payment/continue?token=${booking.paymentToken}`;
    await sendBookingEmail(booking, continueUrl).catch((error) => console.error('Booking email failed:', error.message));
    res.status(201).json(booking);
  } catch (error) {
    // PostgreSQL serialization failures mean a concurrent booking transaction
    // won the race. Treat that outcome as an unavailable date range.
    if (error.code === 'P2034') {
      return res.status(409).json({ message: 'This apartment is already booked for the selected dates' });
    }
    next(error);
  }
};

const continuePayment = async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { paymentToken: req.params.token }, include: { apartment: true, user: true } });
    if (!booking || booking.status !== 'PENDING' || booking.reservationExpiresAt < new Date()) return res.status(410).json({ message: 'This unpaid reservation has expired. Please reserve again.' });
    const paymentUrl = await initializePaystack(booking);
    res.json({ paymentUrl });
  } catch (error) { next(error); }
};

const verifyPayment = async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { paymentReference: req.query.reference } });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(booking.paymentReference)}`, { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } });
    const result = await response.json();
    if (!response.ok || result.data?.status !== 'success' || Number(result.data.amount) !== Math.round(Number(booking.totalPrice) * 100)) return res.status(402).json({ message: 'Payment has not been confirmed' });
    const paid = await prisma.booking.update({ where: { id: booking.id }, data: { status: 'CONFIRMED', paidAt: new Date() }, include: { apartment: true, user: true } });
    if (!paid.receiptEmailSentAt) {
      await sendReceiptEmail(paid).catch((error) => console.error('Receipt email failed:', error.message));
      await prisma.booking.updateMany({ where: { id: paid.id, receiptEmailSentAt: null }, data: { receiptEmailSentAt: new Date() } });
    }
    res.json({ status: paid.status, bookingId: paid.id });
  } catch (error) { next(error); }
};

const paystackWebhook = async (req, res) => {
  const crypto = require('crypto');
  const signature = req.headers['x-paystack-signature'];
  const expected = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(JSON.stringify(req.body)).digest('hex');
  if (!signature || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return res.sendStatus(401);
  if (req.body.event === 'charge.success') {
    const data = req.body.data;
    const booking = await prisma.booking.findUnique({ where: { paymentReference: data.reference } });
    if (booking && Number(data.amount) === Math.round(Number(booking.totalPrice) * 100)) {
      const paid = await prisma.booking.update({ where: { id: booking.id }, data: { status: 'CONFIRMED', paidAt: new Date() }, include: { apartment: true, user: true } });
      if (!paid.receiptEmailSentAt) {
        await sendReceiptEmail(paid).catch((error) => console.error('Receipt email failed:', error.message));
        await prisma.booking.updateMany({ where: { id: paid.id, receiptEmailSentAt: null }, data: { receiptEmailSentAt: new Date() } });
      }
    }
  }
  res.sendStatus(200);
};

// GET /api/bookings/my
const getMy = async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: {
        apartment: {
          select: { id: true, title: true, location: true, images: true, pricePerNight: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/bookings/:id/cancel
const cancel = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (req.user.role !== 'ADMIN' && booking.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }
    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    const reason = String(req.body.reason || '').trim();
    if (reason.length < 5) return res.status(400).json({ message: 'Please provide a cancellation reason (at least 5 characters).' });
    const updated = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED', cancellationReason: reason },
      include: {
        apartment: true,
        user: true,
      },
    });

    await sendCancellationEmail(updated, reason).catch((error) => console.error('Cancellation email failed:', error.message));

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// GET /api/bookings  (admin)
const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (status && ['PENDING', 'CONFIRMED', 'CANCELLED'].includes(status)) {
      where.status = status;
    }

    const [bookings, total] = await prisma.$transaction([
      prisma.booking.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          user: { select: { id: true, name: true, email: true } },
          apartment: { select: { id: true, title: true, location: true, images: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({
      data: bookings,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { create, getMy, cancel, getAll, verifyPayment, paystackWebhook, continuePayment };
