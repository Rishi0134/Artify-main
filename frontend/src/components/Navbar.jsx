import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { clearStoredAuth, getDashboardPath, getStoredUser } from "../utils/auth";
import { getStoredTheme, setStoredTheme } from "../utils/theme";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [theme, setTheme] = useState(getStoredTheme());

  const handleLogout = () => {
    clearStoredAuth();
    navigate("/", { replace: true });
  };

  const handleThemeToggle = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    setStoredTheme(nextTheme);
  };

  return (
    <header className="site-header">
      <div className="site-shell nav-row">
        <Link to="/" className="brand">
          <span className="brand-mark" />
          Artify
        </Link>

        <nav className="main-nav">
          <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
            Home
          </NavLink>
          <NavLink to="/gallery" className={({ isActive }) => (isActive ? "active" : "")}>
            Gallery
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")}>
            About
          </NavLink>
          {user ? (
            <NavLink
              to={getDashboardPath(user.role)}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Dashboard
            </NavLink>
          ) : null}
        </nav>

        <div className="nav-actions">
          <button type="button" className="theme-switch" onClick={handleThemeToggle}>
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
          {user ? (
            <>
              <span className="nav-user">{user.name}</span>
              <button type="button" className="btn btn-outline" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
