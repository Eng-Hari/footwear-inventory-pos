import { Link, useLocation } from "react-router-dom";
import { Home, Package, PlusCircle, BarChart2, Settings } from "lucide-react";

const menuItems = [
  { path: "/", label: "Home", icon: <Home size={20} />, roles: ["admin", "cashier"] },
  { path: "/inventory", label: "Inventory", icon: <Package size={20} />, roles: ["admin"] },
  { path: "/low-stock", label: "Low Stock", icon: <Package size={20} />, roles: ["admin"] },
  { path: "/add-stock", label: "Add Stock", icon: <PlusCircle size={20} />, roles: ["admin"] },
  { path: "/reports", label: "Sales Report", icon: <BarChart2 size={20} />, roles: ["admin"] },
  { path: "/settings", label: "Settings", icon: <Settings size={20} />, roles: ["admin"] },
];

export default function Sidebar({ user = { name: "Guest", role: "cashier" }, inventory = [] }) {
  const location = useLocation();

  return (
    <aside className="w-64 min-h-screen bg-white shadow-md flex flex-col">
      {/* App Logo / Title */}
      <div className="flex items-center justify-center gap-2 py-6 border-b">
        <Package size={24} className="text-blue-600" />
        <h1 className="text-xl font-bold tracking-wide">Footwear Inventory</h1>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems
          .filter(item => item.roles.includes(user.role))
          .map(item => {
            const isActive =
              location.pathname === item.path ||
              location.pathname.startsWith(item.path + "/");

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200
                ${isActive ? "bg-blue-100 text-blue-700 font-semibold" : "hover:bg-gray-100 text-gray-700"}`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
      </nav>

      {/* Footer / User Info */}
      <div className="p-4 border-t text-sm text-gray-500">
        Logged in as: <span className="font-semibold">{user.name}</span>
      </div>
    </aside>
  );
}