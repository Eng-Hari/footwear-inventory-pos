
import Database from "better-sqlite3";

const db = new Database("database.db");

function createTables() {
  // ✅ Create products table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article TEXT,
      name TEXT,
      color TEXT,
      size INTEGER,
      quantity INTEGER,
      mrp REAL,
      purchase_price REAL DEFAULT 0
    )
  `).run();

  // ✅ Safe check for purchase_price column
  try {
    const columns = db.prepare("PRAGMA table_info(products)").all();
    const hasPurchasePrice = columns.some((col) => col.name === "purchase_price");
    if (!hasPurchasePrice) {
      db.prepare("ALTER TABLE products ADD COLUMN purchase_price REAL DEFAULT 0").run();
      console.log("✅ Added missing column: purchase_price");
    }
  } catch (err) {
    console.error("⚠️ Failed to check/alter table:", err);
  }

  // ✅ Create sales table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      items TEXT,
      total REAL,
      date TEXT
    )
  `).run();

  // ✅ Create settings table with GST percentage
  db.prepare(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY,
      shop_name TEXT,
      gst_number TEXT,
      contact_number TEXT,
      address TEXT,
      gst_percent REAL DEFAULT 0
    )
  `).run();

  // ✅ Ensure settings has at least one row with sensible defaults
  try {
    const row = db.prepare("SELECT COUNT(*) as count FROM settings").get();
    if (row.count === 0) {
      db.prepare(`
        INSERT INTO settings (id, shop_name, gst_number, contact_number, address, gst_percent)
        VALUES (1, 'My Shop', '33ABCDE1234F1Z5', '9876543210', 'Main Street, City', 5)
      `).run();
      console.log("✅ Initialized settings table with default row");
    }
  } catch (err) {
    console.error("⚠️ Failed to initialize settings table:", err);
  }
}

export { db, createTables };


