import { useEffect, useState } from "react";

import { artifyApi } from "../utils/artifyApi";

const emptyStats = {
  totalUsers: 0,
  totalArtists: 0,
  totalArtworks: 0,
  totalOrders: 0,
  totalRevenue: 0,
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(emptyStats);

  useEffect(() => {
    artifyApi
      .getAdminStats()
      .then((response) => setStats(response.data.data || emptyStats))
      .catch(() => setStats(emptyStats));
  }, []);

  return (
    <div className="page-stack">
      <div className="section-head">
        <div>
          <span className="eyebrow">Analytics</span>
          <h1>Platform overview</h1>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Total Users</span>
          <strong>{stats.totalUsers}</strong>
        </div>
        <div className="stat-card">
          <span>Total Artists</span>
          <strong>{stats.totalArtists}</strong>
        </div>
        <div className="stat-card">
          <span>Total Artworks</span>
          <strong>{stats.totalArtworks}</strong>
        </div>
        <div className="stat-card">
          <span>Total Orders</span>
          <strong>{stats.totalOrders}</strong>
        </div>
        <div className="stat-card">
          <span>Total Revenue</span>
          <strong>Rs. {stats.totalRevenue}</strong>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
