
import { useEffect, useState } from "react";
import { apiRequest } from "../utils/api";
import { toast, ToastContainer } from "react-toastify";
import {
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  DocumentArrowDownIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";

export default function LowStock() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isCopyingText, setIsCopyingText] = useState(false);

  const LOW_STOCK_LIMIT = 2;

  useEffect(() => {
    loadLowStock();
  }, []);

  async function loadLowStock() {
    try {
      const data = await apiRequest("/inventory");
      setProducts(data.filter((p) => p.quantity < LOW_STOCK_LIMIT));
    } catch {
      toast.error("Failed to load low stock items", { position: "top-right" });
    }
  }

  const filtered = products.filter(
    (p) =>
      p.article.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.color.toLowerCase().includes(search.toLowerCase()) ||
      p.mrp.toString().includes(search) ||
      p.quantity.toString().includes(search)
  );

  const stockBadge = (qty) => {
    if (qty === 0) return "bg-red-100 text-red-600";
    if (qty <= 2) return "bg-amber-100 text-amber-600";
    return "bg-emerald-100 text-emerald-700";
  };

  async function generatePDF() {
    setIsGeneratingPDF(true);
    try {
      const latexContent = `...`;
      const blob = new Blob([latexContent], { type: "text/latex" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `LowStock_Report_${new Date().toISOString().split("T")[0]}.tex`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF generated!", { position: "top-right" });
    } catch {
      toast.error("Failed to generate PDF", { position: "top-right" });
    } finally {
      setIsGeneratingPDF(false);
    }
  }

  async function generateTextMessage() {
    setIsCopyingText(true);
    try {
      const text =
        `Low Stock Report (${new Date().toLocaleString()})\n\n` +
        filtered.map((p, i) => `${i + 1}. ${p.article} - ${p.name} (${p.quantity})`).join("\n");

      await navigator.clipboard.writeText(text);
      toast.success("Copied!", { position: "top-right" });
    } catch {
      toast.error("Copy failed", { position: "top-right" });
    } finally {
      setIsCopyingText(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 p-4 sm:p-8">
      <ToastContainer autoClose={1500} />

      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
            <ExclamationTriangleIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Low Stock</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {filtered.length} item{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* SEARCH + ACTIONS */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div
          className={`flex items-center gap-3 bg-white border rounded-2xl px-4 py-3 shadow-sm flex-1 transition-all duration-200
          ${
            searchFocused
              ? "border-blue-400 ring-2 ring-blue-100"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <MagnifyingGlassIcon className={`w-5 h-5 ${searchFocused ? "text-blue-500" : "text-gray-400"}`} />

          <input
            type="text"
            placeholder="Search low stock..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="flex-1 text-sm text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none"
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-xs text-gray-500 hover:text-red-500 bg-gray-100 hover:bg-red-50 px-2 py-1 rounded-lg"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <ActionBtn
            onClick={generatePDF}
            disabled={isGeneratingPDF || filtered.length === 0}
            color="blue"
            icon={<DocumentArrowDownIcon className="w-3.5 h-3.5" />}
            label={isGeneratingPDF ? "Generating…" : "PDF"}
          />
          <ActionBtn
            onClick={generateTextMessage}
            disabled={isCopyingText || filtered.length === 0}
            color="emerald"
            icon={<ClipboardDocumentIcon className="w-3.5 h-3.5" />}
            label={isCopyingText ? "Copying…" : "Share"}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <ExclamationTriangleIcon className="w-4 h-4" /> Low Stock List
          </h2>
          <span className="text-blue-100 text-xs">
            {filtered.length} item{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Article", "Name", "Color", "Size", "Qty", "MRP"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {filtered.length > 0 ? (
                filtered.map((p, i) => (
                  <tr
                    key={p.id}
                    className={`${
                      i % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                    } hover:bg-blue-50/40 transition-colors duration-150`}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg">
                        {p.article}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.color}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.size}</td>

                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${stockBadge(p.quantity)}`}>
                        {p.quantity}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-semibold text-gray-900">
                      ₹{(p.mrp || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-400">
                    No low stock items found
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

/* BUTTON */
const btnStyles = {
  blue: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600",
};

function ActionBtn({ onClick, disabled, color, icon, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all duration-150
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${btnStyles[color]}`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}