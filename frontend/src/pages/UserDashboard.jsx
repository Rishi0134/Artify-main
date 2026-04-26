import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { artifyApi } from "../utils/artifyApi";

const UserDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    Promise.all([artifyApi.getProfile(), artifyApi.getUserOrders()])
      .then(([profileResponse, ordersResponse]) => {
        setProfile(profileResponse.data.data);
        setOrders(ordersResponse.data.data || []);
      })
      .catch(() => {
        setProfile(null);
        setOrders([]);
      });
  }, []);

  return (
    <div className="page-stack">
      <div className="section-head">
        <div>
          <span className="eyebrow">Overview</span>
          <h1>Welcome {profile?.name || "Collector"}</h1>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Total Orders</span>
          <strong>{orders.length}</strong>
        </div>
        <div className="stat-card">
          <span>Completed Purchases</span>
          <strong>{orders.filter((order) => order.status === "completed").length}</strong>
        </div>
        <div className="stat-card">
          <span>Total Spend</span>
          <strong>Rs. {orders.reduce((sum, order) => sum + Number(order.price || 0), 0)}</strong>
        </div>
      </div>

      <div className="panel">
        <div className="inline-spread">
          <h2>Recent Orders</h2>
          <Link to="/gallery" className="btn btn-primary">
            Browse Gallery
          </Link>
        </div>
        <div className="simple-table">
          {orders.slice(0, 5).map((order) => (
            <div key={order._id} className="table-row">
              <span>{order.artworkId?.title}</span>
              <span>{order.status}</span>
              <span>{order.paymentStatus}</span>
              <span>Rs. {order.price}</span>
            </div>
          ))}
          {!orders.length ? <p>No orders yet.</p> : null}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
