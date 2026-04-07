import { useState } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function ProductSearch({ 
  search, 
  setSearch, 
  products, 
  setProducts, 
  addToCart, 
  cart, 
  searchRef 
}) {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <div className="relative">
      {/* ── Search Input ── */}
      <div className={`flex items-center gap-3 bg-white border rounded-2xl px-4 py-3.5 shadow-sm transition-all duration-200
        ${searchFocused ? "border-blue-400 ring-2 ring-blue-100 shadow-md" : "border-gray-200 hover:border-gray-300"}`}>
        
        <MagnifyingGlassIcon 
          className={`w-5 h-5 flex-shrink-0 transition-colors ${searchFocused ? "text-blue-500" : "text-gray-400"}`} 
        />
        
        <input
          ref={searchRef}
          type="text"
          placeholder="Search by Article No., Name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          // 200ms delay allows the onClick of the dropdown to fire before the dropdown disappears
          onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
          className="flex-1 text-sm text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none"
        />

        {search && (
          <button
            onClick={() => {
              setSearch("");
              setProducts([]);
              searchRef.current?.focus();
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Dropdown Results ── */}
      {products.length > 0 && (
        <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
          {/* Results Count Header */}
          <div className="px-4 py-2 border-b border-gray-50 bg-gray-50/80">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {products.length} result{products.length !== 1 ? "s" : ""}
            </p>
          </div>

          <ul className="max-h-64 overflow-auto divide-y divide-gray-50">
            {products.map((p) => {
              const inCart = cart.find(
                (i) => i.id === p.id || String(i.article) === String(p.article)
              );

              return (
                <li
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="flex items-center justify-between px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md font-semibold">
                        {p.article}
                      </span>
                      <span className="text-sm font-medium text-gray-800 truncate">
                        {p.name}
                      </span>
                      {/* Show current cart qty as a hint */}
                      {inCart && (
                        <span className="text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
                          {inCart.qty} in cart
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      {p.color && <span>Color: {p.color}</span>}
                      {p.size && <span>Size: {p.size}</span>}
                      <span className={`font-medium ${
                        p.quantity > 5 ? "text-emerald-600" : 
                        p.quantity > 0 ? "text-amber-500" : "text-red-500"
                      }`}>
                        Stock: {p.quantity}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <span className="text-sm font-bold text-gray-900">
                      ₹{p.mrp?.toFixed(2)}
                    </span>
                    {/* Add visual feedback (+) on hover */}
                    <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-sm font-bold">+</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}


