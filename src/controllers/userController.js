const { hashPassword } = require("../utils/bcrypt");

const getUsers = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { role, status, limit = 50, offset = 0 } = req.query;

    let query =
      "SELECT id, name, email, role, status, created_at FROM users WHERE deleted_at IS NULL";
    const params = [];

    if (role) {
      query += " AND role = ?";
      params.push(role);
    }

    if (status) {
      query += " AND status = ?";
      params.push(status);
    }

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
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
      "SELECT id, name, email, role, status, created_at FROM users WHERE id = ? AND deleted_at IS NULL",
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
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const hashedPassword = await hashPassword(password);

    const [result] = await connection.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role]
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

    const [result] = await connection.query(
      "UPDATE users SET name = ?, email = ?, role = ?, status = ? WHERE id = ? AND deleted_at IS NULL",
      [name, email, role, status, id]
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
