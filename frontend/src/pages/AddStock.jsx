import { useState } from "react";
import { apiRequest } from "../utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function AddStock() {
  const [form, setForm] = useState({
    article: "",
    name: "",
    category: "",
    color: "",
    size: "",
    quantity: "",
    mrp: "",
    purchase_price: "",
  });

  const [tempProducts, setTempProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const categories = ["Men", "Women", "Girl", "Boy"];

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleEditChange(e) {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!form.article || !form.name || !form.quantity || !form.category) {
      toast.warn("⚠️ Article, Name, Quantity, and Category are required!", {
        position: "top-center",
      });
      return;
    }

    const newProduct = {
      tempId: Date.now(),
      ...form,
      quantity: Number(form.quantity),
      mrp: Number(form.mrp || 0),
      purchase_price: Number(form.purchase_price || 0),
    };

    setTempProducts([...tempProducts, newProduct]);

    toast.info("📝 Product added to review list!", {
      position: "top-center",
    });

    setForm({
      article: "",
      name: "",
      category: "",
      color: "",
      size: "",
      quantity: "",
      mrp: "",
      purchase_price: "",
    });
  }

  function startEditing(product) {
    setEditingId(product.tempId);
    setEditForm({ ...product });
  }

  function saveEdit() {
    if (!editForm.article || !editForm.name || !editForm.quantity || !editForm.category) {
      toast.warn("⚠️ Article, Name, Quantity, and Category are required!", {
        position: "top-center",
      });
      return;
    }

    const updatedProducts = tempProducts.map((p) =>
      p.tempId === editingId
        ? {
            ...editForm,
            quantity: Number(editForm.quantity),
            mrp: Number(editForm.mrp || 0),
            purchase_price: Number(editForm.purchase_price || 0),
          }
        : p
    );

    setTempProducts(updatedProducts);
    setEditingId(null);
    setEditForm({});

    toast.success("✅ Changes saved to review list!", {
      position: "top-center",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  function removeFromList(tempId) {
    setTempProducts(tempProducts.filter((p) => p.tempId !== tempId));
    toast.info("🗑️ Product removed from review list!", {
      position: "top-center",
    });
  }

  async function confirmAndSaveAll() {
    if (tempProducts.length === 0) {
      toast.warn("⚠️ No products to save!", { position: "top-center" });
      return;
    }

    try {
      for (const product of tempProducts) {
        const { tempId, ...payload } = product;
        console.log("📤 Sending product to backend:", payload); // Debug: Log payload
        await apiRequest("/inventory", "POST", payload);
      }

      toast.success("✅ All products added to inventory!", {
        position: "top-center",
      });

      // Dispatch custom event to notify Inventory.jsx
      window.dispatchEvent(new Event("inventoryUpdated"));

      setTempProducts([]);
    } catch (err) {
      console.error("❌ Failed to add products", err);
      toast.error("Failed to add some products. Check console.", {
        position: "top-center",
      });
    }
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <ToastContainer autoClose={2000} />
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">Add New Stock</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <input
          name="article"
          placeholder="Article No."
          className="border p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={form.article}
          onChange={handleChange}
        />
        <input
          name="name"
          placeholder="Product Name"
          className="border p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={form.name}
          onChange={handleChange}
        />
        <select
          name="category"
          className="border p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={form.category}
          onChange={handleChange}
        >
          <option value="" disabled>
            Select Category
          </option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <input
          name="color"
          placeholder="Color"
          className="border p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={form.color}
          onChange={handleChange}
        />
        <input
          name="size"
          placeholder="Size"
          className="border p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={form.size}
          onChange={handleChange}
        />
        <input
          name="quantity"
          type="number"
          placeholder="Quantity"
          className="border p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={form.quantity}
          onChange={handleChange}
        />
        <input
          name="mrp"
          type="number"
          placeholder="MRP"
          className="border p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={form.mrp}
          onChange={handleChange}
        />
        <input
          name="purchase_price"
          type="number"
          placeholder="Purchase Price"
          className="border p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={form.purchase_price}
          onChange={handleChange}
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2.5 rounded-lg shadow-md col-span-1 sm:col-span-2 lg:col-span-4 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center gap-2 font-semibold"
        >
          <PlusIcon className="h-5 w-5" />
          Add to Review List
        </button>
      </form>

      {tempProducts.length > 0 && (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
          <div className="flex justify-between items-center p-4 border-b bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-800">Review Recently Added Products</h2>
            <button
              onClick={confirmAndSaveAll}
              className="bg-green-600 text-white px-4 py-2.5 rounded-lg shadow-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 flex items-center gap-2 font-semibold"
            >
              <CheckIcon className="h-5 w-5" />
              Save All to Inventory
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="p-2 sm:p-3 text-left font-semibold">S.no</th>
                  <th className="p-2 sm:p-3 text-left font-semibold">Article</th>
                  <th className="p-2 sm:p-3 text-left font-semibold">Name</th>
                  <th className="p-2 sm:p-3 text-left font-semibold hidden sm:table-cell">Category</th>
                  <th className="p-2 sm:p-3 text-left font-semibold hidden sm:table-cell">Color</th>
                  <th className="p-2 sm:p-3 text-left font-semibold hidden md:table-cell">Size</th>
                  <th className="p-2 sm:p-3 text-left font-semibold">Qty</th>
                  <th className="p-2 sm:p-3 text-left font-semibold hidden lg:table-cell">Purchase Price</th>
                  <th className="p-2 sm:p-3 text-left font-semibold">MRP</th>
                  <th className="p-2 sm:p-3 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tempProducts.map((p, index) => (
                  <tr
                    key={p.tempId}
                    className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-blue-50 transition-colors duration-200`}
                  >
                    <td className="p-2 sm:p-3 border-b">{index + 1}</td>
                    <td className="p-2 sm:p-3 border-b">
                      {editingId === p.tempId ? (
                        <input
                          name="article"
                          value={editForm.article}
                          onChange={handleEditChange}
                          className="w-full border p-1 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      ) : (
                        p.article
                      )}
                    </td>
                    <td className="p-2 sm:p-3 border-b">
                      {editingId === p.tempId ? (
                        <input
                          name="name"
                          value={editForm.name}
                          onChange={handleEditChange}
                          className="w-full border p-1 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      ) : (
                        p.name
                      )}
                    </td>
                    <td className="p-2 sm:p-3 border-b hidden sm:table-cell">
                      {editingId === p.tempId ? (
                        <select
                          name="category"
                          value={editForm.category}
                          onChange={handleEditChange}
                          className="w-full border p-1 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          <option value="" disabled>
                            Select Category
                          </option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      ) : (
                        p.category || "-"
                      )}
                    </td>
                    <td className="p-2 sm:p-3 border-b hidden sm:table-cell">
                      {editingId === p.tempId ? (
                        <input
                          name="color"
                          value={editForm.color}
                          onChange={handleEditChange}
                          className="w-full border p-1 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      ) : (
                        p.color || "-"
                      )}
                    </td>
                    <td className="p-2 sm:p-3 border-b hidden md:table-cell">
                      {editingId === p.tempId ? (
                        <input
                          name="size"
                          value={editForm.size}
                          onChange={handleEditChange}
                          className="w-full border p-1 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      ) : (
                        p.size || "-"
                      )}
                    </td>
                    <td className="p-2 sm:p-3 border-b">
                      {editingId === p.tempId ? (
                        <input
                          name="quantity"
                          type="number"
                          value={editForm.quantity}
                          onChange={handleEditChange}
                          className="w-full border p-1 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      ) : (
                        p.quantity
                      )}
                    </td>
                    <td className="p-2 sm:p-3 border-b hidden lg:table-cell">
                      {editingId === p.tempId ? (
                        <input
                          name="purchase_price"
                          type="number"
                          value={editForm.purchase_price}
                          onChange={handleEditChange}
                          className="w-full border p-1 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      ) : (
                        `₹${p.purchase_price || 0}`
                      )}
                    </td>
                    <td className="p-2 sm:p-3 border-b">
                      {editingId === p.tempId ? (
                        <input
                          name="mrp"
                          type="number"
                          value={editForm.mrp}
                          onChange={handleEditChange}
                          className="w-full border p-1 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      ) : (
                        `₹${p.mrp || 0}`
                      )}
                    </td>
                    <td className="p-2 sm:p-3 border-b text-center space-x-2">
                      {editingId === p.tempId ? (
                        <>
                          <button
                            type="button"
                            onClick={saveEdit}
                            className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs sm:text-sm font-medium rounded-lg shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
                          >
                            <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
                            <span className="hidden sm:inline">Save</span>
                            <span className="sm:hidden">✅</span>
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="inline-flex items-center px-3 py-1 bg-gray-500 text-white text-xs sm:text-sm font-medium rounded-lg shadow-sm hover:bg-gray-600 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors duration-200"
                          >
                            <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
                            <span className="hidden sm:inline">Cancel</span>
                            <span className="sm:hidden">❌</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => startEditing(p)}
                            className="inline-flex items-center px-3 py-1 bg-yellow-500 text-white text-xs sm:text-sm font-medium rounded-lg shadow-sm hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition-colors duration-200"
                          >
                            <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
                            <span className="hidden sm:inline">Edit</span>
                            <span className="sm:hidden">✏️</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromList(p.tempId)}
                            className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-xs sm:text-sm font-medium rounded-lg shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                          >
                            <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
                            <span className="hidden sm:inline">Remove</span>
                            <span className="sm:hidden">🗑️</span>
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}