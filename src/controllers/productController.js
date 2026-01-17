const pool = require("../config/database");
const {
  moveFileToProductFolder,
  deleteProductFolder,
  deleteOldImage,
} = require("../middlewares/uploadMiddleware"); // ← FIXED: changed from middleware to middlewares

const getProducts = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { category, search, limit = 20, offset = 0 } = req.query;
    const isAuthenticated = !!req.user;

    let query = `
  SELECT 
    p.id, 
    p.name, 
    p.category_id,
    p.image_url, 
    p.status,
    p.created_at,
    pc.name as category_name,
    ${
      isAuthenticated
        ? "p.description, p.price, p.stock"
        : "p.short_description"
    }
  FROM products p
  LEFT JOIN product_categories pc ON p.category_id = pc.id
  WHERE p.deleted_at IS NULL AND p.status = 'active'
`;

    const params = [];

    if (category) {
      query += " AND pc.slug = ?";
      params.push(category);
    }

    if (search) {
      query += " AND (p.name LIKE ? OR p.description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    query += " ORDER BY p.created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const [products] = await connection.query(query, params);

    // ✅ CONVERT image_url to full URL
    const baseUrl = process.env.BASE_URL || "http://localhost:5000";
    const productsWithFullUrls = products.map((product) => ({
      ...product,
      image_url:
        product.image_url && !product.image_url.startsWith("http")
          ? `${baseUrl}${product.image_url}`
          : product.image_url,
    }));

    res.json({
      products: productsWithFullUrls,
      authenticated: isAuthenticated,
    });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

const getProductById = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const isAuthenticated = !!req.user;

    if (!isAuthenticated) {
      return res.status(401).json({
        message: "Please login to view full product details",
      });
    }

    const [products] = await connection.query(
      `
      SELECT 
        p.*, 
        pc.name as category_name,
        u.name as created_by_name
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.id = ? AND p.deleted_at IS NULL
    `,
      [id],
    );

    if (products.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ product: products[0] });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

const createProduct = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const {
      name,
      description,
      short_description,
      price,
      stock,
      category_id,
      image_url,
    } = req.body;
    const userId = req.user.userId;

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    let finalImageUrl = image_url;

    // If file was uploaded, use it
    if (req.file) {
      // ← IMPORTANTE: Check if multer received a file
      // Create product first to get ID, then move file
      const [result] = await connection.query(
        `INSERT INTO products (name, description, short_description, price, stock, category_id, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          description,
          short_description,
          price,
          stock || 0,
          category_id,
          userId,
        ],
      );

      const productId = result.insertId;

      // Move file to product-specific folder
      finalImageUrl = moveFileToProductFolder(req.file.path, productId);

      // Update product with image URL
      await connection.query("UPDATE products SET image_url = ? WHERE id = ?", [
        finalImageUrl,
        productId,
      ]);

      return res.status(201).json({
        message: "Product created successfully",
        productId: productId,
      });
    }

    // No file upload, use provided URL
    const [result] = await connection.query(
      `INSERT INTO products (name, description, short_description, price, stock, category_id, image_url, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description,
        short_description,
        price,
        stock || 0,
        category_id,
        finalImageUrl,
        userId,
      ],
    );

    res.status(201).json({
      message: "Product created successfully",
      productId: result.insertId,
    });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

const updateProduct = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const {
      name,
      description,
      short_description,
      price,
      stock,
      category_id,
      image_url,
      status,
    } = req.body;

    // Get current product data
    const [currentProduct] = await connection.query(
      "SELECT image_url FROM products WHERE id = ? AND deleted_at IS NULL",
      [id],
    );

    if (currentProduct.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    let finalImageUrl = image_url;

    // If new file was uploaded
    if (req.file) {
      // ← IMPORTANTE: Check if multer received a file
      // Delete old image if it exists and is a local file
      if (currentProduct[0].image_url) {
        deleteOldImage(currentProduct[0].image_url);
      }

      // Move new file to product folder
      finalImageUrl = moveFileToProductFolder(req.file.path, id);
    }

    const [result] = await connection.query(
      `UPDATE products 
      SET name = ?, description = ?, short_description = ?, price = ?, stock = ?, 
          category_id = ?, image_url = ?, status = ?
      WHERE id = ? AND deleted_at IS NULL`,
      [
        name,
        description,
        short_description,
        price,
        stock,
        category_id,
        finalImageUrl,
        status,
        id,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product updated successfully" });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

const deleteProduct = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;

    // Get product data before deleting
    const [product] = await connection.query(
      "SELECT image_url FROM products WHERE id = ?",
      [id],
    );

    // Soft delete
    const [result] = await connection.query(
      "UPDATE products SET deleted_at = NOW() WHERE id = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete product folder and images
    deleteProductFolder(id);

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

const getCategories = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const [categories] = await connection.query(
      "SELECT * FROM product_categories ORDER BY name",
    );

    res.json({ categories });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
};
