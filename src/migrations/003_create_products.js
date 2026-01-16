const pool = require("../config/database");

async function up() {
  const connection = await pool.getConnection();

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        short_description VARCHAR(500),
        price DECIMAL(10, 2) NOT NULL,
        stock INT DEFAULT 0,
        category_id INT,
        image_url VARCHAR(500),
        status ENUM('active', 'inactive', 'out_of_stock') DEFAULT 'active',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_category (category_id),
        INDEX idx_status (status),
        INDEX idx_price (price)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log("Products table created successfully");
  } finally {
    connection.release();
  }
}

async function down() {
  const connection = await pool.getConnection();

  try {
    await connection.query("DROP TABLE IF EXISTS products");
    console.log("Products table dropped successfully");
  } finally {
    connection.release();
  }
}

module.exports = { up, down };
