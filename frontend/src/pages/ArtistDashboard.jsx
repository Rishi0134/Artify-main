import { useEffect, useState } from "react";

import { getStoredUser } from "../utils/auth";
import { artifyApi } from "../utils/artifyApi";

const ArtistDashboard = () => {
  const user = getStoredUser();
  const [artworks, setArtworks] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    Promise.all([artifyApi.getArtworks({ artistId: user?._id }), artifyApi.getOrders()])
      .then(([artworksResponse, ordersResponse]) => {
        setArtworks(artworksResponse.data.data || []);
        setOrders(ordersResponse.data.data || []);
      })
      .catch(() => {
        setArtworks([]);
        setOrders([]);
      });
  }, [user?._id]);

  return (
    <div className="page-stack">
      <div className="section-head">
        <div>
          <span className="eyebrow">Overview</span>
          <h1>Artist studio metrics</h1>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Uploaded Artworks</span>
          <strong>{artworks.length}</strong>
        </div>
        <div className="stat-card">
          <span>Sold Pieces</span>
          <strong>{artworks.filter((artwork) => artwork.status === "sold").length}</strong>
        </div>
        <div className="stat-card">
          <span>Revenue</span>
          <strong>Rs. {orders.reduce((sum, order) => sum + Number(order.price || 0), 0)}</strong>
        </div>
      </div>
    </div>
  );
};

export default ArtistDashboard;
