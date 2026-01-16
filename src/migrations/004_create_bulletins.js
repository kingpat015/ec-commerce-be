const pool = require("../config/database");

async function up() {
  const connection = await pool.getConnection();

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bulletins (
        id INT PRIMARY KEY AUTO_INCREMENT,
        type ENUM('event', 'hiring', 'announcement') NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        short_description VARCHAR(500),
        event_date DATE,
        location VARCHAR(255),
        created_by INT,
        status ENUM('draft', 'published', 'archived') DEFAULT 'published',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_type (type),
        INDEX idx_status (status),
        INDEX idx_event_date (event_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log("Bulletins table created successfully");
  } finally {
    connection.release();
  }
}

async function down() {
  const connection = await pool.getConnection();

  try {
    await connection.query("DROP TABLE IF EXISTS bulletins");
    console.log("Bulletins table dropped successfully");
  } finally {
    connection.release();
  }
}

module.exports = { up, down };
