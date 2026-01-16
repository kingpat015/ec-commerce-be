const pool = require("../config/database");
const { hashPassword, comparePassword } = require("../utils/bcrypt");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");

const register = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email already exists
    const [existing] = await connection.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await hashPassword(password);

    // Get customer role id
    const [roles] = await connection.query(
      "SELECT id FROM roles WHERE name = 'customer'"
    );

    const customerRoleId = roles[0]?.id;

    // Insert user with customer role
    const [result] = await connection.query(
      "INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, customerRoleId]
    );

    res.status(201).json({
      message: "User registered successfully",
      userId: result.insertId,
    });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

const login = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Get user with role name from roles table
    const [users] = await connection.query(
      `SELECT u.id, u.name, u.email, u.password, u.role_id, u.status, r.name as role_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.email = ? AND u.deleted_at IS NULL`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];

    if (user.status !== "active") {
      return res.status(403).json({ message: "Account is not active" });
    }

    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(
      user.id,
      user.role_name || "customer"
    );
    const refreshToken = generateRefreshToken(user.id);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await connection.query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
      [user.id, refreshToken, expiresAt]
    );

    res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role_name || "customer",
      },
    });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

const logout = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await connection.query("DELETE FROM refresh_tokens WHERE token = ?", [
        refreshToken,
      ]);
    }

    res.json({ message: "Logout successful" });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

module.exports = { register, login, logout };
