import { useEffect, useState } from "react";

import { artifyApi } from "../utils/artifyApi";

const ArtistManagement = () => {
  const [artists, setArtists] = useState([]);

  const loadArtists = () => {
    artifyApi
      .getAdminArtists()
      .then((response) => setArtists(response.data.data || []))
      .catch(() => setArtists([]));
  };

  useEffect(() => {
    loadArtists();
  }, []);

  const toggleBlock = async (artist) => {
    await artifyApi.updateAdminUser(artist._id, {
      isBlocked: !artist.isBlocked,
    });
    loadArtists();
  };

  return (
    <div className="page-stack">
      <h1>Artist Management</h1>
      <div className="stack-list">
        {artists.map((artist) => (
          <div key={artist._id} className="panel">
            <div className="inline-spread">
              <strong>{artist.name}</strong>
              <span>{artist.email}</span>
            </div>
            <p>{artist.bio || "No bio added."}</p>
            <button type="button" className="btn btn-outline" onClick={() => toggleBlock(artist)}>
              {artist.isBlocked ? "Unblock" : "Block"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArtistManagement;
