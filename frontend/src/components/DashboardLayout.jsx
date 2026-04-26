import { NavLink, Outlet } from "react-router-dom";

const DashboardLayout = ({ links, title }) => (
  <div className="dashboard-shell">
    <aside className="dashboard-sidebar">
      <h2>{title}</h2>
      <nav className="dashboard-nav">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? "active" : "")}>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>

    <main className="dashboard-main">
      <Outlet />
    </main>
  </div>
);

export default DashboardLayout;
