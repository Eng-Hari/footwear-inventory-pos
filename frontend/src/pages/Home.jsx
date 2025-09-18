import { useState, useEffect, useRef } from "react";
import { apiRequest } from "../utils/api";
import { toast } from "react-toastify";
import Invoice from "../components/Invoice";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [amountReceived, setAmountReceived] = useState("");
  const [paymentType, setPaymentType] = useState("Cash");
  const [settings, setSettings] = useState({});
  const [billNumber, setBillNumber] = useState("");

  const [lastCart, setLastCart] = useState([]);
  const [lastDiscount, setLastDiscount] = useState(0);
  const [lastSubtotal, setLastSubtotal] = useState(0);
  const [lastTotal, setLastTotal] = useState(0);
  const [lastAmountReceived, setLastAmountReceived] = useState(0);
  const [lastChange, setLastChange] = useState(0);
  const [lastPaymentType, setLastPaymentType] = useState("Cash");

  const invoiceRef = useRef();
  const searchRef = useRef();

  const subtotal = cart.reduce((acc, i) => acc + i.qty * (i.mrp || 0), 0);
  const total = subtotal - discount;
  const change = amountReceived ? Number(amountReceived) - total : 0;

  // Auto-focus search bar
  useEffect(() => searchRef.current?.focus(), []);

  // Load settings
  useEffect(() => {
    const saved = localStorage.getItem("shopSettings");
    if (saved) setSettings(JSON.parse(saved));
    else loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const data = await apiRequest("/settings");
      const s = { shop_name: "Suresh Footwears", gst_number: "", contact_number: "", address: "", gst_percent: 5, ...data };
      setSettings(s);
      localStorage.setItem("shopSettings", JSON.stringify(s));
    } catch {
      const fallback = { shop_name: "Suresh Footwears", gst_number: "", contact_number: "", address: "", gst_percent: 5 };
      setSettings(fallback);
      localStorage.setItem("shopSettings", JSON.stringify(fallback));
    }
  }

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => search.trim() ? searchProducts(search) : setProducts([]), 300);
    return () => clearTimeout(t);
  }, [search]);

  async function searchProducts(query) {
    try {
      const data = await apiRequest(`/inventory?search=${query}`);
      setProducts(data);
    } catch (err) {
      toast.error(`Failed to fetch products: ${err.message}`);
    }
  }

  function addToCart(product) {
    if (!product.mrp || product.quantity < 1) return toast.warn("⚠️ Invalid price or out of stock!");
    setCart(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) {
        if (exists.qty + 1 > product.quantity) return toast.warn("⚠️ Stock limit exceeded!") && prev;
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setSearch(""); setProducts([]); searchRef.current?.focus();
  }

  const updateQty = (id, delta) => {
    setCart(prev =>
      prev.map(i => i.id === id ? { ...i, qty: Math.max(1, Math.min(i.quantity, i.qty + delta)) } : i)
          .filter(i => i.qty > 0)
    );
    searchRef.current?.focus();
  };

  const removeFromCart = id => { setCart(prev => prev.filter(i => i.id !== id)); searchRef.current?.focus(); };

  async function handleSave() {
    if (!cart.length) return toast.warn("⚠️ Cart is empty!");
    if (!amountReceived || Number(amountReceived) < total) return toast.warn("⚠️ Enter valid amount!");

    const today = new Date();
    const billNo = `BILL-${today.getFullYear()}${String(today.getMonth()+1).padStart(2,"0")}${String(today.getDate()).padStart(2,"0")}-${Date.now().toString().slice(-5)}`;
    setBillNumber(billNo);

    const payload = { items: cart.map(i => ({ id: i.id, qty: i.qty, mrp: i.mrp })), total, discount, payment_mode: paymentType.toLowerCase(), amount_received: Number(amountReceived), bill_number: billNo };

    try {
      await apiRequest("/sales", "POST", payload);
      toast.success("✅ Sale saved!");

      // Capture last invoice data before clearing
      setLastCart([...cart]);
      setLastDiscount(discount);
      setLastSubtotal(subtotal);
      setLastTotal(total);
      setLastAmountReceived(Number(amountReceived));
      setLastPaymentType(paymentType);
      setLastChange(change);

      // Clear current states
      setCart([]);
      setDiscount(0);
      setAmountReceived("");
      setPaymentType("Cash");
      searchRef.current?.focus();
    } catch (err) { toast.error(`Failed to save sale: ${err.message}`); }
  }

  function handlePrint() {
    if (!billNumber) return toast.warn("⚠️ Save the sale first!");
    if (!invoiceRef.current) return toast.error("❌ Invoice not ready!");
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`<html><head><title>Invoice</title></head><body>${invoiceRef.current.innerHTML}</body></html>`);
    printWindow.document.close(); printWindow.focus(); printWindow.print(); printWindow.close();
    searchRef.current?.focus();
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 max-w-4xl mx-auto">
      <div className="bg-white shadow-2xl rounded-xl p-6">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-800">{settings.shop_name || "SURESH FOOTWEARS"}</h2>

        {/* Search */}
        <div className="relative mb-6">
          <input ref={searchRef} type="text" placeholder="Search by Article No." value={search} onChange={e => setSearch(e.target.value)}
            className={`w-full border p-3 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg transition-all ${products.length > 0 ? 'bg-blue-50' : ''}`}
          />
          {products.length > 0 && (
            <ul className="absolute z-10 bg-white border rounded-lg shadow-lg max-h-60 w-full overflow-auto mt-1">
              {products.map(p => (
                <li key={p.id} className="p-3 hover:bg-blue-50 cursor-pointer transition-colors border-b last:border-0" onClick={() => addToCart(p)}>
                  {p.article} - {p.name} (Color: {p.color || "N/A"}) (Size: {p.size}) (₹{p.mrp?.toFixed(2) || "N/A"}) | Stock: {p.quantity}
                  <hr className="mt-2 border-gray-200" />
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
                <tr><th>Article</th><th>Name</th><th>Qty</th><th>MRP</th><th>Total</th><th>Actions</th></tr>
              </thead>
              <tbody className="bg-white">
                {cart.map(item => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-center">{item.article}</td>
                    <td className="p-3">{item.name} (Size: {item.size})</td>
                    <td className="p-3 flex items-center justify-center gap-2">
                      <button onClick={() => updateQty(item.id, -1)} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">-</button>
                      {item.qty}
                      <button onClick={() => updateQty(item.id, 1)} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">+</button>
                    </td>
                    <td className="p-3 text-right">₹ {item.mrp?.toFixed(2)}</td>
                    <td className="p-3 text-right">₹ {(item.qty * (item.mrp || 0)).toFixed(2)}</td>
                    <td className="p-3 text-center"><button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Billing Section */}
        <div className="mt-6 bg-white shadow-md rounded-lg p-6 space-y-4">
          <div className="flex justify-between text-lg"><span>Subtotal:</span><span>₹ {subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between items-center">
            <label className="text-lg">Discount:</label>
            <input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))}
              className="border p-2 w-24 text-right rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-between text-lg font-bold"><span>Total:</span><span>₹ {total.toFixed(2)}</span></div>
          <div className="flex gap-4 items-center">
            <select value={paymentType} onChange={e => setPaymentType(e.target.value)}
              className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
            >
              <option>Cash</option><option>UPI</option><option>Card</option>
            </select>
            <input type="number" placeholder="Amount Received" value={amountReceived} onChange={e => setAmountReceived(e.target.value)}
              className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
            />
          </div>
          <div className={`flex justify-between text-lg font-semibold ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
            <span>Change:</span><span>₹ {change.toFixed(2)}</span>
          </div>
          <div className="flex gap-4">
            <button onClick={handleSave} disabled={!amountReceived || Number(amountReceived) < total}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg w-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg font-semibold"
            >Save Sale</button>
            <button onClick={handlePrint} disabled={!billNumber}
              className="bg-green-600 text-white px-6 py-3 rounded-lg w-full hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg font-semibold"
            >Print Invoice</button>
          </div>
        </div>

        {/* Hidden Invoice */}
        <div className="hidden">
          <Invoice 
            cart={billNumber ? lastCart : cart} 
            subtotal={billNumber ? lastSubtotal : subtotal} 
            total={billNumber ? lastTotal : total} 
            discount={billNumber ? lastDiscount : discount} 
            paymentType={billNumber ? lastPaymentType : paymentType}
            amountReceived={billNumber ? lastAmountReceived : amountReceived ? Number(amountReceived) : 0} 
            change={billNumber ? lastChange : change} 
            settings={settings} 
            billNumber={billNumber} 
            invoiceRef={invoiceRef}
          />
        </div>
      </div>
    </div>
  );
}