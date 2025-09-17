import { useEffect, useState } from "react";
import { apiRequest } from "../utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ArchiveBoxIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadInventory();

    const handleInventoryUpdate = () => {
      loadInventory();
      toast.info("🔄 Inventory updated!", { position: "top-center" });
    };

    window.addEventListener("inventoryUpdated", handleInventoryUpdate);

    return () => {
      window.removeEventListener("inventoryUpdated", handleInventoryUpdate);
    };
  }, []);

  async function loadInventory() {
    try {
      const data = await apiRequest("/inventory");
      console.log("📥 Inventory data received:", data); // Debug: Log API response
      setProducts(data);
    } catch (err) {
      console.error("❌ Failed to fetch inventory", err);
      toast.error("Failed to load inventory", { position: "top-center" });
    }
  }

  async function deleteProduct(id) {
    if (!window.confirm("Delete this product?")) return;
    try {
      await apiRequest(`/inventory/${id}`, "DELETE");
      toast.success("🗑️ Product deleted!", { position: "top-center" });
      loadInventory();
    } catch (err) {
      console.error("❌ Delete error:", err);
      toast.error("Failed to delete product", { position: "top-center" });
    }
  }

  const filteredProducts = products.filter((p) =>
    p.article.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <ToastContainer autoClose={1500} />
      <div className="flex items-center mb-6">
        <ArchiveBoxIcon className="h-8 w-8 text-blue-600 mr-3" />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Inventory</h1>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="Search by Article No."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-1/2 border p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs sm:text-sm"
        />
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="inline-flex items-center px-3 py-1 bg-gray-500 text-white text-xs sm:text-sm font-medium rounded-lg shadow-sm hover:bg-gray-600 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors duration-200"
          >
            <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
            <span className="hidden sm:inline">Clear</span>
            <span className="sm:hidden">❌</span>
          </button>
        )}
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="p-2 sm:p-3 text-left font-semibold">S.no</th>
                <th className="p-2 sm:p-3 text-left font-semibold">Article</th>
                <th className="p-2 sm:p-3 text-left font-semibold">Name</th>
                <th className="p-2 sm:p-3 text-left font-semibold hidden sm:table-cell">Color</th>
                <th className="p-2 sm:p-3 text-left font-semibold hidden md:table-cell">Size</th>
                <th className="p-2 sm:p-3 text-left font-semibold">Qty</th>
                <th className="p-2 sm:p-3 text-left font-semibold hidden lg:table-cell">Purchase Price</th>
                <th className="p-2 sm:p-3 text-left font-semibold">MRP</th>
                <th className="p-2 sm:p-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p, index) => (
                  <tr
                    key={p.id}
                    className={`${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-blue-50 transition-colors duration-200`}
                  >
                    <td className="p-2 sm:p-3 border-b">{index + 1}</td>
                    <td className="p-2 sm:p-3 border-b">{p.article}</td>
                    <td className="p-2 sm:p-3 border-b">{p.name}</td>
                    <td className="p-2 sm:p-3 border-b hidden sm:table-cell">{p.color || "-"}</td>
                    <td className="p-2 sm:p-3 border-b hidden md:table-cell">{p.size || "-"}</td>
                    <td className="p-2 sm:p-3 border-b">{p.quantity}</td>
                    <td className="p-2 sm:p-3 border-b hidden lg:table-cell">₹{p.purchase_price ?? "-"}</td>
                    <td className="p-2 sm:p-3 border-b">₹{p.mrp}</td>
                    <td className="p-2 sm:p-3 border-b text-center">
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="inline-flex items-center px-2 sm:px-3 py-1 bg-red-600 text-white text-xs font-medium rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                      >
                        <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
                        <span className="hidden sm:inline">Delete</span>
                        <span className="sm:hidden">🗑️</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-6 text-gray-500 font-medium">
                    {searchQuery ? "No products match the search." : "No products in inventory."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}