const pool = require("../config/database");

async function up() {
  const connection = await pool.getConnection();

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        slug VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slug (slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log("Product categories table created successfully");
  } finally {
    connection.release();
  }
}

async function down() {
  const connection = await pool.getConnection();

  try {
    await connection.query("DROP TABLE IF EXISTS product_categories");
    console.log("Product categories table dropped successfully");
  } finally {
    connection.release();
  }
}

module.exports = { up, down };
