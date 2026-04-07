
import { useState, useEffect, useRef } from "react";
import { apiRequest } from "../utils/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Invoice from "../components/Invoice";
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  TrashIcon,
  PrinterIcon,
  CheckCircleIcon,
  TagIcon,
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const PAYMENT_OPTIONS = [
  { label: "Cash", icon: BanknotesIcon },
  { label: "UPI", icon: DevicePhoneMobileIcon },
  { label: "Card", icon: CreditCardIcon },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [amountReceived, setAmountReceived] = useState("");
  const [paymentType, setPaymentType] = useState("Cash");
  const [settings, setSettings] = useState({});
  const [billNumber, setBillNumber] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

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
  const canSave = amountReceived && Number(amountReceived) >= total && cart.length > 0;

  useEffect(() => searchRef.current?.focus(), []);

  useEffect(() => {
    const saved = localStorage.getItem("shopSettings");
    if (saved) setSettings(JSON.parse(saved));
    else loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const data = await apiRequest("/settings");
      const s = { shop_name: "Footwears", gst_number: "", contact_number: "", address: "", gst_percent: 5, ...data };
      setSettings(s);
      localStorage.setItem("shopSettings", JSON.stringify(s));
    } catch {
      const fallback = { shop_name: "Footwears", gst_number: "", contact_number: "", address: "", gst_percent: 5 };
      setSettings(fallback);
      localStorage.setItem("shopSettings", JSON.stringify(fallback));
    }
  }

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
    if (!product.mrp || product.quantity < 1) return toast.warn("Invalid price or out of stock!");
    setCart(prev => {
      const exists = prev.find(
        i => i.id === product.id || String(i.article) === String(product.article)
      );
      if (exists) {
        if (exists.qty + 1 > product.quantity) {
          toast.warn("Stock limit exceeded!");
          return prev;
        }
        return prev.map(i =>
          i.id === exists.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setSearch(""); setProducts([]); searchRef.current?.focus();
  }

  const updateQty = (id, delta) => {
    setCart(prev =>
      prev.map(i => i.id === id ? { ...i, qty: Math.max(1, Math.min(i.quantity, i.qty + delta)) } : i)
    );
    searchRef.current?.focus();
  };

  const removeFromCart = id => { setCart(prev => prev.filter(i => i.id !== id)); searchRef.current?.focus(); };

  async function handleSave() {
    if (!cart.length) return toast.warn("Cart is empty!");
    if (!amountReceived || Number(amountReceived) < total) return toast.warn("Enter valid amount!");

    const today = new Date();
    const billNo = `BILL-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}-${Date.now().toString().slice(-5)}`;
    setBillNumber(billNo);

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
      setCart([]); setDiscount(0); setAmountReceived(""); setPaymentType("Cash");
      searchRef.current?.focus();
    } catch (err) { toast.error(`Failed to save sale: ${err.message}`); }
  }

  function handlePrint() {
    if (!billNumber) return toast.warn("Save the sale first!");
    if (!invoiceRef.current) return toast.error("Invoice not ready!");
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`<html><head><title>Invoice</title></head><body>${invoiceRef.current.innerHTML}</body></html>`);
    printWindow.document.close(); printWindow.focus(); printWindow.print(); printWindow.close();
    searchRef.current?.focus();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100">
      <ToastContainer autoClose={2000} toastClassName="rounded-xl shadow-lg text-sm font-medium" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">

       {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <ShoppingBagIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-tight">
                {settings.shop_name || "FOOTWEARS"}
              </h1>
              <p className="text-xs text-gray-400">Point of Sale</p>
            </div>
          </div>
          {cart.length > 0 && (
            <div className="flex items-center gap-2 bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md shadow-blue-200">
              <ShoppingBagIcon className="w-3.5 h-3.5" />
              {cart.length} item{cart.length !== 1 ? "s" : ""}
            </div>
          )}
        </div> 


    {/* ── Search ── */}
        <div className="relative">
          <div className={`flex items-center gap-3 bg-white border rounded-2xl px-4 py-3.5 shadow-sm transition-all duration-200
            ${searchFocused ? "border-blue-400 ring-2 ring-blue-100 shadow-md" : "border-gray-200 hover:border-gray-300"}`}>
            <MagnifyingGlassIcon 
            className={`w-5 h-5 flex-shrink-0 transition-colors ${searchFocused ? "text-blue-500" : "text-gray-400"}`} 
            />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search by Article No., Name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="flex-1 text-sm text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none"
            />
            {search && (
              <button
               onClick={() =>
                 { setSearch("");
                   setProducts([]);
                    searchRef.current?.focus();
                     }}
                className="text-gray-400 hover:text-gray-600 transition-colors">
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div> 
          

        {/* Dropdown */}
        {products.length > 0 && (
          <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-50 bg-gray-50/80">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{products.length} result{products.length !== 1 ? "s" : ""}</p>
            </div>
            <ul className="max-h-64 overflow-auto divide-y divide-gray-50">
              {products.map(p => {
                const inCart = cart.find(
                  i => i.id === p.id || String(i.article) === String(p.article)
                );
                return (
                  <li key={p.id}
                    onClick={() => addToCart(p)}
                    className="flex items-center justify-between px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors group">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md font-semibold">{p.article}</span>
                        <span className="text-sm font-medium text-gray-800 truncate">{p.name}</span>
                        {/* Show current cart qty as a hint */}
                        {inCart && (
                          <span className="text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
                            {inCart.qty} in cart
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        {p.color && <span>Color: {p.color}</span>}
                        {p.size && <span>Size: {p.size}</span>}
                        <span className={`font-medium ${p.quantity > 5 ? "text-emerald-600" : p.quantity > 0 ? "text-amber-500" : "text-red-500"}`}>
                          Stock: {p.quantity}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      <span className="text-sm font-bold text-gray-900">₹{p.mrp?.toFixed(2)}</span>
                      <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-sm font-bold">{inCart ? "+" : "+"}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* ── Cart ── */}
      {cart.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShoppingBagIcon className="w-4 h-4" /> Cart
            </h2>
            <span className="text-blue-100 text-xs">{cart.length} item{cart.length !== 1 ? "s" : ""}</span>
          </div>

          <div className="divide-y divide-gray-50">
            {cart.map(item => (
              <div key={item.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors group">
                {/* Item info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">{item.article}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate">{item.name}
                    {item.size && <span className="text-gray-400 font-normal"> · Size {item.size}</span>}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">₹{item.mrp?.toFixed(2)} each</p>
                </div>

                {/* Qty controls */}
                <div className="flex items-center gap-1.5 bg-gray-100 rounded-xl px-1.5 py-1">
                  <button onClick={() => updateQty(item.id, -1)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-600 hover:bg-white hover:shadow-sm transition-all text-base font-semibold">
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-semibold text-gray-800">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-600 hover:bg-white hover:shadow-sm transition-all text-base font-semibold">
                    +
                  </button>
                </div>

                {/* Line total */}
                <div className="text-right w-20">
                  <p className="text-sm font-bold text-gray-900">₹{(item.qty * (item.mrp || 0)).toFixed(2)}</p>
                </div>

                {/* Remove */}
                <button onClick={() => removeFromCart(item.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-12 flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
            <ShoppingBagIcon className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-sm text-gray-400 font-medium">Cart is empty</p>
          <p className="text-xs text-gray-300">Search and add products above</p>
        </div>
      )}

      {/* ── Billing Panel ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/80">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <TagIcon className="w-4 h-4 text-blue-500" /> Billing Summary
          </h2>
        </div>

        <div className="p-5 space-y-4">
          {/* Subtotal */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-semibold text-gray-800">₹ {subtotal.toFixed(2)}</span>
          </div>

          {/* Discount */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Discount</span>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
              <input
                type="number"
                value={discount}
                onChange={e => setDiscount(Number(e.target.value))}
                className="w-28 border border-gray-200 rounded-xl pl-7 pr-3 py-2 text-right text-sm font-medium text-gray-800
                    focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="text-base font-bold text-gray-900">Total</span>
            <span className="text-xl font-bold text-blue-600">₹ {total.toFixed(2)}</span>
          </div>

          {/* Payment type */}
          <div className="flex gap-2">
            {PAYMENT_OPTIONS.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => setPaymentType(label)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-150
                    ${paymentType === label
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50"}`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Amount received */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
            <input
              type="number"
              placeholder="Amount Received"
              value={amountReceived}
              onChange={e => setAmountReceived(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-sm font-medium text-gray-800 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
            />
          </div>

          {/* Change */}
          {amountReceived && (
            <div className={`flex justify-between items-center px-4 py-3 rounded-xl text-sm font-semibold
                ${change >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
              <span>Change</span>
              <span className="text-base">₹ {change.toFixed(2)}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={!canSave}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                  ${canSave
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200 hover:shadow-lg hover:-translate-y-0.5"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
            >
              <CheckCircleIcon className="w-5 h-5" />
              Save Sale
            </button>
            <button
              onClick={handlePrint}
              disabled={!billNumber}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                  ${billNumber
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-200 hover:shadow-lg hover:-translate-y-0.5"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
            >
              <PrinterIcon className="w-5 h-5" />
              Print Invoice
            </button>
          </div>
        </div>
      </div>

      {/* ── Hidden Invoice ── */}
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
    // </div >
  );
}