import { useEffect, useState } from "react";

import { artifyApi } from "../utils/artifyApi";

const Sales = () => {
  const [orders, setOrders] = useState([]);

  const loadOrders = () => {
    artifyApi
      .getOrders()
      .then((response) => setOrders(response.data.data || []))
      .catch(() => setOrders([]));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleComplete = async (orderId) => {
    await artifyApi.updateOrder(orderId, {
      status: "completed",
      paymentStatus: "paid",
    });
    loadOrders();
  };

  return (
    <div className="page-stack">
      <div className="section-head">
        <div>
          <span className="eyebrow">Sales</span>
          <h1>Orders for your artworks</h1>
        </div>
      </div>

      <div className="stack-list">
        {orders.map((order) => (
          <div key={order._id} className="panel">
            <div className="inline-spread">
              <h3>{order.artworkId?.title}</h3>
              <span>Rs. {order.price}</span>
            </div>
            <p>Buyer: {order.userId?.name}</p>
            <p>Status: {order.status}</p>
            <p>Payment: {order.paymentStatus}</p>
            {order.status !== "completed" ? (
              <button type="button" className="btn btn-primary" onClick={() => handleComplete(order._id)}>
                Mark Completed
              </button>
            ) : null}
          </div>
        ))}
        {!orders.length ? <p>No sales found.</p> : null}
      </div>
    </div>
  );
};

export default Sales;
