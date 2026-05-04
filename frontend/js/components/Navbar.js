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

  const navigateAdmin = (tab) => {
    window.dispatchEvent(new CustomEvent('changeAdminTab', { detail: tab }));
  };

  return (
    <nav className="navbar">
      <div style={{display:"flex", alignItems:"center", gap:"1.5rem"}}>
        <span className="navbar-brand" style={{cursor:"pointer"}} onClick={() => navigateAdmin("welcome")}>⚡ Sadgen</span>
        
        {user.role === "Admin" && (
          <div style={{display:"flex", gap:"0.25rem"}}>
            {[
              { key:"users",     label:"👤 Users" },
              { key:"courses",   label:"📘 Courses" },
              { key:"blueprint", label:"🗺 Blueprint" },
              { key:"sections",  label:"🏫 Sections" },
            ].map(t => (
              <button key={t.key} className="tab-btn" style={{fontSize:"0.8rem", padding:"0.4rem 0.8rem"}} 
                onClick={() => navigateAdmin(t.key)}>{t.label}</button>
            ))}
          </div>
        )}
      </div>

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
