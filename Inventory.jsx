// import { useEffect, useState } from "react";
// import { apiRequest } from "../utils/api";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import {
//   ArchiveBoxIcon,
//   TrashIcon,
//   XMarkIcon,
//   MagnifyingGlassIcon,
//   CubeIcon,
//   ExclamationTriangleIcon,
//   PencilIcon,
//   CheckIcon,
// } from "@heroicons/react/24/outline";

// const CATEGORIES = ["Men", "Women", "Girl", "Boy"];

// export default function Inventory() {
//   const [products, setProducts] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchFocused, setSearchFocused] = useState(false);
//   const [deletingId, setDeletingId] = useState(null);
//   const [editingId, setEditingId] = useState(null);
//   const [editForm, setEditForm] = useState({});
//   const [savingId, setSavingId] = useState(null);

//   useEffect(() => {
//     loadInventory();
//     const handleInventoryUpdate = () => {
//       loadInventory();
//       toast.info("Inventory updated!", { position: "top-right" });
//     };
//     window.addEventListener("inventoryUpdated", handleInventoryUpdate);
//     return () => window.removeEventListener("inventoryUpdated", handleInventoryUpdate);
//   }, []);

//   async function loadInventory() {
//     try {
//       const data = await apiRequest("/inventory");
//       setProducts(data);
//     } catch (err) {
//       console.error("Failed to fetch inventory", err);
//       toast.error("Failed to load inventory", { position: "top-right" });
//     }
//   }

//   async function deleteProduct(id) {
//     if (!window.confirm("Delete this product?")) return;
//     setDeletingId(id);
//     try {
//       await apiRequest(`/inventory/${id}`, "DELETE");
//       toast.success("Product deleted!", { position: "top-right" });
//       loadInventory();
//     } catch (err) {
//       console.error("Delete error:", err);
//       toast.error("Failed to delete product", { position: "top-right" });
//     } finally {
//       setDeletingId(null);
//     }
//   }

//   function startEditing(p) {
//     setEditingId(p.id);
//     setEditForm({
//       article: p.article || "",
//       name: p.name || "",
//       category: p.category || "",
//       color: p.color || "",
//       size: p.size || "",
//       quantity: p.quantity ?? "",
//       purchase_price: p.purchase_price ?? "",
//       mrp: p.mrp ?? "",
//     });
//   }

//   function cancelEdit() {
//     setEditingId(null);
//     setEditForm({});
//   }

//   function handleEditChange(e) {
//     setEditForm({ ...editForm, [e.target.name]: e.target.value });
//   }

//   async function saveEdit(id) {
//     if (!editForm.article || !editForm.name || editForm.quantity === "") {
//       toast.warn("Article, Name, and Quantity are required!", { position: "top-right" });
//       return;
//     }
//     setSavingId(id);
//     const payload = {
//       ...editForm,
//       quantity: Number(editForm.quantity),
//       mrp: Number(editForm.mrp || 0),
//       purchase_price: Number(editForm.purchase_price || 0),
//     };
//     try {
//       await apiRequest(`/inventory/${id}`, "PUT", payload);
//       toast.success("Product updated!", { position: "top-right" });
//       setEditingId(null);
//       setEditForm({});
//       loadInventory();
//     } catch (err) {
//       console.error("Update error:", err);
//       toast.error("Failed to update product", { position: "top-right" });
//     } finally {
//       setSavingId(null);
//     }
//   }

//   // ── Dictionary-order sort by article number ──
//   const filteredProducts = products
//     .filter((p) =>
//       String(p.article).toLowerCase().includes(searchQuery.toLowerCase())
//     )
//     .sort((a, b) =>
//       String(a.article).localeCompare(String(b.article), undefined, {
//         numeric: true,
//         sensitivity: "base",
//       })
//     );

//   const totalItems = products.length;
//   const totalQty = products.reduce((s, p) => s + (p.quantity || 0), 0);
//   const lowStock = products.filter((p) => p.quantity > 0 && p.quantity <= 2).length;
//   const outOfStock = products.filter((p) => !p.quantity).length;

//   const stockBadge = (qty) => {
//     if (!qty || qty === 0) return "bg-red-100 text-red-600";
//     if (qty <= 2) return "bg-amber-100 text-amber-600";
//     return "bg-emerald-100 text-emerald-700";
//   };

//   // ── Helper: get correct sticky Actions td background based on row state ──
//   const actionsTdBg = (isEditing, index) => {
//     if (isEditing) return "bg-blue-50";
//     return index % 2 === 0 ? "bg-white" : "bg-slate-50";
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 p-4 sm:p-8 overflow-x-hidden">
//       <ToastContainer autoClose={1500} toastClassName="rounded-xl shadow-lg text-sm font-medium" />

//       {/* ── Header ── */}
//       <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
//         <div className="flex items-center gap-3">
//           <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
//             <ArchiveBoxIcon className="w-6 h-6 text-white" />
//           </div>
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Inventory</h1>
//             <p className="text-sm text-gray-400 mt-0.5">{totalItems} product{totalItems !== 1 ? "s" : ""} total</p>
//           </div>
//         </div>
//       </div>

//       {/* ── Stat Cards ── */}
//       <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
//         <StatCard label="Total Products" value={totalItems} color="blue" icon={<CubeIcon className="w-5 h-5" />} />
//         <StatCard label="Total Units" value={totalQty} color="indigo" icon={<ArchiveBoxIcon className="w-5 h-5" />} />
//         <StatCard label="Low Stock" value={lowStock} color="amber" icon={<ExclamationTriangleIcon className="w-5 h-5" />} />
//         <StatCard label="Out of Stock" value={outOfStock} color="red" icon={<XMarkIcon className="w-5 h-5" />} />
//       </div>

//       {/* ── Search Bar ── */}
//       <div className="mb-4">
//         <div className={`flex items-center gap-3 bg-white border rounded-2xl px-4 py-3 shadow-sm transition-all duration-200
//           ${searchFocused ? "border-blue-400 ring-2 ring-blue-100" : "border-gray-200 hover:border-gray-300"}`}>
//           <MagnifyingGlassIcon className={`w-5 h-5 flex-shrink-0 transition-colors ${searchFocused ? "text-blue-500" : "text-gray-400"}`} />
//           <input
//             type="text"
//             placeholder="Search by Article No."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             onFocus={() => setSearchFocused(true)}
//             onBlur={() => setSearchFocused(false)}
//             className="flex-1 text-sm text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none"
//           />
//           {searchQuery && (
//             <button
//               onClick={() => setSearchQuery("")}
//               className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-red-500 bg-gray-100 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-all duration-150"
//             >
//               <XMarkIcon className="w-3.5 h-3.5" /> Clear
//             </button>
//           )}
//         </div>
//         {searchQuery && (
//           <p className="text-xs text-gray-400 mt-2 ml-1">
//             {filteredProducts.length} result{filteredProducts.length !== 1 ? "s" : ""} for{" "}
//             <span className="font-semibold text-blue-500">"{searchQuery}"</span>
//           </p>
//         )}
//       </div>

//       {/* ── Table Card ── */}
//       <div className="bg-white rounded-2xl border border-gray-100 shadow-sm max-w-full">
//         <div className="px-5 py-3.5 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-between rounded-t-2xl">
//           <h2 className="text-sm font-semibold text-white flex items-center gap-2">
//             <ArchiveBoxIcon className="w-4 h-4" /> Stock List
//           </h2>
//           <span className="text-blue-100 text-xs">{filteredProducts.length} item{filteredProducts.length !== 1 ? "s" : ""}</span>
//         </div>

//         <div className="overflow-x-auto w-full">
//           <table className="w-full text-sm" style={{minWidth: "860px"}}>
//             <thead>
//               <tr className="bg-gray-50 border-b border-gray-100">
//                 {[
//                   { label: "#",              cls: "w-10" },
//                   { label: "Article ↑",      cls: "w-28" },
//                   { label: "Name",           cls: "" },
//                   { label: "Category",       cls: "hidden sm:table-cell w-28" },
//                   { label: "Color",          cls: "hidden sm:table-cell w-24" },
//                   { label: "Size",           cls: "hidden md:table-cell w-20" },
//                   { label: "Qty",            cls: "w-20" },
//                   { label: "Purchase Price", cls: "hidden lg:table-cell w-32" },
//                   { label: "MRP",            cls: "w-24" },
//                   { label: "Actions",        cls: "text-center sticky right-0 bg-gray-50 z-20 w-36 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)]" },
//                 ].map(({ label, cls }) => (
//                   <th
//                     key={label}
//                     className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap ${cls}`}
//                   >
//                     {label}
//                   </th>
//                 ))}
//               </tr>
//             </thead>

//             <tbody className="divide-y divide-gray-50">
//               {filteredProducts.length > 0 ? (
//                 filteredProducts.map((p, index) => {
//                   const isEditing = editingId === p.id;
//                   const rowBg = isEditing
//                     ? "bg-blue-50"
//                     : index % 2 === 0
//                     ? "bg-white"
//                     : "bg-slate-50";

//                   return (
//                     <tr
//                       key={p.id}
//                       className={`${rowBg} hover:bg-blue-50/40 transition-colors duration-150 group`}
//                     >
//                       {/* # */}
//                       <td className="px-4 py-3 text-xs text-gray-400 font-medium">{index + 1}</td>

//                       {/* Article */}
//                       <td className="px-4 py-3">
//                         {isEditing ? (
//                           <InlineInput name="article" value={editForm.article} onChange={handleEditChange} short />
//                         ) : (
//                           <span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg">{p.article}</span>
//                         )}
//                       </td>

//                       {/* Name */}
//                       <td className="px-4 py-3 font-medium text-gray-800">
//                         {isEditing ? (
//                           <InlineInput name="name" value={editForm.name} onChange={handleEditChange} wide />
//                         ) : (
//                           p.name
//                         )}
//                       </td>

//                       {/* Category */}
//                       <td className="px-4 py-3 hidden sm:table-cell">
//                         {isEditing ? (
//                           <select
//                             name="category"
//                             value={editForm.category}
//                             onChange={handleEditChange}
//                             className="border border-blue-200 bg-blue-50/60 rounded-lg px-2 py-1.5 text-xs text-gray-800
//                               focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all w-24"
//                           >
//                             <option value="">— None —</option>
//                             {CATEGORIES.map((c) => (
//                               <option key={c} value={c}>{c}</option>
//                             ))}
//                           </select>
//                         ) : p.category ? (
//                           <CategoryBadge cat={p.category} />
//                         ) : (
//                           <span className="text-gray-300 text-xs">—</span>
//                         )}
//                       </td>

//                       {/* Color */}
//                       <td className="px-4 py-3 hidden sm:table-cell text-gray-500 text-xs">
//                         {isEditing ? (
//                           <InlineInput name="color" value={editForm.color} onChange={handleEditChange} short />
//                         ) : (
//                           p.color || <span className="text-gray-300">—</span>
//                         )}
//                       </td>

//                       {/* Size */}
//                       <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">
//                         {isEditing ? (
//                           <InlineInput name="size" value={editForm.size} onChange={handleEditChange} short />
//                         ) : (
//                           p.size || <span className="text-gray-300">—</span>
//                         )}
//                       </td>

//                       {/* Qty */}
//                       <td className="px-4 py-3">
//                         {isEditing ? (
//                           <InlineInput name="quantity" type="number" value={editForm.quantity} onChange={handleEditChange} short />
//                         ) : (
//                           <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${stockBadge(p.quantity)}`}>
//                             {p.quantity}
//                           </span>
//                         )}
//                       </td>

//                       {/* Purchase Price */}
//                       <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">
//                         {isEditing ? (
//                           <InlineInput name="purchase_price" type="number" value={editForm.purchase_price} onChange={handleEditChange} short />
//                         ) : p.purchase_price != null ? (
//                           `₹${p.purchase_price}`
//                         ) : (
//                           <span className="text-gray-300">—</span>
//                         )}
//                       </td>

//                       {/* MRP */}
//                       <td className="px-4 py-3 font-semibold text-gray-900">
//                         {isEditing ? (
//                           <InlineInput name="mrp" type="number" value={editForm.mrp} onChange={handleEditChange} short />
//                         ) : (
//                           `₹${p.mrp}`
//                         )}
//                       </td>

//                       {/* ── Actions — sticky right, bg matches row ── */}
//                       <td
//                         className={`px-4 py-3 sticky right-0 z-10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] ${actionsTdBg(isEditing, index)}`}
//                       >
//                         <div className="flex items-center justify-center gap-1.5">
//                           {isEditing ? (
//                             <>
//                               <ActionBtn
//                                 onClick={() => saveEdit(p.id)}
//                                 disabled={savingId === p.id}
//                                 color="emerald"
//                                 icon={<CheckIcon className="w-3.5 h-3.5" />}
//                                 label={savingId === p.id ? "Saving…" : "Save"}
//                               />
//                               <ActionBtn
//                                 onClick={cancelEdit}
//                                 color="gray"
//                                 icon={<XMarkIcon className="w-3.5 h-3.5" />}
//                                 label="Cancel"
//                               />
//                             </>
//                           ) : (
//                             <>
//                               <ActionBtn
//                                 onClick={() => startEditing(p)}
//                                 color="amber"
//                                 icon={<PencilIcon className="w-3.5 h-3.5" />}
//                                 label="Edit"
//                               />
//                               <ActionBtn
//                                 onClick={() => deleteProduct(p.id)}
//                                 disabled={deletingId === p.id}
//                                 color="red"
//                                 icon={<TrashIcon className="w-3.5 h-3.5" />}
//                                 label={deletingId === p.id ? "…" : "Delete"}
//                               />
//                             </>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })
//               ) : (
//                 <tr>
//                   <td colSpan={10} className="py-16 text-center">
//                     <div className="flex flex-col items-center gap-3">
//                       <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
//                         <ArchiveBoxIcon className="w-6 h-6 text-gray-300" />
//                       </div>
//                       <p className="text-sm font-medium text-gray-400">
//                         {searchQuery ? `No products match "${searchQuery}"` : "No products in inventory"}
//                       </p>
//                       {searchQuery && (
//                         <button onClick={() => setSearchQuery("")} className="text-xs text-blue-500 hover:underline">
//                           Clear search
//                         </button>
//                       )}
//                     </div>
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Footer */}
//         {filteredProducts.length > 0 && (
//           <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 rounded-b-2xl flex items-center justify-between text-xs text-gray-400 flex-wrap gap-2">
//             <span>{filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} shown</span>
//             <span>
//               Total MRP value:{" "}
//               <strong className="text-gray-700">
//                 ₹{filteredProducts.reduce((s, p) => s + (p.mrp || 0) * (p.quantity || 0), 0).toLocaleString("en-IN")}
//               </strong>
//             </span>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// /* ── Inline Input ── */
// function InlineInput({ name, value, onChange, type = "text", wide, short }) {
//   return (
//     <input
//       name={name}
//       type={type}
//       value={value}
//       onChange={onChange}
//       className={`border border-blue-200 bg-blue-50/60 rounded-lg px-2 py-1.5 text-xs text-gray-800
//         focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all
//         ${wide ? "w-28" : short ? "w-16" : "w-20"}`}
//     />
//   );
// }

// /* ── Category Badge ── */
// const categoryColors = {
//   Men:   "bg-blue-100 text-blue-700",
//   Women: "bg-pink-100 text-pink-700",
//   Girl:  "bg-purple-100 text-purple-700",
//   Boy:   "bg-cyan-100 text-cyan-700",
// };

// function CategoryBadge({ cat }) {
//   return (
//     <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[cat] || "bg-gray-100 text-gray-600"}`}>
//       {cat}
//     </span>
//   );
// }

// /* ── Action Button ── */
// const btnStyles = {
//   emerald: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600",
//   gray:    "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-500 hover:text-white hover:border-gray-500",
//   amber:   "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-500 hover:text-white hover:border-amber-500",
//   red:     "bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white hover:border-red-600",
// };

// function ActionBtn({ onClick, disabled, color, icon, label }) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       disabled={disabled}
//       className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all duration-150
//         ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${btnStyles[color]}`}
//     >
//       {icon}
//       <span className="hidden sm:inline">{label}</span>
//     </button>
//   );
// }

// /* ── Stat Card ── */
// const colorMap = {
//   blue:   { bg: "bg-blue-50",   text: "text-blue-600",   icon: "bg-blue-100"   },
//   indigo: { bg: "bg-indigo-50", text: "text-indigo-600", icon: "bg-indigo-100" },
//   amber:  { bg: "bg-amber-50",  text: "text-amber-600",  icon: "bg-amber-100"  },
//   red:    { bg: "bg-red-50",    text: "text-red-600",    icon: "bg-red-100"    },
// };

// function StatCard({ label, value, color, icon }) {
//   const c = colorMap[color];
//   return (
//     <div className={`${c.bg} rounded-2xl px-4 py-4 flex items-center gap-3 border border-white shadow-sm`}>
//       <div className={`${c.icon} ${c.text} w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0`}>
//         {icon}
//       </div>
//       <div>
//         <p className="text-xs text-gray-500 font-medium">{label}</p>
//         <p className={`text-xl font-bold ${c.text}`}>{value}</p>
//       </div>
//     </div>
//   );
// }