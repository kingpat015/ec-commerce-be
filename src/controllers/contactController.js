const pool = require("../config/database");

const createContactSubmission = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { subject, fullName, email, message } = req.body;

    // Validation
    if (!subject || !fullName || !email || !message) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please provide a valid email address",
      });
    }

    const [result] = await connection.query(
      `INSERT INTO contact_submissions (subject, full_name, email, message, status)
       VALUES (?, ?, ?, ?, 'new')`,
      [subject, fullName, email, message],
    );

    res.status(201).json({
      message: "Thank you for contacting us! We'll get back to you soon.",
      submissionId: result.insertId,
    });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

const getContactSubmissions = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        id, subject, full_name, email, message, status, created_at
      FROM contact_submissions
    `;

    const params = [];

    if (status) {
      query += " WHERE status = ?";
      params.push(status);
    }

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const [submissions] = await connection.query(query, params);

    res.json({
      submissions,
    });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

const updateSubmissionStatus = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["new", "read", "replied", "archived"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be one of: new, read, replied, archived",
      });
    }

    const [result] = await connection.query(
      `UPDATE contact_submissions SET status = ? WHERE id = ?`,
      [status, id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Submission not found" });
    }

    res.json({ message: "Status updated successfully" });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

const deleteSubmission = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;

    const [result] = await connection.query(
      "DELETE FROM contact_submissions WHERE id = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Submission not found" });
    }

    res.json({ message: "Submission deleted successfully" });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

module.exports = {
  createContactSubmission,
  getContactSubmissions,
  updateSubmissionStatus,
  deleteSubmission,
};
