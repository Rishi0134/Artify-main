import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import ArtworkCard from "../components/ArtworkCard";
import { artifyApi } from "../utils/artifyApi";
import "./Gallery.css";

const Gallery = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [artworks, setArtworks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState(searchParams.get("categoryId") || "");

  useEffect(() => {
    setCategoryId(searchParams.get("categoryId") || "");
  }, [searchParams]);

  useEffect(() => {
    artifyApi
      .getCategories()
      .then((response) => setCategories(response.data.data || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    artifyApi
      .getArtworks({ search, categoryId, status: "available" })
      .then((response) => setArtworks(response.data.data || []))
      .catch(() => setArtworks([]));
  }, [search, categoryId]);

  const handleCategoryChange = (event) => {
    const nextCategoryId = event.target.value;
    setCategoryId(nextCategoryId);

    if (nextCategoryId) {
      setSearchParams({ categoryId: nextCategoryId });
      return;
    }

    setSearchParams({});
  };

  return (
    <section className="section-block site-shell gallery-page">
      <div className="gallery-intro reveal">
        <div className="section-head">
          <div>
            <span className="eyebrow">Gallery</span>
            <h1>Browse available artworks</h1>
            <p>
              Search through available pieces, filter by category, and explore them in a
              masonry layout designed to keep the viewing rhythm fluid.
            </p>
          </div>
        </div>

        <div className="gallery-filter-panel glass-card">
          <div className="filters-bar">
            <input
              type="search"
              placeholder="Search by title or description"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              className="gallery-category-select"
              value={categoryId}
              onChange={handleCategoryChange}
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option className="gallery-category-option" key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="gallery-masonry reveal">
        {artworks.map((artwork) => (
          <ArtworkCard key={artwork._id} artwork={artwork} />
        ))}
      </div>

      {!artworks.length ? (
        <div className="gallery-empty glass-card">
          <p>No artworks match the current search and category filters.</p>
        </div>
      ) : null}
    </section>
  );
};

export default Gallery;
