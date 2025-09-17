

import { useEffect, useState } from "react";
import { apiRequest } from "../utils/api";
import { toast } from "react-toastify";

export default function LowStock() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isCopyingText, setIsCopyingText] = useState(false);
  const LOW_STOCK_LIMIT = 2;

  useEffect(() => {
    loadLowStock();
  }, []);

  async function loadLowStock() {
    try {
      const data = await apiRequest("/inventory");
      const lowStock = data.filter((p) => p.quantity < LOW_STOCK_LIMIT);
      setProducts(lowStock);
    } catch (err) {
      console.error("❌ Failed to load low stock items:", err);
      toast.error("Failed to load low stock items", { position: "top-center" });
    }
  }

  // Filter based on search input
  const filtered = products.filter(
    (p) =>
      p.article.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.color.toLowerCase().includes(search.toLowerCase()) ||
      p.mrp.toString().includes(search) ||
      p.quantity.toString().includes(search)
  );

  // Generate PDF using LaTeX
  async function generatePDF() {
    setIsGeneratingPDF(true);
    try {
      const latexContent = `
\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\geometry{a4paper, margin=1in}
\\usepackage{booktabs}
\\usepackage{array}
\\usepackage{siunitx}
\\sisetup{group-separator={,}, group-minimum-digits=4}
\\begin{document}

\\begin{center}
{\\Large \\textbf{Low Stock Report}} \\\\
\\vspace{0.5cm}
Generated on \\today \\ at \\currenttime
\\end{center}

\\vspace{1cm}

\\begin{table}[h]
\\centering
\\begin{tabular}{|l|l|l|c|c|S[table-format=6.2]|}
\\hline
\\textbf{Article} & \\textbf{Name} & \\textbf{Color} & \\textbf{Size} & \\textbf{Qty} & \\textbf{MRP (₹)} \\\\
\\hline
${filtered.map((p) => (
  `${p.article.replace(/&/g, "\\&")} & ${p.name.replace(/&/g, "\\&")} & ${p.color.replace(/&/g, "\\&")} & ${p.size} & ${p.quantity} & ${(p.mrp || 0).toFixed(2)}`
)).join(" \\\\\n\\hline\n")}
\\hline
\\end{tabular}
\\caption{Low Stock Items (Quantity < ${LOW_STOCK_LIMIT})}
\\end{table}

\\end{document}
      `;

      const blob = new Blob([latexContent], { type: "text/latex" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `LowStock_Report_${new Date().toISOString().split("T")[0]}.tex`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("✅ PDF report generated!", { position: "top-center" });
    } catch (err) {
      console.error("❌ Failed to generate PDF:", err);
      toast.error("Failed to generate PDF", { position: "top-center" });
    } finally {
      setIsGeneratingPDF(false);
    }
  }

  // Generate sharable text message
  async function generateTextMessage() {
    setIsCopyingText(true);
    try {
      const text = `Low Stock Report (${new Date().toLocaleString()})\n\n` +
        `Items with quantity below ${LOW_STOCK_LIMIT}:\n` +
        filtered.map((p, index) =>
          `${index + 1}. Article: ${p.article}, Name: ${p.name}, Color: ${p.color}, Size: ${p.size}, Quantity: ${p.quantity}, MRP: ₹${(p.mrp || 0).toFixed(2)}`
        ).join("\n") +
        `\n\nTotal Low Stock Items: ${filtered.length}`;
      
      await navigator.clipboard.writeText(text);
      toast.success("✅ Text message copied to clipboard!", { position: "top-center" });
    } catch (err) {
      console.error("❌ Failed to copy text:", err);
      toast.error("Failed to copy text", { position: "top-center" });
    } finally {
      setIsCopyingText(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Low Stock Items</h1>

      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Article/Name/Color/MRP/Qty"
          className="border border-gray-300 rounded-lg p-2 flex-1 min-w-[200px]"
        />
        <button
          onClick={generatePDF}
          disabled={isGeneratingPDF || filtered.length === 0}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {isGeneratingPDF ? "Generating..." : "Generate PDF"}
        </button>
        <button
          onClick={generateTextMessage}
          disabled={isCopyingText || filtered.length === 0}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed"
        >
          {isCopyingText ? "Copying..." : "Share via Text"}
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500">No low stock products found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white shadow rounded-xl">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 text-left">Article</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Color</th>
                <th className="p-3 text-left">Size</th>
                <th className="p-3 text-left">Qty</th>
                <th className="p-3 text-left">MRP</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{p.article}</td>
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.color}</td>
                  <td className="p-3">{p.size}</td>
                  <td className="p-3 text-red-600 font-bold">{p.quantity}</td>
                  <td className="p-3">₹{(p.mrp || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}