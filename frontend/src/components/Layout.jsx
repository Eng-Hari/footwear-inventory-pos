
import { NavLink, Outlet } from "react-router-dom";
import {
  HomeIcon,
  ArchiveBoxIcon,
  PlusCircleIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const menu = [
  { name: "Home", path: "/", icon: <HomeIcon className="w-4 h-4" /> },
  { name: "Inventory", path: "/inventory", icon: <ArchiveBoxIcon className="w-4 h-4" /> },
  { name: "Add Stock", path: "/add-stock", icon: <PlusCircleIcon className="w-4 h-4" /> },
  { name: "Reports", path: "/reports", icon: <ChartBarIcon className="w-4 h-4" /> },
  { name: "Settings", path: "/settings", icon: <Cog6ToothIcon className="w-4 h-4" /> },
];

export default function Layout() {
  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 flex">

      {/* SIDEBAR (FIXED HEIGHT) */}
      <aside className="w-64 h-screen bg-white/80 backdrop-blur-sm border-r border-gray-100 shadow-sm p-4 flex flex-col">

        {/* LOGO */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
            <ArchiveBoxIcon className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-sm font-semibold text-gray-800">
            Footwear POS
          </h1>
        </div>

        {/* NAVIGATION */}
        <nav className="flex flex-col gap-1">
          {menu.map((item) => (
            <NavLink
              key={item.name}
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
          ))}
        </nav>

        {/* FOOTER */}
        <div className="mt-auto pt-6 text-xs text-gray-400">
          © {new Date().getFullYear()} POS System
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col h-screen">

        {/* TOPBAR */}
        <div className="h-14 flex items-center justify-between px-6 border-b border-gray-100 bg-white/70 backdrop-blur-sm">
          <h2 className="text-sm font-semibold text-gray-700">
            Dashboard
          </h2>
        </div>

        {/* CONTENT (ONLY THIS SCROLLS) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}