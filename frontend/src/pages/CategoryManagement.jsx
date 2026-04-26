import { useEffect, useState } from "react";

import { artifyApi } from "../utils/artifyApi";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    artifyApi
      .getCategories()
      .then((response) => setCategories(response.data.data || []))
      .catch(() => setCategories([]));
  }, []);

  return (
    <div className="page-stack">
      <div className="panel">
        <h1>Category Management</h1>
        <p>
          These categories are fixed by the system. Artists can upload artworks only under this approved list,
          and users can filter gallery results only using these categories.
        </p>
      </div>

      <div className="stack-list">
        {categories.map((category) => (
          <div key={category._id} className="panel">
            <strong>{category.name}</strong>
            <p>{category.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryManagement;
