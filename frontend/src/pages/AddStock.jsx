
import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "../utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ArchiveBoxIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const FIELD_CONFIG = [
  { name: "article", placeholder: "Article No.", type: "text", span: 1 },
  { name: "name", placeholder: "Product Name", type: "text", span: 2 },
  { name: "color", placeholder: "Color", type: "text", span: 1 },
  { name: "size", placeholder: "Size", type: "text", span: 1 },
  { name: "quantity", placeholder: "Quantity", type: "number", span: 1 },
  { name: "mrp", placeholder: "MRP (₹)", type: "number", span: 1 },
  { name: "purchase_price", placeholder: "Purchase Price (₹)", type: "number", span: 1 },
];

const CATEGORIES = ["Men", "Women", "Girl", "Boy"];

const EMPTY_FORM = {
  article: "", name: "", category: "", color: "",
  size: "", quantity: "", mrp: "", purchase_price: "",
};

const categoryColors = {
  Men: "bg-blue-100 text-blue-700",
  Women: "bg-pink-100 text-pink-700",
  Girl: "bg-purple-100 text-purple-700",
  Boy: "bg-cyan-100 text-cyan-700",
};

// ── Duplicate check: all meaningful fields must match ──
function isDuplicate(newItem, existingItems) {
  const normalize = (v) => String(v ?? "").trim().toLowerCase();
  return existingItems.some(
    (p) =>
      normalize(p.article) === normalize(newItem.article) &&
      normalize(p.name) === normalize(newItem.name) &&
      normalize(p.category) === normalize(newItem.category) &&
      normalize(p.color) === normalize(newItem.color) &&
      normalize(p.size) === normalize(newItem.size) &&
      normalize(p.mrp) === normalize(newItem.mrp) &&
      normalize(p.purchase_price) === normalize(newItem.purchase_price)
  );
}

function InputField({ name, placeholder, type = "text", value, onChange, className = "" }) {
  return (
    <div className={`relative group ${className}`}>
      <input
        name={name}
        type={type}
        placeholder=" "
        value={value}
        onChange={onChange}
        className="peer w-full bg-white border border-gray-200 rounded-xl px-4 pt-5 pb-2 text-sm text-gray-800 placeholder-transparent
          focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200
          hover:border-gray-300 shadow-sm"
      />
      <label className="absolute left-4 top-1.5 text-[11px] font-semibold text-blue-500 uppercase tracking-wider
        peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal
        peer-placeholder-shown:text-gray-400 peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal
        peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:font-semibold peer-focus:text-blue-500
        peer-focus:uppercase peer-focus:tracking-wider transition-all duration-200 pointer-events-none">
        {placeholder}
      </label>
    </div>
  );
}

function CategorySelect({ value, onChange, className = "" }) {
  return (
    <div className={`relative group ${className}`}>
      <select
        name="category"
        value={value}
        onChange={onChange}
        className="w-full bg-white border border-gray-200 rounded-xl px-4 pt-5 pb-2 text-sm text-gray-800
          focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200
          hover:border-gray-300 shadow-sm appearance-none cursor-pointer"
      >
        <option value="" disabled></option>
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      <label className={`absolute left-4 top-1.5 text-[11px] font-semibold uppercase tracking-wider pointer-events-none transition-all duration-200
        ${value ? "text-blue-500" : "top-3.5 text-sm font-normal text-gray-400 normal-case tracking-normal"}`}>
        {value ? "Category" : "Select Category"}
      </label>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

// ── Duplicate Alert Modal ──
function DuplicateAlert({ onForce, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-amber-100 max-w-md w-full p-6 animate-fade-in">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-900 mb-1">Duplicate Product Detected</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              A product with the <strong>same article, name, category, color, size, MRP, and purchase price</strong> already exists in inventory.
              Adding it again may create duplicates.
            </p>
            <p className="text-sm text-amber-700 font-medium mt-2 bg-amber-50 rounded-lg px-3 py-2">
              Do you still want to add this item to the review list?
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-5 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onForce}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold shadow-md shadow-amber-200 transition-all"
          >
            Add Anyway
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AddStock() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [tempProducts, setTempProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Existing inventory
  const [inventory, setInventory] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);

  // Duplicate modal state
  const [duplicatePayload, setDuplicatePayload] = useState(null);

  // ── Fetch inventory ──
  const fetchInventory = useCallback(async () => {
    setInventoryLoading(true);
    try {
      const data = await apiRequest("/inventory", "GET");
      setInventory(Array.isArray(data) ? data : []);
    } catch {
      setInventory([]);
    } finally {
      setInventoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
    const handler = () => fetchInventory();
    window.addEventListener("inventoryUpdated", handler);
    return () => window.removeEventListener("inventoryUpdated", handler);
  }, [fetchInventory]);

  // ── Article-based suggestions: only shown when article field is typed ──
  const articleQuery = form.article.trim().toLowerCase();
  const articleSuggestions = articleQuery
    ? inventory.filter((p) =>
        String(p.article).toLowerCase().includes(articleQuery)
      )
    : [];

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }
  function handleEditChange(e) { setEditForm({ ...editForm, [e.target.name]: e.target.value }); }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.article || !form.name || !form.quantity || !form.category) {
      toast.warn("Article, Name, Quantity, and Category are required!", { position: "top-right" });
      return;
    }

    const payload = {
      tempId: Date.now(), ...form,
      quantity: Number(form.quantity),
      mrp: Number(form.mrp || 0),
      purchase_price: Number(form.purchase_price || 0),
    };

    // Check against both saved inventory AND the current review list
    const allExisting = [...inventory, ...tempProducts];
    if (isDuplicate(payload, allExisting)) {
      setDuplicatePayload(payload);
      return;
    }

    commitAdd(payload);
  }

  function commitAdd(payload) {
    setTempProducts((prev) => [...prev, payload]);
    toast.success("Product added to review list!", { position: "top-right" });
    setForm(EMPTY_FORM);
    setDuplicatePayload(null);
  }

  function startEditing(product) { setEditingId(product.tempId); setEditForm({ ...product }); }

  function saveEdit() {
    if (!editForm.article || !editForm.name || !editForm.quantity || !editForm.category) {
      toast.warn("Article, Name, Quantity, and Category are required!", { position: "top-right" });
      return;
    }
    setTempProducts(tempProducts.map((p) =>
      p.tempId === editingId
        ? { ...editForm, quantity: Number(editForm.quantity), mrp: Number(editForm.mrp || 0), purchase_price: Number(editForm.purchase_price || 0) }
        : p
    ));
    setEditingId(null); setEditForm({});
    toast.success("Changes saved!", { position: "top-right" });
  }

  function cancelEdit() { setEditingId(null); setEditForm({}); }

  function removeFromList(tempId) {
    setTempProducts(tempProducts.filter((p) => p.tempId !== tempId));
    toast.info("Product removed.", { position: "top-right" });
  }

  async function confirmAndSaveAll() {
    if (tempProducts.length === 0) {
      toast.warn("No products to save!", { position: "top-right" }); return;
    }
    try {
      for (const product of tempProducts) {
        const { tempId, ...payload } = product;
        await apiRequest("/inventory", "POST", payload);
      }
      toast.success("All products saved to inventory!", { position: "top-right" });
      window.dispatchEvent(new Event("inventoryUpdated"));
      setTempProducts([]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save some products.", { position: "top-right" });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-4 sm:p-8">
      <ToastContainer autoClose={2000} toastClassName="rounded-xl shadow-lg text-sm font-medium" />

      {/* ── Duplicate Modal ── */}
      {duplicatePayload && (
        <DuplicateAlert
          onForce={() => commitAdd(duplicatePayload)}
          onCancel={() => setDuplicatePayload(null)}
        />
      )}

      {/* ── Header ── */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
            <ArchiveBoxIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Add New Stock</h1>
            <p className="text-sm text-gray-500 mt-0.5">Fill in product details and review before saving</p>
          </div>
        </div>
        {tempProducts.length > 0 && (
          <div className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg shadow-blue-200">
            <SparklesIcon className="w-4 h-4" />
            {tempProducts.length} item{tempProducts.length > 1 ? "s" : ""} pending
          </div>
        )}
      </div>

      {/* ── Form Card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Product Details
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <InputField name="article" placeholder="Article No." value={form.article} onChange={handleChange} />
            <InputField name="name" placeholder="Product Name" value={form.name} onChange={handleChange} className="sm:col-span-2" />
            <CategorySelect value={form.category} onChange={handleChange} />
            <InputField name="color" placeholder="Color" value={form.color} onChange={handleChange} />
            <InputField name="size" placeholder="Size" value={form.size} onChange={handleChange} />
            <InputField name="quantity" placeholder="Quantity" type="number" value={form.quantity} onChange={handleChange} />
            <InputField name="mrp" placeholder="MRP (₹)" type="number" value={form.mrp} onChange={handleChange} />
            <InputField name="purchase_price" placeholder="Purchase Price (₹)" type="number" value={form.purchase_price} onChange={handleChange} />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 px-6 rounded-xl
              flex items-center justify-center gap-2 shadow-md shadow-blue-200 transition-all duration-200 hover:shadow-lg hover:shadow-blue-300 hover:-translate-y-0.5"
          >
            <PlusIcon className="w-5 h-5" />
            Add to Review List
          </button>
        </form>
      </div>

      {/* ── Review Table ── */}
      {tempProducts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-wrap gap-3">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Review List</h2>
              <p className="text-xs text-gray-400 mt-0.5">Verify details before saving to inventory</p>
            </div>
            <button
              onClick={confirmAndSaveAll}
              className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold px-5 py-2.5 rounded-xl
                flex items-center gap-2 text-sm shadow-md shadow-emerald-200 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            >
              <CheckIcon className="w-4 h-4" />
              Save All to Inventory
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["#", "Article", "Name", "Category", "Color", "Size", "Qty", "Purchase", "MRP", "Actions"].map((h, i) => (
                    <th key={h} className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap
                      ${i === 3 ? "hidden sm:table-cell" : ""}
                      ${i === 4 ? "hidden sm:table-cell" : ""}
                      ${i === 5 ? "hidden md:table-cell" : ""}
                      ${i === 7 ? "hidden lg:table-cell" : ""}
                      ${i === 9 ? "text-center" : ""}
                    `}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tempProducts.map((p, index) => {
                  const isEditing = editingId === p.tempId;
                  const rowBg = index % 2 === 0 ? "bg-white" : "bg-slate-50/60";
                  return (
                    <tr key={p.tempId} className={`${rowBg} hover:bg-blue-50/50 transition-colors duration-150 group`}>
                      <td className="px-4 py-3 text-xs text-gray-400 font-medium">{index + 1}</td>
                      <td className="px-4 py-3">
                        {isEditing ? <InlineInput name="article" value={editForm.article} onChange={handleEditChange} /> : <span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg">{p.article}</span>}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? <InlineInput name="name" value={editForm.name} onChange={handleEditChange} /> : <span className="font-medium text-gray-800">{p.name}</span>}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        {isEditing ? (
                          <select name="category" value={editForm.category} onChange={handleEditChange}
                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400">
                            <option value="" disabled>Select</option>
                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                          </select>
                        ) : (
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[p.category] || "bg-gray-100 text-gray-600"}`}>{p.category || "—"}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-gray-600">
                        {isEditing ? <InlineInput name="color" value={editForm.color} onChange={handleEditChange} /> : p.color || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-600">
                        {isEditing ? <InlineInput name="size" value={editForm.size} onChange={handleEditChange} /> : p.size || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? <InlineInput name="quantity" type="number" value={editForm.quantity} onChange={handleEditChange} /> : <span className="font-semibold text-gray-800">{p.quantity}</span>}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {isEditing ? <InlineInput name="purchase_price" type="number" value={editForm.purchase_price} onChange={handleEditChange} /> : <span className="text-gray-500 text-xs">₹{p.purchase_price || 0}</span>}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? <InlineInput name="mrp" type="number" value={editForm.mrp} onChange={handleEditChange} /> : <span className="font-semibold text-gray-900">₹{p.mrp || 0}</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          {isEditing ? (
                            <>
                              <ActionBtn onClick={saveEdit} color="emerald" icon={<CheckIcon className="w-3.5 h-3.5" />} label="Save" />
                              <ActionBtn onClick={cancelEdit} color="gray" icon={<XMarkIcon className="w-3.5 h-3.5" />} label="Cancel" />
                            </>
                          ) : (
                            <>
                              <ActionBtn onClick={() => startEditing(p)} color="amber" icon={<PencilIcon className="w-3.5 h-3.5" />} label="Edit" />
                              <ActionBtn onClick={() => removeFromList(p.tempId)} color="red" icon={<TrashIcon className="w-3.5 h-3.5" />} label="Remove" />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 flex-wrap gap-2">
            <span>{tempProducts.length} product{tempProducts.length !== 1 ? "s" : ""} in review</span>
            <span>Total MRP: <strong className="text-gray-800">₹{tempProducts.reduce((s, p) => s + (p.mrp || 0) * (p.quantity || 0), 0).toLocaleString("en-IN")}</strong></span>
          </div>
        </div>
      )}

      {/* ── Article Suggestions Panel ── */}
      {articleQuery && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-slate-50 flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <ArchiveBoxIcon className="w-3.5 h-3.5" />
              Existing products matching article <span className="font-mono text-blue-600 normal-case tracking-normal">"{form.article}"</span>
            </p>
            <span className="text-xs text-slate-400">
              {inventoryLoading ? "Loading…" : `${articleSuggestions.length} found`}
            </span>
          </div>

          {inventoryLoading ? (
            <div className="py-8 text-center">
              <div className="inline-block w-6 h-6 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : articleSuggestions.length === 0 ? (
            <div className="px-5 py-5 flex items-center gap-3 text-sm text-gray-400">
              <CheckIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              No existing products with this article number — looks new!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Article", "Name", "Category", "Color", "Size", "Qty", "MRP"].map((h, i) => (
                      <th
                        key={h}
                        className={`px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap
                          ${i === 2 ? "hidden sm:table-cell" : ""}
                          ${i === 3 ? "hidden sm:table-cell" : ""}
                          ${i === 4 ? "hidden md:table-cell" : ""}
                        `}
                      >{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {articleSuggestions.map((p, index) => {
                    const isDup = isDuplicate(
                      { ...form, mrp: Number(form.mrp || 0), purchase_price: Number(form.purchase_price || 0) },
                      [p]
                    );
                    return (
                      <tr
                        key={p._id ?? p.id ?? index}
                        className={`transition-colors duration-100 ${isDup ? "bg-amber-50 border-l-4 border-amber-400" : "hover:bg-slate-50/60"}`}
                      >
                        <td className="px-4 py-2.5">
                          <span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg">{p.article}</span>
                        </td>
                        <td className="px-4 py-2.5 font-medium text-gray-800 max-w-[160px]">
                          <span className="truncate block" title={p.name}>{p.name}</span>
                          {isDup && (
                            <span className="inline-block mt-0.5 text-[10px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                              Duplicate!
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 hidden sm:table-cell">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColors[p.category] || "bg-gray-100 text-gray-600"}`}>
                            {p.category || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 hidden sm:table-cell text-xs text-gray-500">{p.color || <span className="text-gray-300">—</span>}</td>
                        <td className="px-4 py-2.5 hidden md:table-cell text-xs text-gray-500">{p.size || <span className="text-gray-300">—</span>}</td>
                        <td className="px-4 py-2.5 text-xs font-semibold text-gray-700">{p.quantity}</td>
                        <td className="px-4 py-2.5 text-xs font-semibold text-gray-900">₹{p.mrp || 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Helpers ── */
function InlineInput({ name, value, onChange, type = "text" }) {
  return (
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      className="w-full min-w-[70px] border border-blue-200 bg-blue-50/60 rounded-lg px-2 py-1.5 text-xs text-gray-800
        focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
    />
  );
}

const btnStyles = {
  emerald: "bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border-emerald-200",
  gray: "bg-gray-50 text-gray-600 hover:bg-gray-500 hover:text-white border-gray-200",
  amber: "bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white border-amber-200",
  red: "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border-red-200",
};

function ActionBtn({ onClick, color, icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all duration-150 ${btnStyles[color]}`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}