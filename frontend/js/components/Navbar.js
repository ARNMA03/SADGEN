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

  const initials = user.name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();

  return (
    <nav className="navbar">
      <span className="navbar-brand">⚡ Efficio</span>
      <div className="navbar-user">
        <span className={`badge ${roleColors[user.role] || "badge-blue"}`}>{user.role}</span>
        <span style={{color:"var(--text-secondary)", fontSize:"0.875rem", display:"flex", flexDirection:"column", alignItems:"flex-end", lineHeight:1.3}}>
          <span style={{color:"var(--text-primary)", fontWeight:600}}>{user.name}</span>
          {user.program && (
            <span style={{fontSize:"0.75rem"}}>{user.program} · Year {user.year_level}</span>
          )}
        </span>
        <div className="navbar-avatar">{initials}</div>
        <button className="btn btn-ghost btn-sm" onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}

window.Navbar = Navbar;
