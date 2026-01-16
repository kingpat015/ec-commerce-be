const pool = require("../config/database");

const getProducts = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { category, search, limit = 20, offset = 0 } = req.query;
    const isAuthenticated = !!req.user;

    let query = `
      SELECT 
        p.id, p.name, 
        ${
          isAuthenticated
            ? "p.description, p.price, p.stock,"
            : "p.short_description,"
        }
        p.image_url, p.status,
        pc.name as category_name,
        p.created_at
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

    res.json({
      products,
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
      [id]
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

    const [result] = await connection.query(
      `
      INSERT INTO products (name, description, short_description, price, stock, category_id, image_url, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        name,
        description,
        short_description,
        price,
        stock || 0,
        category_id,
        image_url,
        userId,
      ]
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

    const [result] = await connection.query(
      `
      UPDATE products 
      SET name = ?, description = ?, short_description = ?, price = ?, stock = ?, 
          category_id = ?, image_url = ?, status = ?
      WHERE id = ? AND deleted_at IS NULL
    `,
      [
        name,
        description,
        short_description,
        price,
        stock,
        category_id,
        image_url,
        status,
        id,
      ]
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

    // Soft delete
    const [result] = await connection.query(
      "UPDATE products SET deleted_at = NOW() WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

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
      "SELECT * FROM product_categories ORDER BY name"
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
