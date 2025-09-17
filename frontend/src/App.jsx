import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Sidebar from "./components/Sidebar";

import Home from "./pages/Home";
import Inventory from "./pages/Inventory";
import AddStock from "./pages/AddStock";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import LowStock from "./pages/LowStock";

// Mock User (Replace with real auth later)
const mockUser = {
  name: "Admin",
  role: "admin", // can be "admin" or "cashier"
};

export default function App() {
  const [inventory, setInventory] = useState([]);
  const [user, setUser] = useState(mockUser);

  // Simulate fetch from backend / local DB (later replace with real API call)
  useEffect(() => {
    setInventory([
      { id: 1, article: "A123", name: "Shoes", color: "Black", size: 8, quantity: 10, mrp: 999 },
      { id: 2, article: "B234", name: "Sandal", color: "White", size: 9, quantity: 1, mrp: 1099 },
      { id: 3, article: "C345", name: "Loafers", color: "Brown", size: 7, quantity: 0, mrp: 1299 },
    ]);
  }, []);

  // Update inventory after add/remove stock
  const saveToDB = (newItems) => setInventory(newItems);

  return (
    <Router>
      <div className="flex min-h-screen bg-gray-100">
        {user && <Sidebar user={user} />}

        <main className="flex-1 p-6">
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login onLogin={(u) => setUser(u)} />} />

            {/* Protected Routes */}
            <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
            <Route
              path="/inventory"
              element={user ? <Inventory products={inventory} /> : <Navigate to="/login" />}
            />
            <Route
              path="/add-stock"
              element={
                user?.role === "admin" ? (
                  <AddStock saveToDB={saveToDB} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/reports"
              element={user?.role === "admin" ? <Reports /> : <Navigate to="/" />}
            />
            <Route
              path="/settings"
              element={user?.role === "admin" ? <Settings /> : <Navigate to="/" />}
            />
            <Route
              path="/low-stock"
              element={user ? <LowStock inventory={inventory} /> : <Navigate to="/login" />}
            />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
