import { Link } from "react-router-dom";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";

import { getImageUrl } from "../utils/api";
import "./ArtworkCard.css";

const ArtworkCard = ({ artwork }) => (
  <article className="art-card">
    <div className="art-card-media">
      <img
        src={getImageUrl(artwork.imageUrl || artwork.image)}
        alt={artwork.title}
        className="art-card-image"
      />
      <div className="art-card-overlay">
        <span className={`badge ${artwork.status === "sold" ? "badge-muted" : ""}`}>
          {artwork.status === "pending" ? "available" : artwork.status}
        </span>
        <Link to={`/artworks/${artwork._id}`} className="art-card-icon" aria-label={`View ${artwork.title}`}>
          <ArrowUpRightIcon />
        </Link>
      </div>
    </div>
    <div className="art-card-body">
      <div className="art-card-head">
        <div>
          <p className="art-card-label">{artwork.categoryId?.name || "Curated piece"}</p>
          <h3>{artwork.title}</h3>
        </div>
        <strong>Rs. {artwork.price}</strong>
      </div>
      <p>{artwork.description || "A curated work presented without a public description."}</p>
      <div className="art-card-footer">
        <p className="meta-text">
          By {artwork.artistId?.name || artwork.artist?.name || "Unknown artist"}
        </p>
        <Link to={`/artworks/${artwork._id}`} className="art-card-link">
          View details
        </Link>
      </div>
    </div>
  </article>
);

export default ArtworkCard;
