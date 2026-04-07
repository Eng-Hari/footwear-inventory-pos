import { 
  ArchiveBoxIcon, 
  PencilIcon, 
  TrashIcon, 
  CheckIcon, 
  XMarkIcon 
} from "@heroicons/react/24/outline";

const CATEGORIES = ["Men", "Women", "Girl", "Boy"];

export default function InventoryTable({ 
  products, editingId, editForm, savingId, deletingId, 
  onStartEdit, onCancelEdit, onSaveEdit, onDelete, onEditChange, 
  searchQuery, setSearchQuery 
}) {

  const stockBadge = (qty) => {
    if (!qty || qty === 0) return "bg-red-100 text-red-600";
    if (qty <= 2) return "bg-amber-100 text-amber-600";
    return "bg-emerald-100 text-emerald-700";
  };

  const actionsTdBg = (isEditing, index) => {
    if (isEditing) return "bg-blue-50";
    return index % 2 === 0 ? "bg-white" : "bg-slate-50";
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm max-w-full">
      <div className="px-5 py-3.5 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-between rounded-t-2xl">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <ArchiveBoxIcon className="w-4 h-4" /> Stock List
        </h2>
        <span className="text-blue-100 text-xs">{products.length} item{products.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-sm" style={{ minWidth: "860px" }}>
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {[
                { label: "#", cls: "w-10" },
                { label: "Article ↑", cls: "w-28" },
                { label: "Name", cls: "" },
                { label: "Category", cls: "hidden sm:table-cell w-28" },
                { label: "Color", cls: "hidden sm:table-cell w-24" },
                { label: "Size", cls: "hidden md:table-cell w-20" },
                { label: "Qty", cls: "w-20" },
                { label: "Purchase Price", cls: "hidden lg:table-cell w-32" },
                { label: "MRP", cls: "w-24" },
                { label: "Actions", cls: "text-center sticky right-0 bg-gray-50 z-20 w-36 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)]" },
              ].map(({ label, cls }) => (
                <th key={label} className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap ${cls}`}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {products.length > 0 ? (
              products.map((p, index) => {
                const isEditing = editingId === p.id;
                const rowBg = isEditing ? "bg-blue-50" : index % 2 === 0 ? "bg-white" : "bg-slate-50";

                return (
                  <tr key={p.id} className={`${rowBg} hover:bg-blue-50/40 transition-colors duration-150 group`}>
                    <td className="px-4 py-3 text-xs text-gray-400 font-medium">{index + 1}</td>
                    
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <InlineInput name="article" value={editForm.article} onChange={onEditChange} short />
                      ) : (
                        <span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg">{p.article}</span>
                      )}
                    </td>

                    <td className="px-4 py-3 font-medium text-gray-800">
                      {isEditing ? (
                        <InlineInput name="name" value={editForm.name} onChange={onEditChange} wide />
                      ) : p.name}
                    </td>

                    <td className="px-4 py-3 hidden sm:table-cell">
                      {isEditing ? (
                        <select name="category" value={editForm.category} onChange={onEditChange} className="border border-blue-200 bg-blue-50/60 rounded-lg px-2 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all w-24">
                          <option value="">— None —</option>
                          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      ) : p.category ? <CategoryBadge cat={p.category} /> : <span className="text-gray-300 text-xs">—</span>}
                    </td>

                    <td className="px-4 py-3 hidden sm:table-cell text-gray-500 text-xs">
                      {isEditing ? <InlineInput name="color" value={editForm.color} onChange={onEditChange} short /> : p.color || <span className="text-gray-300">—</span>}
                    </td>

                    <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">
                      {isEditing ? <InlineInput name="size" value={editForm.size} onChange={onEditChange} short /> : p.size || <span className="text-gray-300">—</span>}
                    </td>

                    <td className="px-4 py-3">
                      {isEditing ? <InlineInput name="quantity" type="number" value={editForm.quantity} onChange={onEditChange} short /> : (
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${stockBadge(p.quantity)}`}>{p.quantity}</span>
                      )}
                    </td>

                    <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">
                      {isEditing ? <InlineInput name="purchase_price" type="number" value={editForm.purchase_price} onChange={onEditChange} short /> : p.purchase_price != null ? `₹${p.purchase_price}` : <span className="text-gray-300">—</span>}
                    </td>

                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {isEditing ? <InlineInput name="mrp" type="number" value={editForm.mrp} onChange={onEditChange} short /> : `₹${p.mrp}`}
                    </td>

                    <td className={`px-4 py-3 sticky right-0 z-10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] ${actionsTdBg(isEditing, index)}`}>
                      <div className="flex items-center justify-center gap-1.5">
                        {isEditing ? (
                          <>
                            <ActionBtn onClick={() => onSaveEdit(p.id)} disabled={savingId === p.id} color="emerald" icon={<CheckIcon className="w-3.5 h-3.5" />} label={savingId === p.id ? "Saving…" : "Save"} />
                            <ActionBtn onClick={onCancelEdit} color="gray" icon={<XMarkIcon className="w-3.5 h-3.5" />} label="Cancel" />
                          </>
                        ) : (
                          <>
                            <ActionBtn onClick={() => onStartEdit(p)} color="amber" icon={<PencilIcon className="w-3.5 h-3.5" />} label="Edit" />
                            <ActionBtn onClick={() => onDelete(p.id)} disabled={deletingId === p.id} color="red" icon={<TrashIcon className="w-3.5 h-3.5" />} label={deletingId === p.id ? "…" : "Delete"} />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={10} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
                      <ArchiveBoxIcon className="w-6 h-6 text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-400">{searchQuery ? `No products match "${searchQuery}"` : "No products in inventory"}</p>
                    {searchQuery && <button onClick={() => setSearchQuery("")} className="text-xs text-blue-500 hover:underline">Clear search</button>}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {products.length > 0 && (
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 rounded-b-2xl flex items-center justify-between text-xs text-gray-400 flex-wrap gap-2">
          <span>{products.length} product{products.length !== 1 ? "s" : ""} shown</span>
          <span>Total MRP value: <strong className="text-gray-700">₹{products.reduce((s, p) => s + (p.mrp || 0) * (p.quantity || 0), 0).toLocaleString("en-IN")}</strong></span>
        </div>
      )}
    </div>
  );
}

/* ── Internal Helper Components ── */
function InlineInput({ name, value, onChange, type = "text", wide, short }) {
  return (
    <input
      name={name} type={type} value={value} onChange={onChange}
      className={`border border-blue-200 bg-blue-50/60 rounded-lg px-2 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all ${wide ? "w-28" : short ? "w-16" : "w-20"}`}
    />
  );
}

function CategoryBadge({ cat }) {
  const categoryColors = { Men: "bg-blue-100 text-blue-700", Women: "bg-pink-100 text-pink-700", Girl: "bg-purple-100 text-purple-700", Boy: "bg-cyan-100 text-cyan-700" };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[cat] || "bg-gray-100 text-gray-600"}`}>{cat}</span>
  );
}

function ActionBtn({ onClick, disabled, color, icon, label }) {
  const btnStyles = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600",
    gray: "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-500 hover:text-white hover:border-gray-500",
    amber: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-500 hover:text-white hover:border-amber-500",
    red: "bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white hover:border-red-600",
  };
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all duration-150 ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${btnStyles[color]}`}>
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}