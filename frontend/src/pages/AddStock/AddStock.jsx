import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "../../utils/api";import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ArchiveBoxIcon, SparklesIcon } from "@heroicons/react/24/outline";

import AddStockForm, { DuplicateAlert } from "./AddStockForm";
import AddStockTable from "./AddStockTable";

const EMPTY_FORM = { article: "", name: "", category: "", color: "", size: "", quantity: "", mrp: "", purchase_price: "" };

function isDuplicate(newItem, existingItems) {
  const normalize = (v) => String(v ?? "").trim().toLowerCase();
  return existingItems.some(p => 
    normalize(p.article) === normalize(newItem.article) &&
    normalize(p.name) === normalize(newItem.name) &&
    normalize(p.category) === normalize(newItem.category) &&
    normalize(p.size) === normalize(newItem.size) &&
    normalize(p.mrp) === normalize(newItem.mrp)
  );
}

export default function AddStock() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [tempProducts, setTempProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [duplicatePayload, setDuplicatePayload] = useState(null);
  
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const fetchInventory = useCallback(async () => {
    try {
      const data = await apiRequest("/inventory", "GET");
      setInventory(Array.isArray(data) ? data : []);
    } catch { setInventory([]); }
  }, []);

  useEffect(() => {
    fetchInventory();
    window.addEventListener("inventoryUpdated", fetchInventory);
    return () => window.removeEventListener("inventoryUpdated", fetchInventory);
  }, [fetchInventory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.article || !form.name || !form.quantity || !form.category) {
      toast.warn("Required fields missing!"); return;
    }
    const payload = { ...form, tempId: Date.now(), quantity: Number(form.quantity), mrp: Number(form.mrp || 0) };
    if (isDuplicate(payload, [...inventory, ...tempProducts])) {
      setDuplicatePayload(payload);
    } else {
      commitAdd(payload);
    }
  };

  const commitAdd = (payload) => {
    setTempProducts(prev => [...prev, payload]);
    setForm(EMPTY_FORM);
    setDuplicatePayload(null);
    toast.success("Added to review!");
  };

  const confirmAndSaveAll = async () => {
    try {
      for (const p of tempProducts) {
        const { tempId, ...payload } = p;
        await apiRequest("/inventory", "POST", payload);
      }
      toast.success("Saved to inventory!");
      setTempProducts([]);
      window.dispatchEvent(new Event("inventoryUpdated"));
    } catch { toast.error("Error saving products."); }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <ToastContainer autoClose={2000} />
      
      {duplicatePayload && <DuplicateAlert onForce={() => commitAdd(duplicatePayload)} onCancel={() => setDuplicatePayload(null)} />}

      <div className="mb-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg"><ArchiveBoxIcon className="w-6 h-6 text-white" /></div>
          <h1 className="text-2xl font-bold">Add New Stock</h1>
        </div>
        {tempProducts.length > 0 && <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2"><SparklesIcon className="w-4 h-4"/>{tempProducts.length} Pending</div>}
      </div>

      <AddStockForm form={form} onChange={(e) => setForm({...form, [e.target.name]: e.target.value})} onSubmit={handleSubmit} />

      {tempProducts.length > 0 && (
        <AddStockTable 
          products={tempProducts}
          editingId={editingId}
          editForm={editForm}
          onEditStart={(p) => { setEditingId(p.tempId); setEditForm(p); }}
          onEditSave={() => {
             setTempProducts(tempProducts.map(p => p.tempId === editingId ? editForm : p));
             setEditingId(null);
          }}
          onEditCancel={() => setEditingId(null)}
          onEditChange={(e) => setEditForm({...editForm, [e.target.name]: e.target.value})}
          onRemove={(id) => setTempProducts(tempProducts.filter(p => p.tempId !== id))}
          onConfirmAll={confirmAndSaveAll}
        />
      )}
    </div>
  );
}