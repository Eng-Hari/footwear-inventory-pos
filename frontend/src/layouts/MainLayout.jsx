

import { Home, Package, BarChart2, PlusSquare, Settings } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const menu = [
  { name: "Home", icon: <Home size={18} />, path: "/" },
  { name: "Inventory", icon: <Package size={18} />, path: "/inventory" },
  { name: "Add Stock", icon: <PlusSquare size={18} />, path: "/add-stock" },
  { name: "Sales Report", icon: <BarChart2 size={18} />, path: "/sales-report" },
  { name: "Settings", icon: <Settings size={18} />, path: "/settings" },
];

export default function MainLayout() {
  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 flex">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white/80 backdrop-blur-sm border-r border-gray-100 shadow-sm p-4 flex flex-col">

        {/* LOGO */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
            <Package size={18} className="text-white" />
          </div>
          <h1 className="text-sm font-semibold text-gray-800">
            Footwear POS
          </h1>
        </div>

        {/* NAV */}
        <nav className="flex flex-col gap-1">
          {menu.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>

        {/* FOOTER */}
        <div className="mt-auto pt-6 text-xs text-gray-400">
          © {new Date().getFullYear()} POS System
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">

        {/* TOPBAR */}
        <div className="h-14 flex items-center justify-between px-6 border-b border-gray-100 bg-white/70 backdrop-blur-sm">
          <h2 className="text-sm font-semibold text-gray-700">
            Dashboard
          </h2>
        </div>

        {/* CONTENT */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* NAV ITEM COMPONENT */
function NavItem({ item }) {
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
        ${
          isActive
            ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
        }`
      }
    >
      <span className="opacity-80">{item.icon}</span>
      {item.name}
    </NavLink>
  );
}
