

import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4">
        <h1 className="text-2xl font-bold mb-6">Footwear POS</h1>
        <nav className="flex flex-col space-y-3">
          <Link
            to="/"
            className="px-3 py-2 rounded hover:bg-gray-200 transition"
          >
            Home
          </Link>
          <Link
            to="/inventory"
            className="px-3 py-2 rounded hover:bg-gray-200 transition"
          >
            Inventory
          </Link>
          <Link
            to="/add-stock"
            className="px-3 py-2 rounded hover:bg-gray-200 transition"
          >
            Add Stock
          </Link>
          <Link
            to="/reports"
            className="px-3 py-2 rounded hover:bg-gray-200 transition"
          >
            Reports
          </Link>
          <Link
            to="/settings"
            className="px-3 py-2 rounded hover:bg-gray-200 transition"
          >
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
