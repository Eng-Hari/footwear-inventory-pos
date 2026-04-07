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
  const shopName = settings?.shop_name || "ABC Footwears";
  const shopAddress = settings?.address || "No. 12, Main Road, Your City";
  const shopPhone = settings?.contact_number || "+91 9876543210";
  const gstin = settings?.gst_number || "33ABCDE1234F1Z5";

  const gstPercent = Number(settings?.gst_percent || 5);

  // ✅ GST INCLUDED LOGIC
  const baseAmount = subtotal / (1 + gstPercent / 100);
  const gstAmount = subtotal - baseAmount;

  const today = new Date();

  return (
    <div
      ref={invoiceRef}
      className="sr-only print:block"
      style={{
        fontFamily: "Arial, sans-serif",
        background: "#f5f5f5",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "auto",
          background: "#ffffff",
          padding: "30px",
          border: "1px solid #ddd",
        }}
      >
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
          <div style={{ fontSize: "28px", fontWeight: "bold" }}>&</div>
          <div style={{ fontSize: "22px", letterSpacing: "2px" }}>INVOICE</div>
        </div>

        {/* BILLING */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <p style={{ fontSize: "12px", fontWeight: "bold" }}>BILLED TO:</p>
            <p>{shopName}</p>
            <p>{shopPhone}</p>
            <p>{shopAddress}</p>
            <p>GSTIN: {gstin}</p>
          </div>

          <div style={{ textAlign: "right" }}>
            <p>Invoice No. {billNumber || "12345"}</p>
            <p>{today.toLocaleDateString()}</p>
          </div>
        </div>

        {/* TABLE */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #000" }}>
              <th style={{ textAlign: "left", padding: "8px 0" }}>Item</th>
              <th style={{ textAlign: "center" }}>Quantity</th>
              <th style={{ textAlign: "right" }}>Unit Price</th>
              <th style={{ textAlign: "right" }}>Total</th>
            </tr>
          </thead>

          <tbody>
            {cart.length > 0 ? (
              cart.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "10px 0" }}>
                    {item.name} <br />
                    <small style={{ color: "#666" }}>{item.article}</small>
                  </td>
                  <td style={{ textAlign: "center" }}>{item.qty}</td>
                  <td style={{ textAlign: "right" }}>₹{item.mrp.toFixed(2)}</td>
                  <td style={{ textAlign: "right" }}>
                    ₹{(item.qty * item.mrp).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "10px" }}>
                  No items
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* SUMMARY */}
        <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: "250px" }}>
            <Row label="Subtotal (Incl. GST)" value={subtotal} />

            {/* ✅ FIXED GST */}
            <Row label={`GST (${gstPercent}%)`} value={gstAmount} />

            {discount > 0 && <Row label="Discount" value={-discount} />}

            <hr style={{ borderTop: "1px solid #000", margin: "10px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "16px" }}>
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <p style={{ marginTop: "30px" }}>Thank you!</p>

        {/* FOOTER */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "40px", fontSize: "12px" }}>
          <div>
            <p style={{ fontWeight: "bold" }}>PAYMENT INFORMATION</p>
            <p>Method: {paymentType}</p>
            <p>Received: ₹{amountReceived.toFixed(2)}</p>
            <p>Change: ₹{change.toFixed(2)}</p>
          </div>

          <div style={{ textAlign: "right" }}>
            <p style={{ fontWeight: "bold" }}>{shopName}</p>
            <p>{shopAddress}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", margin: "5px 0" }}>
      <span>{label}</span>
      <span>₹{Number(value).toFixed(2)}</span>
    </div>
  );
}