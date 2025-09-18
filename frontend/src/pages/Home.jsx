
import { useState, useEffect, useRef } from "react";
import { apiRequest } from "../utils/api";
import { toast } from "react-toastify";
import Invoice from "../components/Invoice";
import * as htmlToImage from "html-to-image";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [amountReceived, setAmountReceived] = useState("");
  const [paymentType, setPaymentType] = useState("Cash");
  const [settings, setSettings] = useState({
    shop_name: "",
    gst_number: "",
    contact_number: "",
    address: "",
    gst_percent: 5,
  });
  const [billNumber, setBillNumber] = useState("");

  const invoiceRef = useRef();
  const searchRef = useRef();

  const subtotal = cart.reduce((acc, item) => acc + item.qty * (item.mrp || 0), 0);
  const total = subtotal - discount;
  const change = amountReceived ? Number(amountReceived) - total : 0;

  // Auto-focus search bar
  useEffect(() => {
    searchRef.current.focus();
  }, []);

  // Load settings from localStorage or backend
  useEffect(() => {
    const savedSettings = localStorage.getItem("shopSettings");
    if (savedSettings && savedSettings !== "undefined" && savedSettings !== "null") {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (err) {
        console.error("❌ Error parsing settings:", err);
        loadSettings();
      }
    } else {
      loadSettings();
    }
  }, []);

  async function loadSettings() {
    try {
      const data = await apiRequest("/settings");
      const safeData = {
        shop_name: data.shop_name || "Suresh Footwears",
        gst_number: data.gst_number || "",
        contact_number: data.contact_number || "",
        address: data.address || "",
        gst_percent: Number(data.gst_percent) || 5,
      };
      setSettings(safeData);
      localStorage.setItem("shopSettings", JSON.stringify(safeData));
    } catch (err) {
      console.error("❌ Failed to load settings:", err.message, err.stack);
      toast.error(`Failed to load settings: ${err.message}`, { position: "top-center" });
      // Fallback settings
      const fallbackSettings = {
        shop_name: "Suresh Footwears",
        gst_number: "",
        contact_number: "",
        address: "",
        gst_percent: 5,
      };
      setSettings(fallbackSettings);
      localStorage.setItem("shopSettings", JSON.stringify(fallbackSettings));
    }
  }

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim() !== "") searchProducts(search);
      else setProducts([]);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  async function searchProducts(query) {
    try {
      const data = await apiRequest(`/inventory?search=${query}`);
      setProducts(data);
    } catch (err) {
      console.error("❌ Failed to fetch products:", err.message, err.stack);
      toast.error(`Failed to fetch products: ${err.message}`, { position: "top-center" });
    }
  }

  function addToCart(product) {
    if (product.quantity < 1) {
      toast.warn("⚠️ Product out of stock!", { position: "top-center" });
      return;
    }
    if (!product.mrp || isNaN(product.mrp)) {
      toast.warn("⚠️ Invalid product price!", { position: "top-center" });
      return;
    }
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        if (exists.qty + 1 > product.quantity) {
          toast.warn("⚠️ Cannot add more than available stock!", { position: "top-center" });
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setSearch("");
    setProducts([]);
    searchRef.current.focus(); // Re-focus after adding
  }

  function updateQty(id, delta) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? {
                ...item,
                qty: Math.max(1, Math.min(item.quantity, item.qty + delta)),
              }
            : item
        )
        .filter((item) => item.qty > 0)
    );
    searchRef.current.focus(); // Re-focus after updating
  }

  function removeFromCart(productId) {
    setCart((prev) => prev.filter((item) => item.id !== productId));
    searchRef.current.focus(); // Re-focus after removing
  }

  async function handleSave() {
    toast.info("🛒 Saving sale...", { position: "top-center" });
    if (cart.length === 0) {
      toast.warn("⚠️ Cart is empty!", { position: "top-center" });
      return;
    }
    if (!amountReceived || Number(amountReceived) < total) {
      toast.warn("⚠️ Enter a valid Amount Received!", { position: "top-center" });
      return;
    }

    const today = new Date();
    const generatedBillNumber = `BILL-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}-${Date.now().toString().slice(-5)}`;
    setBillNumber(generatedBillNumber);

    const payload = {
      items: cart.map((item) => ({ id: item.id, qty: item.qty, mrp: item.mrp })),
      total,
      discount,
      payment_mode: paymentType.toLowerCase(),
      amount_received: Number(amountReceived),
      bill_number: generatedBillNumber,
    };

    try {
      const response = await apiRequest("/sales", "POST", payload);
      console.log("✅ Sale saved:", response);
      toast.success("✅ Sale saved successfully!", { position: "top-center" });
      setCart([]);
      setDiscount(0);
      setAmountReceived("");
      setPaymentType("Cash");
      searchRef.current.focus(); // Re-focus after saving
    } catch (err) {
      console.error("❌ Failed to save sale:", err.message, err.stack);
      toast.error(`Failed to save sale: ${err.message}`, { position: "top-center" });
    }
  }

  function handlePrint() {
    if (!billNumber) {
      toast.warn("⚠️ Save the sale first to print the invoice!", { position: "top-center" });
      return;
    }
    if (!invoiceRef.current) {
      toast.error("❌ Invoice not ready!", { position: "top-center" });
      return;
    }

    toast.info("🖨️ Printing invoice...", { position: "top-center" });
    const printContent = invoiceRef.current.innerHTML;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(
      `<html><head><title>Invoice</title><style>@media print { body { font-size: 10pt; } }</style></head><body>${printContent}</body></html>`
    );
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
    searchRef.current.focus(); // Re-focus after printing
  }

  async function handleDownloadPDF() {
    if (!billNumber) {
      toast.warn("⚠️ Save the sale first to download the invoice!", { position: "top-center" });
      return;
    }
    if (!invoiceRef.current) {
      toast.error("❌ Invoice not ready!", { position: "top-center" });
      return;
    }

    toast.info("📄 Generating PDF...", { position: "top-center" });
    try {
      // Dynamically import jsPDF to avoid module conflicts
      const { jsPDF } = await import("jsPDF");
      // Temporarily show the invoice for rendering
      invoiceRef.current.classList.remove("hidden");
      const dataUrl = await htmlToImage.toPng(invoiceRef.current, {
        pixelRatio: 2, // Improve quality for PDF
        width: 226, // Approx 80mm at 72dpi
      });
      invoiceRef.current.classList.add("hidden");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, 297], // A4 height, 80mm width for thermal printer
      });
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${billNumber}.pdf`);
      toast.success("✅ PDF downloaded successfully!", { position: "top-center" });
      searchRef.current.focus(); // Re-focus after downloading
    } catch (err) {
      console.error("❌ Failed to generate PDF:", err.message, err.stack);
      toast.error(`Failed to generate PDF: ${err.message}`, { position: "top-center" });
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 max-w-4xl mx-auto">
      <div className="bg-white shadow-2xl rounded-xl p-6">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-800">
          {settings.shop_name || "SURESH FOOTWEARS"}
        </h2>

        {/* Search */}
        <div className="relative mb-6">
          <input
            ref={searchRef}
            type="text"
            placeholder="Search by Article No."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border p-3 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg transition-all"
          />
          {products.length > 0 && (
            <ul className="absolute z-10 bg-white border rounded-lg shadow-lg max-h-60 w-full overflow-auto mt-1">
              {products.map((p) => (
                <li
                  key={p.id}
                  className="p-3 hover:bg-blue-50 cursor-pointer transition-colors border-b last:border-0"
                  onClick={() => addToCart(p)}
                >
                  {p.article} - {p.name} (Size: {p.size}) (₹{p.mrp?.toFixed(2) || "N/A"}) | Stock: {p.quantity}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Cart Table */}
        {cart.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse mt-6 text-sm shadow-md rounded-lg overflow-hidden">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-3">Article</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">MRP</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {cart.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-center">{item.article}</td>
                    <td className="p-3">{item.name} (Size: {item.size})</td>
                    <td className="p-3 flex items-center justify-center gap-2">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                      >
                        -
                      </button>
                      {item.qty}
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                      >
                        +
                      </button>
                    </td>
                    <td className="p-3 text-right">₹ {item.mrp?.toFixed(2) || "0.00"}</td>
                    <td className="p-3 text-right">₹ {(item.qty * (item.mrp || 0)).toFixed(2)}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Billing Section */}
        <div className="mt-6 bg-white shadow-md rounded-lg p-6 space-y-4">
          <div className="flex justify-between text-lg">
            <span>Subtotal:</span>
            <span>₹ {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <label className="text-lg">Discount:</label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="border p-2 w-24 text-right rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>₹ {total.toFixed(2)}</span>
          </div>
          <div className="flex gap-4 items-center">
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
            >
              <option>Cash</option>
              <option>UPI</option>
              <option>Card</option>
            </select>
            <input
              type="number"
              placeholder="Amount Received"
              value={amountReceived}
              onChange={(e) => setAmountReceived(e.target.value)}
              className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
            />
          </div>
          <div className={`flex justify-between text-lg font-semibold ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
            <span>Change:</span>
            <span>₹ {change.toFixed(2)}</span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={!amountReceived || Number(amountReceived) < total}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg w-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg font-semibold"
            >
              Save Sale
            </button>
            <button
              onClick={handlePrint}
              disabled={!billNumber}
              className="bg-green-600 text-white px-6 py-3 rounded-lg w-full hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg font-semibold"
            >
              Print Invoice
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={!billNumber}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg w-full hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg font-semibold"
            >
              Download PDF
            </button>
          </div>
        </div>

        {/* Hidden Invoice */}
        <div className="hidden">
          <Invoice
            cart={cart}
            subtotal={subtotal}
            total={total}
            discount={discount}
            paymentType={paymentType}
            amountReceived={Number(amountReceived)}
            change={change}
            settings={settings}
            billNumber={billNumber}
            invoiceRef={invoiceRef}
          />
        </div>
      </div>
    </div>
  );
}