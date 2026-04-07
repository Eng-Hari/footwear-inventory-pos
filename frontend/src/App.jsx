

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Sidebar from "./components/Sidebar";

import Home from "./pages/Home/Home";
import Inventory from "./pages/Inventory/Inventory";
// import AddStock from "./pages/AddStock";
import AddStock from "./pages/AddStock/AddStock";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import LowStock from "./pages/LowStock";

const mockUser = {
  name: "Admin",
  role: "admin",
};

export default function App() {
  const [inventory, setInventory] = useState([]);
  const [user, setUser] = useState(mockUser);
// const [user, setUser] = useState(null);
  useEffect(() => {
    setInventory([
      { id: 1, article: "A123", name: "Shoes", color: "Black", size: 8, quantity: 10, mrp: 999 },
      { id: 2, article: "B234", name: "Sandal", color: "White", size: 9, quantity: 1, mrp: 1099 },
      { id: 3, article: "C345", name: "Loafers", color: "Brown", size: 7, quantity: 0, mrp: 1299 },
    ]);
  }, []);

  const saveToDB = (newItems) => setInventory(newItems);

  return (
    <Router>
      {/* overflow-hidden */}
<div className="h-screen flex bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100">        {/* SIDEBAR */}
        {user && (
          // h-screen
          <div className="hidden sm:block ">
            <Sidebar user={user} />
          </div>
        )}

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col">

          {/* TOP BAR */}
          {user && (
            <div className="h-14 flex items-center justify-between px-6 border-b border-gray-100 bg-white/70 backdrop-blur-sm">
              <h1 className="text-sm font-semibold text-gray-700">
                Footwear Inventory
              </h1>

              <div className="text-xs text-gray-500">
                Welcome, <span className="font-medium text-gray-700">{user.name}</span>
              </div>
            </div>
          )}

          {/* PAGE CONTENT */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <Routes>
              {/* PUBLIC */}
              <Route
                path="/login"
                element={<Login onLogin={(u) => setUser(u)} />}
              />

              {/* PROTECTED */}
              <Route
                path="/"
                element={user ? <Home /> : <Navigate to="/login" />}
              />

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

              {/* 404 */}
              <Route path="*" element={<NotFound />} />

            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}