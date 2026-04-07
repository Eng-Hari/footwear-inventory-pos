import { useEffect, useState } from "react";
import { apiRequest } from "../../utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InventoryHeader from "./InventoryHeader";
import InventoryTable from "./InventoryTable";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    loadInventory();
    const handleInventoryUpdate = () => {
      loadInventory();
      toast.info("Inventory updated!", { position: "top-right" });
    };
    window.addEventListener("inventoryUpdated", handleInventoryUpdate);
    return () => window.removeEventListener("inventoryUpdated", handleInventoryUpdate);
  }, []);

  async function loadInventory() {
    try {
      const data = await apiRequest("/inventory");
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch inventory", err);
      toast.error("Failed to load inventory", { position: "top-right" });
    }
  }

  async function deleteProduct(id) {
    if (!window.confirm("Delete this product?")) return;
    setDeletingId(id);
    try {
      await apiRequest(`/inventory/${id}`, "DELETE");
      toast.success("Product deleted!", { position: "top-right" });
      loadInventory();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete product", { position: "top-right" });
    } finally {
      setDeletingId(null);
    }
  }

  function startEditing(p) {
    setEditingId(p.id);
    setEditForm({
      article: p.article || "",
      name: p.name || "",
      category: p.category || "",
      color: p.color || "",
      size: p.size || "",
      quantity: p.quantity ?? "",
      purchase_price: p.purchase_price ?? "",
      mrp: p.mrp ?? "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  function handleEditChange(e) {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  }

  async function saveEdit(id) {
    if (!editForm.article || !editForm.name || editForm.quantity === "") {
      toast.warn("Article, Name, and Quantity are required!", { position: "top-right" });
      return;
    }
    setSavingId(id);
    const payload = {
      ...editForm,
      quantity: Number(editForm.quantity),
      mrp: Number(editForm.mrp || 0),
      purchase_price: Number(editForm.purchase_price || 0),
    };
    try {
      await apiRequest(`/inventory/${id}`, "PUT", payload);
      toast.success("Product updated!", { position: "top-right" });
      setEditingId(null);
      setEditForm({});
      loadInventory();
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update product", { position: "top-right" });
    } finally {
      setSavingId(null);
    }
  }

  const filteredProducts = products
    .filter((p) =>
      String(p.article).toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) =>
      String(a.article).localeCompare(String(b.article), undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );

  const stats = {
    totalItems: products.length,
    totalQty: products.reduce((s, p) => s + (p.quantity || 0), 0),
    lowStock: products.filter((p) => p.quantity > 0 && p.quantity <= 2).length,
    outOfStock: products.filter((p) => !p.quantity).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 p-4 sm:p-8 overflow-x-hidden">
      <ToastContainer autoClose={1500} toastClassName="rounded-xl shadow-lg text-sm font-medium" />
      
      <InventoryHeader 
        stats={stats} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        filteredCount={filteredProducts.length}
      />

      <InventoryTable 
        products={filteredProducts}
        editingId={editingId}
        editForm={editForm}
        savingId={savingId}
        deletingId={deletingId}
        onStartEdit={startEditing}
        onCancelEdit={cancelEdit}
        onSaveEdit={saveEdit}
        onDelete={deleteProduct}
        onEditChange={handleEditChange}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
    </div>
  );
}