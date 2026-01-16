const pool = require("../config/database");

async function up() {
  const connection = await pool.getConnection();

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role_id INT DEFAULT 5,
        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (role_id) REFERENCES roles(id),
        INDEX idx_email (email),
        INDEX idx_role_id (role_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log("Users table created successfully");
  } finally {
    connection.release();
  }
}

async function down() {
  const connection = await pool.getConnection();

  try {
    await connection.query("DROP TABLE IF EXISTS users");
    console.log("Users table dropped successfully");
  } finally {
    connection.release();
  }
}

module.exports = { up, down };
