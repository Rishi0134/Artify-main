import { useEffect, useState } from "react";

import { artifyApi } from "../utils/artifyApi";

const printBill = (order) => {
  const billWindow = window.open("", "_blank", "width=900,height=700");
  if (!billWindow) {
    return;
  }

  const bill = order.billingDetails || {};

  billWindow.document.write(`
    <html>
      <head>
        <title>Invoice ${order.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; color: #222; }
          h1, h2, p { margin: 0 0 12px; }
          .box { border: 1px solid #ddd; border-radius: 12px; padding: 20px; margin-top: 20px; }
          .row { display: flex; justify-content: space-between; margin: 10px 0; }
        </style>
      </head>
      <body>
        <h1>Artify Invoice</h1>
        <p>Invoice No: ${order.invoiceNumber || "-"}</p>
        <p>Date: ${new Date(order.createdAt).toLocaleString()}</p>
        <div class="box">
          <h2>Customer</h2>
          <p>${bill.customerName || "-"}</p>
          <p>${bill.customerEmail || "-"}</p>
          <p>${bill.customerPhone || "-"}</p>
        </div>
        <div class="box">
          <h2>Artwork Details</h2>
          <div class="row"><span>Artwork</span><strong>${bill.artworkTitle || order.artworkId?.title || "-"}</strong></div>
          <div class="row"><span>Artist</span><strong>${bill.artistName || order.artistId?.name || "-"}</strong></div>
          <div class="row"><span>Category</span><strong>${bill.categoryName || "-"}</strong></div>
          <div class="row"><span>Payment Method</span><strong>${order.paymentMethod || "-"}</strong></div>
          <div class="row"><span>Payment Status</span><strong>${order.paymentStatus || "-"}</strong></div>
          <div class="row"><span>Subtotal</span><strong>Rs. ${bill.subtotal || order.price || 0}</strong></div>
          <div class="row"><span>Tax</span><strong>Rs. ${bill.tax || 0}</strong></div>
          <div class="row"><span>Total</span><strong>Rs. ${bill.total || order.price || 0}</strong></div>
        </div>
      </body>
    </html>
  `);
  billWindow.document.close();
  billWindow.focus();
  billWindow.print();
};

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    artifyApi
      .getUserOrders()
      .then((response) => setOrders(response.data.data || []))
      .catch(() => setOrders([]));
  }, []);

  return (
    <div className="page-stack">
      <div className="section-head">
        <div>
          <span className="eyebrow">Orders</span>
          <h1>Your order history</h1>
        </div>
      </div>

      <div className="stack-list">
        {orders.map((order) => (
          <div key={order._id} className="panel">
            <div className="inline-spread">
              <h3>{order.artworkId?.title}</h3>
              <span>Rs. {order.price}</span>
            </div>
            <p>Status: {order.status}</p>
            <p>Payment: {order.paymentStatus}</p>
            <p>Payment Method: {order.paymentMethod || "-"}</p>
            <p>Invoice: {order.invoiceNumber || "-"}</p>
            <p>Artist: {order.artistId?.name}</p>
            <button type="button" className="btn btn-outline" onClick={() => printBill(order)}>
              Print Bill
            </button>
          </div>
        ))}
        {!orders.length ? <p>No orders found.</p> : null}
      </div>
    </div>
  );
};

export default Orders;
