import { Home, Package, BarChart2, PlusSquare, Settings } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const menu = [
  { name: "Home", icon: <Home size={20} />, path: "/" },
  { name: "Inventory", icon: <Package size={20} />, path: "/inventory" },
  { name: "Add Stock", icon: <PlusSquare size={20} />, path: "/add-stock" },
  { name: "Sales Report", icon: <BarChart2 size={20} />, path: "/sales-report" },
  { name: "Settings", icon: <Settings size={20} />, path: "/settings" },
];

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-60 bg-white shadow-md p-4 flex flex-col">
        <h1 className="text-xl font-bold mb-6 text-blue-600">Footwear POS</h1>
        <nav className="flex flex-col gap-2">
          {menu.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-100 ${
                  isActive ? "bg-blue-200 text-blue-700" : "text-gray-700"
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
