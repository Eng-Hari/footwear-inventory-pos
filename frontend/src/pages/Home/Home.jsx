import { useState, useEffect, useRef } from "react";
import { apiRequest } from "../../utils/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Invoice from "../../components/Invoice";
import ProductSearch from "./ProductSearch";
import BillingPanel from "./BillingPanel";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [amountReceived, setAmountReceived] = useState("");
  const [paymentType, setPaymentType] = useState("Cash");
  const [settings, setSettings] = useState({});
  const [billNumber, setBillNumber] = useState("");

  // History for Print
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

  useEffect(() => {
    loadSettings();
    searchRef.current?.focus();
  }, []);

  async function loadSettings() {
    try {
      const data = await apiRequest("/settings");
      const s = { shop_name: "Footwears", gst_percent: 5, ...data };
      setSettings(s);
    } catch {
      setSettings({ shop_name: "Footwears", gst_percent: 5 });
    }
  }

  useEffect(() => {
    const t = setTimeout(() => (search.trim() ? searchProducts(search) : setProducts([])), 300);
    return () => clearTimeout(t);
  }, [search]);

  async function searchProducts(query) {
    try {
      const data = await apiRequest(`/inventory`);
      const filtered = data.filter(p =>
        p.name?.toLowerCase().includes(query.toLowerCase()) ||
        String(p.article).toLowerCase().includes(query.toLowerCase())
      );
      setProducts(filtered);
    } catch (err) {
      toast.error(`Failed to fetch products: ${err.message}`);
    }
  }

  function addToCart(product) {
    if (!product.mrp || product.quantity < 1) return toast.warn("Invalid stock!");
    setCart(prev => {
      const exists = prev.find(i => i.id === product.id || String(i.article) === String(product.article));
      if (exists) {
        if (exists.qty + 1 > product.quantity) {
          toast.warn("Stock limit exceeded!");
          return prev;
        }
        return prev.map(i => i.id === exists.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setSearch(""); setProducts([]); searchRef.current?.focus();
  }

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, Math.min(i.quantity, i.qty + delta)) } : i));
  };

  const removeFromCart = id => setCart(prev => prev.filter(i => i.id !== id));

  async function handleSave() {
    const billNo = `BILL-${Date.now().toString().slice(-8)}`;
    const payload = {
      items: cart.map(i => ({ id: i.id, qty: i.qty, mrp: i.mrp })),
      total, discount, payment_mode: paymentType.toLowerCase(),
      amount_received: Number(amountReceived), bill_number: billNo,
    };

    try {
      await apiRequest("/sales", "POST", payload);
      toast.success("Sale saved!");
      setLastCart([...cart]); setLastDiscount(discount); setLastSubtotal(subtotal);
      setLastTotal(total); setLastAmountReceived(Number(amountReceived));
      setLastPaymentType(paymentType); setLastChange(change);
      setBillNumber(billNo);
      setCart([]); setDiscount(0); setAmountReceived(""); setPaymentType("Cash");
      searchRef.current?.focus();
    } catch (err) { toast.error("Failed to save sale"); }
  }

  function handlePrint() {
    if (!invoiceRef.current) return;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`<html><body>${invoiceRef.current.innerHTML}</body></html>`);
    printWindow.document.close(); printWindow.print(); printWindow.close();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-10">
      <ToastContainer autoClose={2000} />
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white"><ShoppingBagIcon className="w-5" /></div>
            <h1 className="text-xl font-bold">{settings.shop_name}</h1>
          </div>
        </div>

        <ProductSearch 
          search={search} 
          setSearch={setSearch} 
          products={products} 
          setProducts={setProducts} 
          addToCart={addToCart} 
          cart={cart}
          searchRef={searchRef}
        />

        <BillingPanel 
          cart={cart}
          updateQty={updateQty}
          removeFromCart={removeFromCart}
          subtotal={subtotal}
          discount={discount}
          setDiscount={setDiscount}
          total={total}
          paymentType={paymentType}
          setPaymentType={setPaymentType}
          amountReceived={amountReceived}
          setAmountReceived={setAmountReceived}
          change={change}
          handleSave={handleSave}
          handlePrint={handlePrint}
          billNumber={billNumber}
        />

        <div className="hidden">
          <Invoice 
            cart={billNumber ? lastCart : cart} 
            total={billNumber ? lastTotal : total} 
            settings={settings} 
            billNumber={billNumber} 
            invoiceRef={invoiceRef}
            subtotal={billNumber ? lastSubtotal : subtotal}
            discount={billNumber ? lastDiscount : discount}
            paymentType={billNumber ? lastPaymentType : paymentType}
            amountReceived={billNumber ? lastAmountReceived : Number(amountReceived)}
            change={billNumber ? lastChange : change}
          />
        </div>
      </div>
    </div>
  );
}