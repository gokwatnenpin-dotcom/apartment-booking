const prisma = require('../prisma');

// GET /api/apartments
const getAll = async (req, res, next) => {
  try {
    const {
      location,
      minPrice,
      maxPrice,
      guests,
      bedrooms,
      amenities,
      checkIn,
      checkOut,
      page = 1,
      limit = 9,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where = { isAvailable: true };

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (minPrice || maxPrice) {
      where.pricePerNight = {};
      if (minPrice) where.pricePerNight.gte = parseFloat(minPrice);
      if (maxPrice) where.pricePerNight.lte = parseFloat(maxPrice);
    }

    if (guests) {
      where.maxGuests = { gte: parseInt(guests) };
    }

    if (bedrooms) {
      where.bedrooms = { gte: parseInt(bedrooms) };
    }

    if (amenities) {
      const requestedAmenities = (Array.isArray(amenities) ? amenities : [amenities])
        .map((amenity) => String(amenity).trim())
        .filter(Boolean);
      if (requestedAmenities.length) where.amenities = { hasEvery: requestedAmenities };
    }

    // Exclude apartments with overlapping active bookings
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      if (!isNaN(checkInDate) && !isNaN(checkOutDate) && checkInDate < checkOutDate) {
        where.bookings = {
          none: {
            status: { not: 'CANCELLED' },
            AND: [
              { checkIn: { lt: checkOutDate } },
              { checkOut: { gt: checkInDate } },
            ],
          },
        };
      }
    }

    const [apartments, total] = await prisma.$transaction([
      prisma.apartment.findMany({ where, skip, take: limitNum, orderBy: { createdAt: 'desc' } }),
      prisma.apartment.count({ where }),
    ]);

    res.json({
      data: apartments,
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

// GET /api/apartments/:id
const getOne = async (req, res, next) => {
  try {
    const { id } = req.params;

    const apartment = await prisma.apartment.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            status: { not: 'CANCELLED' },
            checkOut: { gte: new Date() },
          },
          select: { checkIn: true, checkOut: true, status: true },
          orderBy: { checkIn: 'asc' },
        },
      },
    });

    if (!apartment) {
      return res.status(404).json({ message: 'Apartment not found' });
    }

    res.json(apartment);
  } catch (error) {
    next(error);
  }
};

// POST /api/apartments (admin)
const create = async (req, res, next) => {
  try {
    const {
      title, description, location, pricePerNight,
      bedrooms, bathrooms, maxGuests, amenities, images,
    } = req.body;

    const apartment = await prisma.apartment.create({
      data: {
        title,
        description,
        location,
        pricePerNight: parseFloat(pricePerNight),
        bedrooms: parseInt(bedrooms),
        bathrooms: parseInt(bathrooms),
        maxGuests: parseInt(maxGuests),
        amenities: Array.isArray(amenities) ? amenities : [],
        images: Array.isArray(images) ? images : [],
      },
    });

    res.status(201).json(apartment);
  } catch (error) {
    next(error);
  }
};

// PUT /api/apartments/:id (admin)
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title, description, location, pricePerNight,
      bedrooms, bathrooms, maxGuests, amenities, images, isAvailable,
    } = req.body;

    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (location !== undefined) data.location = location;
    if (pricePerNight !== undefined) data.pricePerNight = parseFloat(pricePerNight);
    if (bedrooms !== undefined) data.bedrooms = parseInt(bedrooms);
    if (bathrooms !== undefined) data.bathrooms = parseInt(bathrooms);
    if (maxGuests !== undefined) data.maxGuests = parseInt(maxGuests);
    if (amenities !== undefined) data.amenities = Array.isArray(amenities) ? amenities : [];
    if (images !== undefined) data.images = Array.isArray(images) ? images : [];
    if (isAvailable !== undefined) data.isAvailable = isAvailable === true || isAvailable === 'true';

    const apartment = await prisma.apartment.update({ where: { id }, data });
    res.json(apartment);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/apartments/:id (admin)
const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    const activeBookings = await prisma.booking.count({
      where: { apartmentId: id, status: { in: ['CONFIRMED', 'PENDING'] } },
    });
    if (activeBookings > 0) {
      return res.status(409).json({
        message: 'Cannot delete apartment with active bookings. Cancel all bookings first.',
      });
    }

    await prisma.apartment.delete({ where: { id } });
    res.json({ message: 'Apartment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getOne, create, update, remove };
