// ═══════════════════════════════════════════════
//  Navbar.js
// ═══════════════════════════════════════════════

function Navbar() {
  const { user, logout } = window.useAuth();
  if (!user) return null;

  const roleColors = {
    Admin:     "badge-violet",
    Student:   "badge-blue",
    Professor: "badge-amber",
  };

  const [activeTab, setActiveTab] = React.useState(
    sessionStorage.getItem("sadgen_admin_tab") || "welcome"
  );
  const initials = user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  React.useEffect(() => {
    const handleTabChange = (e) => setActiveTab(e.detail);
    window.addEventListener("changeAdminTab", handleTabChange);
    return () => window.removeEventListener("changeAdminTab", handleTabChange);
  }, []);

  const navigateAdmin = (tab) => {
    window.dispatchEvent(new CustomEvent("changeAdminTab", { detail: tab }));
    setActiveTab(tab);
  };

  return (
    <nav className="navbar">

      {/* ── Brand ── */}
      <span
        className="navbar-brand"
        style={{ cursor: "pointer", flexShrink: 0 }}
        onClick={() => navigateAdmin("welcome")}
      >
        🎓 Sadgen
      </span>

      {/* ── Admin Tabs (middle on desktop, second row on mobile) ── */}
      {user.role === "Admin" && (
        <div className="navbar-tabs">
          {[
            { key: "users",     label: "👤 Users" },
            { key: "courses",   label: "📘 Courses" },
            { key: "blueprint", label: "🗺 Blueprint" },
            { key: "sections",  label: "🏫 Sections" },
            { key: "trash",     label: "♻ Recycle" },
          ].map(t => (
            <button
              key={t.key}
              className={`tab-btn ${activeTab === t.key ? "active" : ""}`}
              style={{ fontSize: "0.78rem", padding: "0.4rem 0.75rem", whiteSpace: "nowrap", flexShrink: 0 }}
              onClick={() => navigateAdmin(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* ── User Info ── */}
      <div className="navbar-user">
        <span className={`badge ${roleColors[user.role] || "badge-blue"}`}>{user.role}</span>
        <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem", display: "flex", flexDirection: "column", alignItems: "flex-end", lineHeight: 1.3 }}>
          <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{user.name}</span>
          {user.program && (
            <span style={{ fontSize: "0.75rem" }}>{user.program} · Year {user.year_level}</span>
          )}
        </span>
        <div className="navbar-avatar">{initials}</div>
        <button className="btn btn-ghost btn-sm" onClick={logout}>Logout</button>
      </div>

    </nav>
  );
}

window.Navbar = Navbar;
