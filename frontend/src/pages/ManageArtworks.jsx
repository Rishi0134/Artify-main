import { useEffect, useState } from "react";

import { getStoredUser } from "../utils/auth";
import { artifyApi } from "../utils/artifyApi";

const ManageArtworks = () => {
  const user = getStoredUser();
  const [artworks, setArtworks] = useState([]);

  const loadArtworks = () => {
    artifyApi
      .getArtworks({ artistId: user?._id })
      .then((response) => setArtworks(response.data.data || []))
      .catch(() => setArtworks([]));
  };

  useEffect(() => {
    loadArtworks();
  }, [user?._id]);

  const handleDelete = async (id) => {
    await artifyApi.deleteArtwork(id);
    loadArtworks();
  };

  const handleToggleStatus = async (artwork) => {
    await artifyApi.updateArtwork(artwork._id, {
      status: artwork.status === "available" ? "sold" : "available",
    });
    loadArtworks();
  };

  return (
    <div className="page-stack">
      <div className="section-head">
        <div>
          <span className="eyebrow">Manage</span>
          <h1>Your uploaded artworks</h1>
        </div>
      </div>

      <div className="stack-list">
        {artworks.map((artwork) => (
          <div key={artwork._id} className="panel">
            <div className="inline-spread">
              <h3>{artwork.title}</h3>
              <strong>Rs. {artwork.price}</strong>
            </div>
            <p>{artwork.description}</p>
            <div className="inline-actions">
              <button type="button" className="btn btn-outline" onClick={() => handleToggleStatus(artwork)}>
                Mark as {artwork.status === "available" ? "Sold" : "Available"}
              </button>
              <button type="button" className="btn btn-danger" onClick={() => handleDelete(artwork._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
        {!artworks.length ? <p>No artworks uploaded yet.</p> : null}
      </div>
    </div>
  );
};

export default ManageArtworks;
