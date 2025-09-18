

// import express from "express";
// import cors from "cors";
// import { db, createTables } from "./db.js";

// const app = express();
// const PORT = 3000;

// app.use(cors());
// app.use(express.json());

// // Initialize database tables
// createTables();

// // --- API ROUTES ---

// // Test route
// app.get("/", (req, res) => {
//   res.json({ message: "Backend is running 🚀" });
// });

// // --- INVENTORY API ---

// // Get all products
// app.get("/inventory", (req, res) => {
//   try {
//     // ✅ Include purchase_price
//     const rows = db.prepare("SELECT * FROM products").all();
//     res.json(rows);
//   } catch (error) {
//     console.error("❌ Error fetching inventory:", error);
//     res.status(500).json({ error: "Failed to fetch inventory" });
//   }
// });

// // Add a product
// app.post("/inventory", (req, res) => {
//   console.log("🟢 Incoming Body:", req.body);

//   const { article, name, color, size, quantity, mrp, purchase_price = 0 } = req.body;

//   if (!article?.trim() || !name?.trim() || quantity === undefined || mrp === undefined) {
//     return res.status(400).json({ error: "Article, Name, Quantity and MRP are required" });
//   }

//   try {
//     const stmt = db.prepare(
//       "INSERT INTO products (article, name, color, size, quantity, mrp, purchase_price) VALUES (?, ?, ?, ?, ?, ?, ?)"
//     );
//     const result = stmt.run(article, name, color, size, quantity, mrp, purchase_price);

//     res.json({
//       id: result.lastInsertRowid,
//       message: "✅ Product added successfully",
//     });
//   } catch (error) {
//     console.error("❌ Error inserting product:", error);
//     res.status(500).json({ error: "Failed to add product" });
//   }
// });

// // Update product
// app.put("/inventory/:id", (req, res) => {
//   const { id } = req.params;
//   const { article, name, color, size, quantity, mrp, purchase_price = 0 } = req.body;

//   if (!article?.trim() || !name?.trim() || quantity === undefined || mrp === undefined) {
//     return res.status(400).json({ error: "Article, Name, Quantity and MRP are required" });
//   }

//   const stmt = db.prepare(`
//     UPDATE products 
//     SET article=?, name=?, color=?, size=?, quantity=?, mrp=?, purchase_price=? 
//     WHERE id=?
//   `);
//   const result = stmt.run(article, name, color, size, quantity, mrp, purchase_price, id);

//   res.json({ updated: result.changes, message: "✅ Product updated" });
// });

// // Delete product
// app.delete("/inventory/:id", (req, res) => {
//   const { id } = req.params;
//   const stmt = db.prepare("DELETE FROM products WHERE id=?");
//   const result = stmt.run(id);
//   res.json({ deleted: result.changes, message: "🗑️ Product deleted" });
// });

// // --- SALES API ---
// app.post("/sales", (req, res) => {
//   const { items, total } = req.body;

//   if (!items || !Array.isArray(items) || total === undefined) {
//     return res.status(400).json({ error: "Invalid sale data" });
//   }

//   const getStock = db.prepare("SELECT quantity FROM products WHERE id=?");
//   const updateStock = db.prepare("UPDATE products SET quantity = quantity - ? WHERE id = ?");

//   for (const item of items) {
//     const product = getStock.get(item.id);
//     if (!product || product.quantity < item.qty) {
//       return res.status(400).json({ error: `Not enough stock for product ID ${item.id}` });
//     }
//   }

//   const stmt = db.prepare("INSERT INTO sales (items, total, date) VALUES (?, ?, ?)");
//   const result = stmt.run(JSON.stringify(items), total, new Date().toISOString());

//   for (const item of items) {
//     updateStock.run(item.qty, item.id);
//   }

//   res.json({ id: result.lastInsertRowid, message: "✅ Sale saved" });
// });

// app.get("/sales", (req, res) => {
//   const { start, end } = req.query;

//   let query = "SELECT * FROM sales";
//   let params = [];

//   if (start && end) {
//     query += " WHERE date BETWEEN ? AND ?";
//     params = [start, end];
//   }

//   const rows = db.prepare(query).all(...params);
//   res.json(rows);
// });

// // --- SETTINGS API ---
// app.get("/settings", (req, res) => {
//   const row = db.prepare("SELECT * FROM settings WHERE id = 1").get();
//   res.json(row || {});
// });

// app.post("/settings", (req, res) => {
//   const { shop_name, gst_number } = req.body;
//   db.prepare("INSERT OR REPLACE INTO settings (id, shop_name, gst_number) VALUES (1, ?, ?)")
//     .run(shop_name, gst_number);
//   res.json({ message: "✅ Settings saved" });
// });

// // --- LOW STOCK API ---
// app.get("/inventory/low-stock", (req, res) => {
//   const limit = parseInt(req.query.limit) || 2;
//   const rows = db.prepare("SELECT * FROM products WHERE quantity < ?").all(limit);
//   res.json(rows);
// });

// // --- START SERVER ---
// app.listen(PORT, () => {
//   console.log(`✅ Backend running at http://localhost:${PORT}`);
// });




// server.js
import express from "express";
import cors from "cors";
import { db, createTables } from "./db.js";

const app = express();
const PORT = process.env.PORT || 3000; // ✅ dynamic port for Render

app.use(cors({ origin: "*" })); // ✅ allow requests from any origin
app.use(express.json());

// Initialize database tables
createTables();

// --- HEALTH CHECK ROUTE ---
app.get("/", (req, res) => {
  res.json({ message: "✅ Footwear POS Backend is live!" });
});

// --- INVENTORY API ---

// Get all products
app.get("/inventory", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM products").all();
    res.json(rows);
  } catch (error) {
    console.error("❌ Error fetching inventory:", error);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

// Add a product
app.post("/inventory", (req, res) => {
  const { article, name, color, size, quantity, mrp, purchase_price = 0 } = req.body;

  if (!article?.trim() || !name?.trim() || quantity === undefined || mrp === undefined) {
    return res.status(400).json({ error: "Article, Name, Quantity and MRP are required" });
  }

  try {
    const stmt = db.prepare(
      "INSERT INTO products (article, name, color, size, quantity, mrp, purchase_price) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    const result = stmt.run(article, name, color, size, quantity, mrp, purchase_price);

    res.json({
      id: result.lastInsertRowid,
      message: "✅ Product added successfully",
    });
  } catch (error) {
    console.error("❌ Error inserting product:", error);
    res.status(500).json({ error: "Failed to add product" });
  }
});

// Update product
app.put("/inventory/:id", (req, res) => {
  const { id } = req.params;
  const { article, name, color, size, quantity, mrp, purchase_price = 0 } = req.body;

  if (!article?.trim() || !name?.trim() || quantity === undefined || mrp === undefined) {
    return res.status(400).json({ error: "Article, Name, Quantity and MRP are required" });
  }

  try {
    const stmt = db.prepare(`
      UPDATE products 
      SET article=?, name=?, color=?, size=?, quantity=?, mrp=?, purchase_price=? 
      WHERE id=?
    `);
    const result = stmt.run(article, name, color, size, quantity, mrp, purchase_price, id);

    res.json({ updated: result.changes, message: "✅ Product updated" });
  } catch (error) {
    console.error("❌ Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// Delete product
app.delete("/inventory/:id", (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare("DELETE FROM products WHERE id=?");
    const result = stmt.run(id);
    res.json({ deleted: result.changes, message: "🗑️ Product deleted" });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// --- SALES API ---
app.post("/sales", (req, res) => {
  const { items, total } = req.body;

  if (!items || !Array.isArray(items) || total === undefined) {
    return res.status(400).json({ error: "Invalid sale data" });
  }

  try {
    const getStock = db.prepare("SELECT quantity FROM products WHERE id=?");
    const updateStock = db.prepare("UPDATE products SET quantity = quantity - ? WHERE id = ?");

    for (const item of items) {
      const product = getStock.get(item.id);
      if (!product || product.quantity < item.qty) {
        return res.status(400).json({ error: `Not enough stock for product ID ${item.id}` });
      }
    }

    const stmt = db.prepare("INSERT INTO sales (items, total, date) VALUES (?, ?, ?)");
    const result = stmt.run(JSON.stringify(items), total, new Date().toISOString());

    for (const item of items) {
      updateStock.run(item.qty, item.id);
    }

    res.json({ id: result.lastInsertRowid, message: "✅ Sale saved" });
  } catch (error) {
    console.error("❌ Error saving sale:", error);
    res.status(500).json({ error: "Failed to save sale" });
  }
});

app.get("/sales", (req, res) => {
  try {
    const { start, end } = req.query;

    let query = "SELECT * FROM sales";
    let params = [];

    if (start && end) {
      query += " WHERE date BETWEEN ? AND ?";
      params = [start, end];
    }

    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch (error) {
    console.error("❌ Error fetching sales:", error);
    res.status(500).json({ error: "Failed to fetch sales" });
  }
});

// --- SETTINGS API ---
app.get("/settings", (req, res) => {
  try {
    const row = db.prepare("SELECT * FROM settings WHERE id = 1").get();
    res.json(row || {});
  } catch (error) {
    console.error("❌ Error fetching settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

app.post("/settings", (req, res) => {
  try {
    const { shop_name, gst_number } = req.body;
    db.prepare("INSERT OR REPLACE INTO settings (id, shop_name, gst_number) VALUES (1, ?, ?)")
      .run(shop_name, gst_number);
    res.json({ message: "✅ Settings saved" });
  } catch (error) {
    console.error("❌ Error saving settings:", error);
    res.status(500).json({ error: "Failed to save settings" });
  }
});

// --- LOW STOCK API ---
app.get("/inventory/low-stock", (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 2;
    const rows = db.prepare("SELECT * FROM products WHERE quantity < ?").all(limit);
    res.json(rows);
  } catch (error) {
    console.error("❌ Error fetching low stock:", error);
    res.status(500).json({ error: "Failed to fetch low stock products" });
  }
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
