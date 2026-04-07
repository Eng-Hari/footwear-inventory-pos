import { 
  ShoppingBagIcon, TrashIcon, TagIcon, BanknotesIcon, 
  DevicePhoneMobileIcon, CreditCardIcon, CheckCircleIcon, PrinterIcon 
} from "@heroicons/react/24/outline";

const PAYMENT_OPTIONS = [
  { label: "Cash", icon: BanknotesIcon },
  { label: "UPI", icon: DevicePhoneMobileIcon },
  { label: "Card", icon: CreditCardIcon },
];

export default function BillingPanel({ 
  cart, updateQty, removeFromCart, subtotal, discount, setDiscount, 
  total, paymentType, setPaymentType, amountReceived, setAmountReceived, 
  change, handleSave, handlePrint, billNumber 
}) {
  const canSave = amountReceived && Number(amountReceived) >= total && cart.length > 0;

  return (
    <div className="space-y-6">
      {/* Cart List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 bg-blue-600 flex justify-between items-center text-white">
          <h2 className="text-sm font-semibold flex items-center gap-2"><ShoppingBagIcon className="w-4" /> Cart</h2>
          <span className="text-xs">{cart.length} Items</span>
        </div>
        <div className="divide-y divide-gray-50 min-h-[100px]">
          {cart.map(item => (
            <div key={item.id} className="flex items-center gap-3 px-5 py-3.5 group">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{item.name}</p>
                <p className="text-xs text-gray-400">₹{item.mrp} × {item.qty}</p>
              </div>
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1">
                <button onClick={() => updateQty(item.id, -1)} className="px-2 font-bold">-</button>
                <span className="text-sm font-semibold">{item.qty}</span>
                <button onClick={() => updateQty(item.id, 1)} className="px-2 font-bold">+</button>
              </div>
              <div className="text-right w-20 font-bold text-sm">₹{(item.qty * item.mrp).toFixed(2)}</div>
              <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500">
                <TrashIcon className="w-4" />
              </button>
            </div>
          ))}
          {cart.length === 0 && <p className="p-10 text-center text-gray-400 text-sm">Cart is empty</p>}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Subtotal</span>
          <span>₹ {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>Discount</span>
          <input 
            type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))}
            className="w-24 border rounded-lg px-2 py-1 text-right focus:ring-1 focus:ring-blue-400"
          />
        </div>
        <div className="border-t pt-3 flex justify-between items-center">
          <span className="font-bold text-gray-900">Total</span>
          <span className="text-xl font-bold text-blue-600">₹ {total.toFixed(2)}</span>
        </div>

        {/* Payment Buttons */}
        <div className="flex gap-2">
          {PAYMENT_OPTIONS.map(({ label, icon: Icon }) => (
            <button key={label} onClick={() => setPaymentType(label)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-semibold
              ${paymentType === label ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 hover:bg-blue-50"}`}>
              <Icon className="w-4" /> {label}
            </button>
          ))}
        </div>

        <input 
          type="number" placeholder="Amount Received" value={amountReceived}
          onChange={e => setAmountReceived(e.target.value)}
          className="w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-100"
        />

        {amountReceived && (
          <div className={`flex justify-between p-3 rounded-xl font-semibold ${change >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
            <span>Change</span>
            <span>₹ {change.toFixed(2)}</span>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} disabled={!canSave}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold
            ${canSave ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>
            <CheckCircleIcon className="w-5" /> Save Sale
          </button>
          <button onClick={handlePrint} disabled={!billNumber}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold
            ${billNumber ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>
            <PrinterIcon className="w-5" /> Print
          </button>
        </div>
      </div>
    </div>
  );
}