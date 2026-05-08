// ═══════════════════════════════════════════════
//  AuthContext.js — Global auth state
// ═══════════════════════════════════════════════

const { createContext, useContext, useState, useEffect } = React;

const AuthContext = createContext(null);
window.AuthContext = AuthContext;

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);     // { user_id, name, role, program, year_level }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("sadgen_user");
    const token = sessionStorage.getItem("sadgen_token");
    if (stored && token) {
      window.api.setToken(token);
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await window.api.login(email, password);
    window.api.setToken(data.access_token);
    sessionStorage.setItem("sadgen_token", data.access_token);
    const profile = {
      user_id: data.user_id,
      name: data.name,
      role: data.role,
      program: data.program,
      year_level: data.year_level,
    };
    sessionStorage.setItem("sadgen_user", JSON.stringify(profile));
    setUser(profile);
    return profile;
  };

  const logout = () => {
    window.api.clearToken();
    sessionStorage.removeItem("sadgen_token");
    sessionStorage.removeItem("sadgen_user");
    sessionStorage.removeItem("sadgen_admin_tab");
    sessionStorage.removeItem("sadgen_prof_view");
    setUser(null);

    window.logout = logout;
  };

  useEffect(() => {
    window.logout = logout;
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

window.AuthProvider = AuthProvider;
window.useAuth = () => useContext(AuthContext);
