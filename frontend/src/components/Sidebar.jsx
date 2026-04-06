
import { Link, useLocation } from "react-router-dom";
import { Home, Package, PlusCircle, BarChart2, Settings } from "lucide-react";

const menuItems = [
  { path: "/", label: "Home", icon: <Home size={18} />, roles: ["admin", "cashier"] },
  { path: "/inventory", label: "Inventory", icon: <Package size={18} />, roles: ["admin"] },
  { path: "/low-stock", label: "Low Stock", icon: <Package size={18} />, roles: ["admin"] },
  { path: "/add-stock", label: "Add Stock", icon: <PlusCircle size={18} />, roles: ["admin"] },
  { path: "/reports", label: "Sales Report", icon: <BarChart2 size={18} />, roles: ["admin"] },
  { path: "/settings", label: "Settings", icon: <Settings size={18} />, roles: ["admin"] },
];

export default function Sidebar({
  user = { name: "Guest", role: "cashier" },
}) {
  const location = useLocation();

  return (
    <aside className="w-52 min-h-screen bg-white/80 backdrop-blur-sm border-r border-gray-100 shadow-sm flex flex-col">

      {/* HEADER */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-gray-100">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
          <Package size={18} className="text-white" />
        </div>
        <h1 className="text-sm font-semibold text-gray-800 tracking-wide">
          Footwear POS
        </h1>
      </div>

      {/* MENU */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems
          .filter((item) => item.roles.includes(user.role))
          .map((item) => {
            const isActive =
              location.pathname === item.path ||
              location.pathname.startsWith(item.path + "/");

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${
                  isActive
                    ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                }`}
              >
                <span className="opacity-80">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
      </nav>

      {/* FOOTER */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="text-xs text-gray-400 mb-1">Logged in as</div>
        <div className="text-sm font-semibold text-gray-700">
          {user.name}
        </div>
      </div>
    </aside>
  );
}