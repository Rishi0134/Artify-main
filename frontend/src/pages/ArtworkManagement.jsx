import { useEffect, useState } from "react";

import { artifyApi } from "../utils/artifyApi";

const ArtworkManagement = () => {
  const [artworks, setArtworks] = useState([]);

  const loadArtworks = () => {
    artifyApi
      .getAdminArtworks()
      .then((response) => setArtworks(response.data.data || []))
      .catch(() => setArtworks([]));
  };

  useEffect(() => {
    loadArtworks();
  }, []);

  const handleDelete = async (id) => {
    await artifyApi.deleteAdminArtwork(id);
    loadArtworks();
  };

  return (
    <div className="page-stack">
      <h1>Artwork Management</h1>
      <div className="stack-list">
        {artworks.map((artwork) => (
          <div key={artwork._id} className="panel">
            <div className="inline-spread">
              <strong>{artwork.title}</strong>
              <span>{artwork.artistId?.name}</span>
            </div>
            <p>{artwork.categoryId?.name}</p>
            <button type="button" className="btn btn-danger" onClick={() => handleDelete(artwork._id)}>
              Delete Artwork
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArtworkManagement;
