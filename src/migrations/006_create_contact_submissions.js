const pool = require("../config/database");

const up = async () => {
  const connection = await pool.getConnection();

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subject VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status ENUM('new', 'read', 'replied', 'archived') DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log("✅ Contact submissions table created successfully");
  } catch (error) {
    console.error("❌ Error creating contact submissions table:", error);
    throw error;
  } finally {
    connection.release();
  }
};

const down = async () => {
  const connection = await pool.getConnection();

  try {
    await connection.query("DROP TABLE IF EXISTS contact_submissions");
    console.log("✅ Contact submissions table dropped successfully");
  } catch (error) {
    console.error("❌ Error dropping contact submissions table:", error);
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = { up, down };
