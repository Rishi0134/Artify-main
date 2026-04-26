import { useEffect, useState } from "react";

import { artifyApi } from "../utils/artifyApi";

const UploadArtwork = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    categoryId: "",
    image: null,
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    artifyApi
      .getCategories()
      .then((response) => setCategories(response.data.data || []))
      .catch(() => setCategories([]));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));

    await artifyApi.createArtwork(payload);
    setForm({
      title: "",
      description: "",
      price: "",
      categoryId: "",
      image: null,
    });
    setMessage("Artwork uploaded successfully");
  };

  return (
    <form className="page-stack panel" onSubmit={handleSubmit}>
      <div className="section-head">
        <div>
          <span className="eyebrow">Upload</span>
          <h1>Add a new artwork</h1>
        </div>
      </div>

      <input
        type="text"
        placeholder="Title"
        value={form.title}
        onChange={(event) => setForm({ ...form, title: event.target.value })}
        required
      />
      <textarea
        rows="4"
        placeholder="Description"
        value={form.description}
        onChange={(event) => setForm({ ...form, description: event.target.value })}
      />
      <input
        type="number"
        placeholder="Price"
        value={form.price}
        onChange={(event) => setForm({ ...form, price: event.target.value })}
        required
      />
      <select
        value={form.categoryId}
        onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
        required
      >
        <option value="">Select category</option>
        {categories.map((category) => (
          <option key={category._id} value={category._id}>
            {category.name}
          </option>
        ))}
      </select>
      <input
        type="file"
        accept="image/*"
        onChange={(event) => setForm({ ...form, image: event.target.files?.[0] || null })}
        required
      />
      {message ? <p className="success-text">{message}</p> : null}
      <button type="submit" className="btn btn-primary">
        Upload Artwork
      </button>
    </form>
  );
};

export default UploadArtwork;
