import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

import ArtworkCard from "../components/ArtworkCard";
import { artifyApi } from "../utils/artifyApi";
import "./Home.css";

const Home = () => {
  const [artworks, setArtworks] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadHomeData = async () => {
      const [artworksResponse, categoriesResponse] = await Promise.all([
        artifyApi.getArtworks(),
        artifyApi.getCategories(),
      ]);

      setArtworks((artworksResponse.data.data || []).slice(0, 6));
      setCategories(categoriesResponse.data.data || []);
    };

    loadHomeData().catch(() => {
      setArtworks([]);
      setCategories([]);
    });
  }, []);

  return (
    <div className="home-page">
      <section className="hero-section home-hero">
        <div className="site-shell hero-grid">
          <div className="hero-copy reveal">
            <span className="eyebrow">Virtual Art Gallery</span>
            <h1>
              Step into a world where
              <span> art lives beyond the walls.</span>
            </h1>
            <p>
              Artify blends the atmosphere of a luxury gallery with the utility of a
              modern marketplace, giving artists and collectors a quieter, premium space
              to discover exceptional work.
            </p>
            <div className="hero-actions">
              <Link to="/gallery" className="btn btn-primary">
                Explore Gallery
                <ArrowRightIcon className="btn-icon" />
              </Link>
            </div>
          </div>

          <div className="hero-panel reveal">
            <div className="hero-panel-copy">
              <span className="eyebrow">Curated Categories</span>
              <h2>Where the visual language stays minimal and the artwork stays dominant.</h2>
            </div>
            <div className="chip-row">
              {categories.map((category) => (
                <Link
                  key={category._id}
                  to={`/gallery?categoryId=${category._id}`}
                  className="chip"
                >
                  {category.name}
                </Link>
              ))}
            </div>
            <div className="hero-panel-note">
              <p>
                Deep charcoal surfaces, restrained red accents, and soft atmospheric glow
                create a museum-like frame around every piece.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-block site-shell reveal">
        <div className="feature-band glass-card">
          <div>
            <span className="eyebrow">Experience</span>
            <h2>Built for focused discovery, not visual noise.</h2>
          </div>
          <div className="feature-grid">
            <article>
              <h3>Masonry presentation</h3>
              <p>Artwork flows in a fluid editorial layout that feels closer to a real exhibition wall.</p>
            </article>
            <article>
              <h3>Subtle motion</h3>
              <p>Fade-ins, glow responses, and depth shifts add polish without distracting from the pieces.</p>
            </article>
            <article>
              <h3>Collector-first clarity</h3>
              <p>Search, category filtering, and concise metadata make browsing feel calm and premium.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section-block site-shell reveal">
        <div className="section-head">
          <div>
            <span className="eyebrow">Latest Uploads</span>
            <h2>Fresh acquisitions from active artists</h2>
            <p>
              A rotating selection of newly uploaded work, presented in a quiet dark frame
              with enough detail to invite a closer look.
            </p>
          </div>
          <Link to="/gallery" className="btn btn-outline">
            View All
          </Link>
        </div>

        <div className="card-grid">
          {artworks.map((artwork) => (
            <ArtworkCard key={artwork._id} artwork={artwork} />
          ))}
        </div>
      </section>

      <section className="section-block site-shell reveal">
        <div className="collector-note glass-card">
          <span className="eyebrow">Collector Note</span>
          <h2>Artify is designed like a contemporary viewing room.</h2>
          <p>
            The interface uses layered black surfaces, controlled red highlights, and soft
            edge lighting to create depth while preserving artwork visibility across desktop
            and mobile.
          </p>
          <Link to="/about" className="text-link">
            Learn more about Artify
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
