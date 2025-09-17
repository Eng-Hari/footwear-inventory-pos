

const express = require("express");
const router = express.Router();
const { db } = require("./db");

router.get("/", (req, res) => {
  try {
    const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get();
    console.log("📤 Sending settings to frontend:", settings);
    res.json(settings || { shop_name: "", gst_number: "", contact_number: "", address: "" });
  } catch (err) {
    console.error("❌ Error fetching settings:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", (req, res) => {
  try {
    const { shop_name, gst_number, contact_number, address } = req.body;
    console.log("📥 Received settings payload:", req.body);
    if (!shop_name?.trim()) {
      return res.status(400).json({ message: "Shop name is required" });
    }
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO settings (id, shop_name, gst_number, contact_number, address)
      VALUES (1, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      shop_name || "",
      gst_number || "",
      contact_number || "",
      address || ""
    );
    const updatedSettings = db.prepare("SELECT * FROM settings WHERE id = 1").get();
    console.log("💾 Settings saved to SQLite:", updatedSettings);
    res.json({ message: "✅ Settings saved", settings: updatedSettings });
  } catch (err) {
    console.error("❌ Error saving settings:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;