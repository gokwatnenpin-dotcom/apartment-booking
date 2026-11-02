const prisma = require('../prisma');

// POST /api/bookings
const create = async (req, res, next) => {
  try {
    const { apartmentId, checkIn, checkOut, guests } = req.body;
    const userId = req.user.id;

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
          status: { not: 'CANCELLED' },
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
          apartmentId,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          guests: parseInt(guests),
          totalPrice,
          status: 'CONFIRMED',
        },
        include: {
          apartment: {
            select: { id: true, title: true, location: true, images: true, pricePerNight: true },
          },
          user: { select: { id: true, name: true, email: true } },
        },
      });
    }, { isolationLevel: 'Serializable' });

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

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        apartment: { select: { title: true, location: true } },
      },
    });

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

module.exports = { create, getMy, cancel, getAll };
