import { 
  ArchiveBoxIcon, 
  CubeIcon, 
  ExclamationTriangleIcon, 
  XMarkIcon, 
  MagnifyingGlassIcon 
} from "@heroicons/react/24/outline";
import { useState } from "react";

// Defaulting stats to an empty object to prevent "reading property of undefined"
export default function InventoryHeader({ stats = {}, searchQuery, setSearchQuery, filteredCount = 0 }) {
  const [searchFocused, setSearchFocused] = useState(false);

  // Destructure with fallbacks so the component always has a number to display
  const {
    totalItems = 0,
    totalQty = 0,
    lowStock = 0,
    outOfStock = 0
  } = stats;

  return (
    <>
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
            <ArchiveBoxIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Inventory</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {totalItems} product{totalItems !== 1 ? "s" : ""} total
            </p>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Products" value={totalItems} color="blue" icon={<CubeIcon className="w-5 h-5" />} />
        <StatCard label="Total Units" value={totalQty} color="indigo" icon={<ArchiveBoxIcon className="w-5 h-5" />} />
        <StatCard label="Low Stock" value={lowStock} color="amber" icon={<ExclamationTriangleIcon className="w-5 h-5" />} />
        <StatCard label="Out of Stock" value={outOfStock} color="red" icon={<XMarkIcon className="w-5 h-5" />} />
      </div>

      {/* ── Search Bar ── */}
      <div className="mb-4">
        <div className={`flex items-center gap-3 bg-white border rounded-2xl px-4 py-3 shadow-sm transition-all duration-200
          ${searchFocused ? "border-blue-400 ring-2 ring-blue-100" : "border-gray-200 hover:border-gray-300"}`}>
          <MagnifyingGlassIcon className={`w-5 h-5 flex-shrink-0 transition-colors ${searchFocused ? "text-blue-500" : "text-gray-400"}`} />
          <input
            type="text"
            placeholder="Search by Article No."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="flex-1 text-sm text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-red-500 bg-gray-100 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-all duration-150"
            >
              <XMarkIcon className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-xs text-gray-400 mt-2 ml-1">
            {filteredCount} result{filteredCount !== 1 ? "s" : ""} for{" "}
            <span className="font-semibold text-blue-500">"{searchQuery}"</span>
          </p>
        )}
      </div>
    </>
  );
}

function StatCard({ label, value, color, icon }) {
  const colorMap = {
    blue:   { bg: "bg-blue-50",   text: "text-blue-600",   icon: "bg-blue-100"   },
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600", icon: "bg-indigo-100" },
    amber:  { bg: "bg-amber-50",  text: "text-amber-600",  icon: "bg-amber-100"  },
    red:    { bg: "bg-red-50",    text: "text-red-600",    icon: "bg-red-100"    },
  };
  const c = colorMap[color] || colorMap.blue; // Fallback to blue if color is missing
  return (
    <div className={`${c.bg} rounded-2xl px-4 py-4 flex items-center gap-3 border border-white shadow-sm`}>
      <div className={`${c.icon} ${c.text} w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className={`text-xl font-bold ${c.text}`}>{value}</p>
      </div>
    </div>
  );
}