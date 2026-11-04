const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

// Attach a user when a valid token is supplied, while allowing guests through.
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Invalid authorization header' });
  }

  try {
    const token = authHeader.slice('Bearer '.length);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) return res.status(401).json({ message: 'User no longer exists' });
    req.user = user;
    return next();
  } catch (error) {
    // A stale token should not prevent someone from completing a guest booking.
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') return next();
    return next(error);
  }
};

module.exports = optionalAuth;
