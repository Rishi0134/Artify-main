import { useEffect, useState } from "react";

import { artifyApi } from "../utils/artifyApi";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);

  const loadOrders = () => {
    artifyApi
      .getAdminOrders()
      .then((response) => setOrders(response.data.data || []))
      .catch(() => setOrders([]));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleComplete = async (orderId) => {
    await artifyApi.updateAdminOrder(orderId, {
      status: "completed",
      paymentStatus: "paid",
    });
    loadOrders();
  };

  return (
    <div className="page-stack">
      <h1>Order Management</h1>
      <div className="stack-list">
        {orders.map((order) => (
          <div key={order._id} className="panel">
            <div className="inline-spread">
              <strong>{order.artworkId?.title}</strong>
              <span>Rs. {order.price}</span>
            </div>
            <p>User: {order.userId?.name}</p>
            <p>Artist: {order.artistId?.name}</p>
            <p>Status: {order.status}</p>
            <button type="button" className="btn btn-primary" onClick={() => handleComplete(order._id)}>
              Mark Completed
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderManagement;
