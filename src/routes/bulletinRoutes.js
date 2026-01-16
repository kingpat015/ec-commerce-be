const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/rbac");
const {
  getBulletins,
  getBulletinById,
  createBulletin,
  updateBulletin,
  deleteBulletin,
} = require("../controllers/bulletinController");

// Public routes (with optional auth for different data)
router.get(
  "/",
  (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authenticate(req, res, next);
    }
    next();
  },
  getBulletins
);

// Protected routes
router.get("/:id", authenticate, getBulletinById);

// HR user and admin only
router.post("/", authenticate, authorize("admin", "hr_user"), createBulletin);
router.put("/:id", authenticate, authorize("admin", "hr_user"), updateBulletin);
router.delete(
  "/:id",
  authenticate,
  authorize("admin", "hr_user"),
  deleteBulletin
);

module.exports = router;
