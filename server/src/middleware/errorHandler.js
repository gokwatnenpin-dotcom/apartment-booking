/**
 * Global Express error handler.
 * Must be registered LAST (after all routes).
 */
const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  } else {
    console.error(`❌ ${err.message}`);
  }

  // Prisma known request errors
  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'A record with this value already exists.' });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Record not found.' });
    }
    if (err.code === 'P2003') {
      return res.status(400).json({ message: 'Related record not found.' });
    }
  }

  if (err.name === 'PrismaClientValidationError') {
    return res.status(400).json({ message: 'Invalid data provided.' });
  }

  const statusCode = err.statusCode || 500;
  const publicMessage = statusCode >= 500
    ? 'Something went wrong. Please try again shortly.'
    : err.message;
  res.status(statusCode).json({
    message: publicMessage || 'Internal server error',
  });
};

module.exports = errorHandler;
