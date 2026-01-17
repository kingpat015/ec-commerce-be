const mysql = require("mysql2/promise");
require("dotenv").config();

const migrations = [
  require("./000_create_roles"),
  require("./001_create_users"),
  require("./002_create_product_categories"),
  require("./003_create_products"),
  require("./004_create_bulletins"),
  require("./005_create_refresh_tokens"),
  require("./006_create_contact_submissions"),
];

async function runMigrations() {
  let connection;

  try {
    // STEP 1: Connect WITHOUT database to create it first
    console.log("Connecting to MySQL server...");
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });

    // STEP 2: Create database if it doesn't exist
    console.log(`Creating database '${process.env.DB_NAME}' if not exists...`);
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`,
    );
    console.log("Database ready!");

    // Close connection
    await connection.end();

    // STEP 3: Now run migrations with database selected
    console.log("Running migrations...");

    for (const migration of migrations) {
      try {
        console.log(`Running migration: ${migration.name || "unnamed"}...`);
        await migration.up();
        console.log("✓ Migration completed");
      } catch (error) {
        console.error("Migration failed:", error);
        throw error;
      }
    }

    console.log("All migrations completed successfully ✓");
    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
}

runMigrations().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
