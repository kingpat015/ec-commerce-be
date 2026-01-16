const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create uploads/products directory if it doesn't exist
    // Since server.js is in src/, go up one level to reach backend root
    const baseDir = path.join(__dirname, "../../uploads/products");
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    // For now, store in temp folder, will move to product_id folder after product creation
    const tempDir = path.join(baseDir, "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Helper function to move file to product-specific folder
const moveFileToProductFolder = (tempFilePath, productId) => {
  if (!tempFilePath) return null;

  const baseDir = path.join(__dirname, "../../uploads/products");
  const productDir = path.join(baseDir, productId.toString());

  // Create product directory if it doesn't exist
  if (!fs.existsSync(productDir)) {
    fs.mkdirSync(productDir, { recursive: true });
  }

  const fileName = path.basename(tempFilePath);
  const newPath = path.join(productDir, fileName);

  // Move file
  fs.renameSync(tempFilePath, newPath);

  // Return relative path for database
  return `/uploads/products/${productId}/${fileName}`;
};

// Helper function to delete product folder
const deleteProductFolder = (productId) => {
  const productDir = path.join(
    __dirname,
    "../../uploads/products",
    productId.toString()
  );

  if (fs.existsSync(productDir)) {
    fs.rmSync(productDir, { recursive: true, force: true });
  }
};

// Helper function to delete old image when updating
const deleteOldImage = (imagePath) => {
  if (!imagePath || imagePath.startsWith("http")) return;

  // imagePath will be like "/uploads/products/1/image-xxx.jpg"
  // Convert to actual file path
  const fullPath = path.join(__dirname, "../..", imagePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

module.exports = {
  upload,
  moveFileToProductFolder,
  deleteProductFolder,
  deleteOldImage,
};
