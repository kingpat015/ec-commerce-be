const pool = require("../config/database");

async function up() {
  const connection = await pool.getConnection();

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        token VARCHAR(500) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_token (token(255))
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log("Refresh tokens table created successfully");
  } finally {
    connection.release();
  }
}

async function down() {
  const connection = await pool.getConnection();

  try {
    await connection.query("DROP TABLE IF EXISTS refresh_tokens");
    console.log("Refresh tokens table dropped successfully");
  } finally {
    connection.release();
  }
}

module.exports = { up, down };
