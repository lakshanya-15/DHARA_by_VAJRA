/**
 * Role-based authorization middleware.
 * Use after auth middleware. requireRole(['FARMER', 'ADMIN']) allows only those roles.
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    // Normalize user role and allowed roles to uppercase for comparison
    const userRole = (req.user.role || '').toUpperCase();
    const allowed = allowedRoles.map(r => r.toUpperCase());

    if (!allowed.includes(userRole)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }
    next();
  };
}

module.exports = { requireRole };
