// backend/index.js
import express from "express";
import cors from "cors";

const app = express();

// ✅ Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// ✅ Root route (important for Render health check)
app.get("/", (req, res) => {
  res.send("✅ Footwear POS Backend is running!");
});

// ✅ Placeholder API route (replace with real ones)
app.get("/api/test", (req, res) => {
  res.json({ message: "API working fine 🚀" });
});

// ✅ Use dynamic port for Render / 3000 for local
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
