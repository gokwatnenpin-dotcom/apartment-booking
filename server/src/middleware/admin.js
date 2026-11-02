/**
 * Middleware: require ADMIN role.
 * Must be used after the `authenticate` middleware.
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

module.exports = requireAdmin;
