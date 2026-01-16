const pool = require("../config/database");
const { hashPassword } = require("../utils/bcrypt");

const getUsers = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { role, status, limit = 50, offset = 0 } = req.query;

    // JOIN with roles table to get role name
    let query = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.role_id,
        r.name as role,
        u.status, 
        u.created_at 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.deleted_at IS NULL
    `;
    const params = [];

    // Filter by role name if provided
    if (role) {
      query += " AND r.name = ?";
      params.push(role);
    }

    if (status) {
      query += " AND u.status = ?";
      params.push(status);
    }

    query += " ORDER BY u.created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const [users] = await connection.query(query, params);

    res.json({ users });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

const getUserById = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;

    const [users] = await connection.query(
      `SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.role_id,
        r.name as role,
        u.status, 
        u.created_at 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = ? AND u.deleted_at IS NULL`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: users[0] });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

const createUser = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { name, email, password, role, status } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email already exists
    const [existingUsers] = await connection.query(
      "SELECT id FROM users WHERE email = ? AND deleted_at IS NULL",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // Get role_id from role name
    const [roles] = await connection.query(
      "SELECT id FROM roles WHERE name = ?",
      [role]
    );

    if (roles.length === 0) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const role_id = roles[0].id;
    const hashedPassword = await hashPassword(password);

    const [result] = await connection.query(
      "INSERT INTO users (name, email, password, role_id, status) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, role_id, status || "active"]
    );

    res.status(201).json({
      message: "User created successfully",
      userId: result.insertId,
    });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

const updateUser = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const { name, email, role, status } = req.body;

    // Check if user exists
    const [existingUsers] = await connection.query(
      "SELECT id FROM users WHERE id = ? AND deleted_at IS NULL",
      [id]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email is already taken by another user
    const [emailCheck] = await connection.query(
      "SELECT id FROM users WHERE email = ? AND id != ? AND deleted_at IS NULL",
      [email, id]
    );

    if (emailCheck.length > 0) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // Get role_id from role name
    const [roles] = await connection.query(
      "SELECT id FROM roles WHERE name = ?",
      [role]
    );

    if (roles.length === 0) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const role_id = roles[0].id;

    const [result] = await connection.query(
      "UPDATE users SET name = ?, email = ?, role_id = ?, status = ? WHERE id = ? AND deleted_at IS NULL",
      [name, email, role_id, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated successfully" });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

const deleteUser = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;

    // Check if user exists
    const [existingUsers] = await connection.query(
      "SELECT id FROM users WHERE id = ? AND deleted_at IS NULL",
      [id]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const [result] = await connection.query(
      "UPDATE users SET deleted_at = NOW() WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
