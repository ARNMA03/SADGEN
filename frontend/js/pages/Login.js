// ═══════════════════════════════════════════════
//  Login.js
// ═══════════════════════════════════════════════

const { useState: useSt_Login } = React;

function Login() {
  const { login } = window.useAuth();
  const [email, setEmail] = useSt_Login("");
  const [password, setPassword] = useSt_Login("");
  const [showPassword, setShowPassword] = useSt_Login(false);
  const [error, setError] = useSt_Login("");
  const [loading, setLoading] = useSt_Login(false);

  const DEMOS = [
    { label: "Admin", email: "admin@sadgen.edu.ph", password: "admin123" },
    { label: "Prof. Reyes", email: "reyes@sadgen.edu.ph", password: "prof123" },
    { label: "Juan (BSCS-2)", email: "juan@sadgen.edu.ph", password: "student123" },
    { label: "Maria (BSCS-2)", email: "maria@sadgen.edu.ph", password: "student123" },
    { label: "Pedro (BSIT-1)", email: "pedro@sadgen.edu.ph", password: "student123" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (d) => { setEmail(d.email); setPassword(d.password); setError(""); };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">🎓 Sadgen</div>
        <p className="login-tagline">Automated Block Enrollment Portal · HCI2 Prototype</p>

        {error && (
          <div className="status-banner error" style={{ marginBottom: "1rem" }}>
            ⚠ {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit} id="login-form">
          <div className="input-group">
            <label className="input-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              className="input"
              type="email"
              placeholder="you@sadgen.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="login-password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="login-password"
                className="input"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ paddingRight: "3.5rem" }}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: "100%", marginTop: "0.5rem" }}
            disabled={loading}
          >
            {loading
              ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Signing in…</>
              : "Sign In →"
            }
          </button>
        </form>

        <div className="divider" />
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.6rem", textAlign: "center" }}>
          Quick demo login
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", justifyContent: "center" }}>
          {DEMOS.map(d => (
            <button
              key={d.email}
              className="btn btn-ghost btn-sm"
              onClick={() => fillDemo(d)}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

window.Login = Login;
