// 000_create_roles.js
const pool = require("../config/database");

async function up() {
  const connection = await pool.getConnection();

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        permissions JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Insert default roles based on your system
    await connection.query(`
      INSERT INTO roles (id, name, description, permissions) VALUES
        (1, 'admin', 'Administrator with full system access', '["all"]'),
        (2, 'hr_user', 'HR User - manage employees and HR operations', '["manage_users", "view_reports", "manage_hr"]'),
        (3, 'sales_user', 'Sales User - manage products and orders', '["manage_products", "manage_orders", "view_sales_reports"]'),
        (4, 'user', 'Regular User - basic access', '["view_products", "view_orders"]'),
        (5, 'customer_user', 'Customer - can browse and purchase', '["view_products", "place_orders", "view_own_orders"]')
      ON DUPLICATE KEY UPDATE name=name;
    `);

    console.log("Roles table created and seeded successfully");
  } finally {
    connection.release();
  }
}

async function down() {
  const connection = await pool.getConnection();

  try {
    await connection.query("DROP TABLE IF EXISTS roles");
    console.log("Roles table dropped successfully");
  } finally {
    connection.release();
  }
}

module.exports = { up, down };
