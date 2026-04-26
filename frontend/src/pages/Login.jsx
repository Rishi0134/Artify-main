import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";

import { getDashboardPath, setStoredAuth } from "../utils/auth";
import { artifyApi } from "../utils/artifyApi";
import "./Auth.css";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await artifyApi.login(form);
      setStoredAuth(response.data.data);
      navigate(getDashboardPath(response.data.data.user.role), { replace: true });
    } catch (submitError) {
      setError(submitError.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <form className="auth-panel auth-fade-in" onSubmit={handleSubmit}>
        <span className="auth-eyebrow">Welcome Back</span>
        <h1 className="auth-title">Login to Artify</h1>
        <p className="auth-subtitle">Step back into the gallery and continue your curated art journey.</p>
        <div className="auth-form">
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
          {error ? <p className="auth-error">{error}</p> : null}
          <button
            type="submit"
            className="btn auth-submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </div>
        <p className="auth-switch">
          New to Artify? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </section>
  );
};

export default Login;
