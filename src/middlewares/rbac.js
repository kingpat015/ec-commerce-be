const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message:
          "Forbidden: You do not have permission to access this resource",
      });
    }

    next();
  };
};

const checkOwnershipOrAdmin = (resourceUserId) => {
  return (req, res, next) => {
    if (req.user.role === "admin" || req.user.userId === resourceUserId) {
      return next();
    }
    return res.status(403).json({ message: "Forbidden" });
  };
};

module.exports = { authorize, checkOwnershipOrAdmin };
