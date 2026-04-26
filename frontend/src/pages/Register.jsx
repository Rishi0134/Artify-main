import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";

import { getDashboardPath, setStoredAuth } from "../utils/auth";
import { artifyApi } from "../utils/artifyApi";
import "./Auth.css";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "user",
    bio: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await artifyApi.register(form);
      setStoredAuth(response.data.data);
      navigate(getDashboardPath(response.data.data.user.role), { replace: true });
    } catch (submitError) {
      setError(submitError.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <form className="auth-panel auth-fade-in" onSubmit={handleSubmit}>
        <span className="auth-eyebrow">Create Account</span>
        <h1 className="auth-title">Join Artify</h1>
        <p className="auth-subtitle">Build your collector or artist profile inside the same curated gallery experience.</p>
        <div className="auth-form">
          <input
            type="text"
            className="auth-input"
            placeholder="Full name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
          <input
            type="email"
            className="auth-input"
            placeholder="Email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
          <div className="auth-password-field">
            <input
              type={showPassword ? "text" : "password"}
              className="auth-input auth-password-input"
              placeholder="Password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          <input
            type="text"
            className="auth-input"
            placeholder="Phone"
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
          />
          <select
            className="auth-select"
            value={form.role}
            onChange={(event) => setForm({ ...form, role: event.target.value })}
          >
            <option value="user">User</option>
            <option value="artist">Artist</option>
          </select>
          <textarea
            rows="4"
            className="auth-textarea"
            placeholder="Short bio"
            value={form.bio}
            onChange={(event) => setForm({ ...form, bio: event.target.value })}
          />
          {error ? <p className="auth-error">{error}</p> : null}
          <button
            type="submit"
            className="btn auth-submit"
            disabled={loading}
          >
            {loading ? "Creating..." : "Register"}
          </button>
        </div>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </section>
  );
};

export default Register;
