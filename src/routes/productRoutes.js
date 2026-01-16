const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/rbac");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} = require("../controllers/productController");

// Public routes (with optional auth for different data)
router.get(
  "/",
  (req, res, next) => {
    // Try to authenticate but don't require it
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authenticate(req, res, next);
    }
    next();
  },
  getProducts
);

router.get("/categories", getCategories);

// Protected routes
router.get("/:id", authenticate, getProductById);

// Sales user and admin only
router.post("/", authenticate, authorize("admin", "sales_user"), createProduct);
router.put(
  "/:id",
  authenticate,
  authorize("admin", "sales_user"),
  updateProduct
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin", "sales_user"),
  deleteProduct
);

module.exports = router;
