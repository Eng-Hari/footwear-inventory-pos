import React from "react";

export default function Invoice({
  cart,
  subtotal,
  total,
  discount,
  paymentType,
  amountReceived,
  change,
  settings,
  billNumber,
  invoiceRef,
}) {
  const shopName = settings?.shop_name || "Suresh Footwears";
  const shopAddress = settings?.address || "No. 12, Main Road, Your City";
  const shopPhone = settings?.contact_number || "+91 9876543210";
  const gstin = settings?.gst_number || "33ABCDE1234F1Z5";
  const gstRate = settings?.gst_percent || 0.05;
  const gstAmount = subtotal * gstRate;
  const today = new Date();

  return (
    <div ref={invoiceRef} className="sr-only print:block p-4 w-[80mm] text-xs font-sans">
      {/* Header */}
      <h2 className="text-lg font-bold text-center">{shopName}</h2>
      <p className="text-center">{shopAddress}</p>
      <p className="text-center">Phone: {shopPhone}</p>
      <p className="text-center">GSTIN: {gstin}</p>
      <p className="text-center mt-1">
        Bill No: {billNumber || "N/A"} | {today.toLocaleString()}
      </p>
      <hr className="my-2 border-gray-400" />

      {/* Items Table */}
      <table className="w-full border-collapse mb-2">
        <thead>
          <tr className="border-b border-gray-400">
            <th className="text-left py-1">Item</th>
            <th className="text-center py-1">Qty</th>
            <th className="text-right py-1">MRP</th>
            <th className="text-right py-1">Total</th>
          </tr>
        </thead>
        <tbody>
          {cart.length > 0 ? (
            cart.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-300">
                <td className="py-1">{item.article} ({item.name})</td>
                <td className="text-center py-1">{item.qty}</td>
                <td className="text-right py-1">₹ {item.mrp.toFixed(2)}</td>
                <td className="text-right py-1">₹ {(item.qty * item.mrp).toFixed(2)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center py-1">No items in cart</td>
            </tr>
          )}
        </tbody>
      </table>
      <hr className="my-2 border-gray-400" /> {/* Added horizontal line below product details */}

      {/* Billing Summary */}
      <div className="mt-2 space-y-1 bg-gray-100 p-2 rounded">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>₹ {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>GST ({(gstRate * 100).toFixed(0)}%):</span>
          <span>₹ {gstAmount.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <span>Discount:</span>
            <span>- ₹ {discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold border-t border-gray-400 pt-1">
          <span>Total:</span>
          <span>₹ {total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Paid via:</span>
          <span>{paymentType}</span>
        </div>
        <div className="flex justify-between">
          <span>Amount Received:</span>
          <span>₹ {amountReceived.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Change:</span>
          <span>₹ {change.toFixed(2)}</span>
        </div>
      </div>

      {/* Footer */}
      <hr className="my-2 border-gray-400" />
      <p className="text-center">Thank you! Visit again 🙏</p>
    </div>
  );
}