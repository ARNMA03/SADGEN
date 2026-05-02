// ═══════════════════════════════════════════════
//  App.js — Root router (role-based)
// ═══════════════════════════════════════════════

function App() {
  const { user, loading } = window.useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight:"100vh", display:"flex", alignItems:"center",
        justifyContent:"center", flexDirection:"column", gap:"1.5rem"
      }}>
        <div style={{
          fontFamily:"var(--font-display)", fontSize:"2rem", fontWeight:800,
          background:"linear-gradient(135deg,#3b82f6,#8b5cf6)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"
        }}>⚡ Sadgen</div>
        <span className="spinner spinner-lg" />
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <>
      <Navbar />
      {user.role === "Admin"     && <AdminDashboard />}
      {user.role === "Student"   && <StudentDashboard />}
      {user.role === "Professor" && <ProfessorDashboard />}
    </>
  );
}

window.App = App;
