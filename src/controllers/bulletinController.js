const pool = require("../config/database");

const getBulletins = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { type, limit = 20, offset = 0 } = req.query;
    const isAuthenticated = !!req.user;

    let query = `
      SELECT 
        b.id, b.type, b.title,
        ${isAuthenticated ? "b.description," : "b.short_description,"}
        b.event_date, b.location, b.status, b.created_at,
        u.name as created_by_name
      FROM bulletins b
      LEFT JOIN users u ON b.created_by = u.id
      WHERE b.deleted_at IS NULL AND b.status = 'published'
    `;

    const params = [];

    if (type) {
      query += " AND b.type = ?";
      params.push(type);
    }

    query += " ORDER BY b.created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const [bulletins] = await connection.query(query, params);

    res.json({
      bulletins,
      authenticated: isAuthenticated,
    });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

const getBulletinById = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const isAuthenticated = !!req.user;

    if (!isAuthenticated) {
      return res.status(401).json({
        message: "Please login to view full bulletin details",
      });
    }

    const [bulletins] = await connection.query(
      `
      SELECT 
        b.*,
        u.name as created_by_name
      FROM bulletins b
      LEFT JOIN users u ON b.created_by = u.id
      WHERE b.id = ? AND b.deleted_at IS NULL
    `,
      [id]
    );

    if (bulletins.length === 0) {
      return res.status(404).json({ message: "Bulletin not found" });
    }

    res.json({ bulletin: bulletins[0] });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

const createBulletin = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const {
      type,
      title,
      description,
      short_description,
      event_date,
      location,
    } = req.body;
    const userId = req.user.userId;

    if (!type || !title || !description) {
      return res
        .status(400)
        .json({ message: "Type, title, and description are required" });
    }

    const [result] = await connection.query(
      `
      INSERT INTO bulletins (type, title, description, short_description, event_date, location, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        type,
        title,
        description,
        short_description,
        event_date,
        location,
        userId,
      ]
    );

    res.status(201).json({
      message: "Bulletin created successfully",
      bulletinId: result.insertId,
    });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

const updateBulletin = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const {
      type,
      title,
      description,
      short_description,
      event_date,
      location,
      status,
    } = req.body;

    const [result] = await connection.query(
      `
      UPDATE bulletins 
      SET type = ?, title = ?, description = ?, short_description = ?, 
          event_date = ?, location = ?, status = ?
      WHERE id = ? AND deleted_at IS NULL
    `,
      [
        type,
        title,
        description,
        short_description,
        event_date,
        location,
        status,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Bulletin not found" });
    }

    res.json({ message: "Bulletin updated successfully" });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

const deleteBulletin = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;

    const [result] = await connection.query(
      "UPDATE bulletins SET deleted_at = NOW() WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Bulletin not found" });
    }

    res.json({ message: "Bulletin deleted successfully" });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

module.exports = {
  getBulletins,
  getBulletinById,
  createBulletin,
  updateBulletin,
  deleteBulletin,
};
