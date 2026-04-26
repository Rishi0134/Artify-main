import { useEffect, useState } from "react";

import { getImageUrl } from "../utils/api";
import { updateStoredUser } from "../utils/auth";
import { artifyApi } from "../utils/artifyApi";

const Profile = () => {
  const [form, setForm] = useState({ name: "", phone: "", bio: "", profileImage: null });
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    artifyApi.getProfile().then((response) => {
      const profile = response.data.data;
      setForm((current) => ({
        ...current,
        name: profile.name || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
      }));
      setPreview(getImageUrl(profile.profileImage));
    });
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = new FormData();
    payload.append("name", form.name);
    payload.append("phone", form.phone);
    payload.append("bio", form.bio);
    if (form.profileImage) {
      payload.append("profileImage", form.profileImage);
    }

    const response = await artifyApi.updateProfile(payload);
    updateStoredUser(response.data.data);
    setPreview(getImageUrl(response.data.data.profileImage));
    setMessage("Profile updated successfully");
  };

  return (
    <form className="page-stack panel" onSubmit={handleSubmit}>
      <div className="section-head">
        <div>
          <span className="eyebrow">Profile</span>
          <h1>Manage your account</h1>
        </div>
      </div>

      {preview ? <img src={preview} alt="Profile" className="profile-preview" /> : null}
      <input
        type="text"
        placeholder="Name"
        value={form.name}
        onChange={(event) => setForm({ ...form, name: event.target.value })}
      />
      <input
        type="text"
        placeholder="Phone"
        value={form.phone}
        onChange={(event) => setForm({ ...form, phone: event.target.value })}
      />
      <textarea
        rows="4"
        placeholder="Bio"
        value={form.bio}
        onChange={(event) => setForm({ ...form, bio: event.target.value })}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(event) => setForm({ ...form, profileImage: event.target.files?.[0] || null })}
      />
      {message ? <p className="success-text">{message}</p> : null}
      <button type="submit" className="btn btn-primary">
        Save Profile
      </button>
    </form>
  );
};

export default Profile;
