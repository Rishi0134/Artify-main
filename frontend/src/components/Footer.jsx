import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => (
  <footer className="site-footer">
    <div className="site-shell footer-row">
      <div className="footer-copy">
        <span className="eyebrow">Artify</span>
        <h3>Luxury digital curation for contemporary collectors and artists.</h3>
        <p>
          Discover original work, explore curated categories, and experience a gallery
          interface designed to keep the art at the center.
        </p>
      </div>
      <div className="footer-links">
        <Link to="/gallery">Gallery</Link>
        <Link to="/about">About</Link>
        <Link to="/register">Create Account</Link>
      </div>
    </div>
    <div className="site-shell footer-meta">
      <p>Artify Virtual Art Gallery</p>
      <p>Built with React, Express, MongoDB, JWT, and Multer.</p>
    </div>
  </footer>
);

export default Footer;
