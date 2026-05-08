// ═══════════════════════════════════════════════
//  AdminDashboard.js — Full admin control panel
// ═══════════════════════════════════════════════

const { useState, useEffect } = React;

/* ── Welcome Tab ── */
function AdminWelcome() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.api.getAdminStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in" style={{ animation: "fadeSlideUp 0.6s ease-out" }}>
      <div className="glass-card text-center" style={{ padding: "4rem 2rem", marginBottom: "2rem" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "3rem", marginBottom: "1rem", background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Welcome, Admin</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto", lineHeight: 1.8 }}>
          You are now logged into the Sadgen Control Panel. Select a module from the navigation bar above to manage users, curriculum blueprints, courses, or section generation.
        </p>
      </div>

      <div className="stats-row">
        <div className="glass-card stat-card">
          <div className="stat-value">{loading ? "..." : `${stats?.capacity_percentage}%`}</div>
          <div className="stat-label">System Capacity</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-value">{loading ? "..." : stats?.total_blueprints}</div>
          <div className="stat-label">Active Blueprints</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-value">{loading ? "..." : stats?.total_courses}</div>
          <div className="stat-label">Course Inventory</div>
        </div>
      </div>
    </div>
  );
}

/* ── User Edit Modal ── */
function UserEditModal({ user, onClose, onSave, blueprints, showToast }) {
  const [form, setForm] = useState({ ...user, password: "" });
  const [saving, setSaving] = useState(false);
  const [unrolling, setUnrolling] = useState(false);
  const [status, setStatus] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const programs = [...new Set(blueprints.map(b => b.program))];

  const academicProfileChanged =
    form.role !== user.role ||
    form.program !== user.program ||
    form.year_level != user.year_level;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (academicProfileChanged && user.enrolled_section) {
      setStatus({ msg: `Cannot change academic profile while user is enrolled. Please unenroll them from ${user.enrolled_section} first.`, type: "error" });
      return;
    }

    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      await window.api.updateUser(user.id, payload);
      if (showToast) showToast("User updated successfully.");
      onSave();
    } catch (e) { setStatus({ msg: e.message, type: "error" }); }
    finally { setSaving(false); }
  };

  const handleUnenroll = async () => {
    setConfirmModal({
      title: "Confirm Unenrollment",
      message: `Are you sure you want to unenroll ${user.name} from ${user.enrolled_section}?`,
      onConfirm: async () => {
        setConfirmModal(null);
        setUnrolling(true);
        try {
          await window.api.unenroll(user.id);
          user.enrolled_section = null;
          setForm(prev => ({ ...prev }));
          if (showToast) showToast("User unenrolled successfully.");
          setStatus({ msg: "User unenrolled successfully.", type: "success" });
        } catch (e) { setStatus({ msg: e.message, type: "error" }); }
        finally { setUnrolling(false); }
      }
    });
  };

  const isAdmin = user.role === "Admin";

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h3 style={{ marginBottom: "0.2rem" }}>Edit User: {user.name}</h3>
            {user.enrolled_section && (
              <span className="badge badge-blue" style={{ fontSize: "0.7rem", width: "fit-content" }}>
                Enrolled in {user.enrolled_section}
              </span>
            )}
          </div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body login-form" style={{ paddingTop: "1rem" }}>
          {status && <div className={`status-banner inline ${status.type}`}>{status.msg}</div>}
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="input-group">
            <label className="input-label">New Password (leave blank to keep current)</label>
            <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>

          <div className="form-row" style={{ alignItems: "flex-end" }}>
            <div className="input-group">
              <label className="input-label">Role</label>
              <select className="select" value={form.role} onChange={e => {
                const newRole = e.target.value;
                setForm(prev => ({ 
                  ...prev, 
                  role: newRole,
                  program: newRole === "Student" ? prev.program : null,
                  year_level: newRole === "Student" ? prev.year_level : null
                }));
              }} disabled={isAdmin}>
                {isAdmin ? <option>Admin</option> : null}
                <option>Student</option>
                <option>Professor</option>
              </select>
              {isAdmin && <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>Admin roles cannot be changed.</span>}
            </div>

            {user.enrolled_section && (
              <div className="input-group">
                <button type="button" className="btn btn-danger btn-sm w-full" style={{ height: 42 }} onClick={handleUnenroll} disabled={unrolling}>
                  {unrolling ? "..." : "Unenroll"}
                </button>
              </div>
            )}
          </div>

          {form.role === "Student" && (
            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Program</label>
                <select className="select" value={form.program || ""} onChange={e => setForm({ ...form, program: e.target.value })}>
                  <option value="">Select program…</option>
                  {programs.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Year Level</label>
                <select className="select" value={form.year_level || ""} onChange={e => setForm({ ...form, year_level: e.target.value })}>
                  <option value="">Select year</option>
                  {[1, 2, 3, 4].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          )}

          <div className="modal-footer" style={{ marginTop: "1.5rem" }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
      {confirmModal && <ConfirmModal {...confirmModal} onCancel={() => setConfirmModal(null)} />}
    </div>
  );
}

/* ── Course Edit Modal ── */
function CourseEditModal({ course, onClose, onSave }) {
  const [form, setForm] = useState({ ...course });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await window.api.updateCourse(course.id, form);
      onSave();
    } catch (e) { setStatus({ msg: e.message, type: "error" }); }
    finally { setSaving(false); }
  };

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Course</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body login-form">
          {status && <div className={`status-banner ${status.type}`} style={{ marginBottom: "1rem" }}>{status.msg}</div>}
          <div className="input-group">
            <label className="input-label">Course Name</label>
            <input className="input" value={form.course_name} onChange={e => setForm({ ...form, course_name: e.target.value })} required />
          </div>
          <div className="input-group">
            <label className="input-label">Course Code</label>
            <input className="input" value={form.course_code} onChange={e => setForm({ ...form, course_code: e.target.value })} required />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Confirmation Modal ── */
function ConfirmModal({ title, message, onConfirm, onCancel, confirmText = "Confirm", type = "danger" }) {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div className="modal-backdrop" style={{ zIndex: 10001 }} onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="modal-box" style={{ maxWidth: "400px" }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title || "Are you sure?"}</h3>
          <button className="modal-close" onClick={onCancel}>&times;</button>
        </div>
        <div className="modal-body" style={{ padding: "1.5rem" }}>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>{message}</p>
        </div>
        <div className="modal-footer" style={{ padding: "1rem", gap: "0.75rem" }}>
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className={`btn btn-${type}`} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}

/* ── Users Tab ── */
function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [blueprints, setBlueprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email_prefix: "", password: "", role: "Student", program: "", year_level: "" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [roleFilter, setRoleFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const load = () => {
    Promise.all([window.api.getUsers(), window.api.getBlueprints()])
      .then(([u, b]) => {
        setUsers(u);
        setBlueprints(b);
        const bpProgs = b.map(bp => bp.program);
        const userProgs = u.filter(user => user.program).map(user => user.program);
        const allProgs = [...new Set([...bpProgs, ...userProgs])];
        if (allProgs.length > 0 && !form.program) {
          setForm(prev => ({ ...prev, program: allProgs[0] }));
        }
      })
      .catch(e => showToast(e.message, "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    // Email Prefix Lockdown: Reject spaces and special characters
    const prefixRegex = /^[a-zA-Z0-9._-]+$/;
    if (!prefixRegex.test(form.email_prefix)) {
      showToast("Invalid email prefix. Use only letters, numbers, dots, and hyphens. No spaces or special characters.", "error");
      return;
    }

    if (form.email_prefix.includes("@")) {
      showToast("Username should not contain '@'. The domain is automatically added.", "error");
      return;
    }
    setSaving(true);
    try {
      const body = {
        name: form.name,
        email: `${form.email_prefix.toLowerCase()}@sadgen.edu.ph`,
        password: form.password,
        role: form.role,
        program: form.role === "Student" ? form.program : null,
        year_level: form.role === "Student" && form.year_level ? parseInt(form.year_level) : null,
      };
      await window.api.createUser(body);
      showToast("User created successfully.");
      setForm({ name: "", email_prefix: "", password: "", role: "Student", program: "", year_level: "" });
      load();
    } catch (e) { showToast(e.message, "error"); }
    finally { setSaving(false); }
  };

  const handleRemove = async (id) => {
    setConfirmModal({
      title: "Remove User",
      message: "Are you sure you want to remove this user? They will be moved to the Recycle Bin.",
      onConfirm: async () => {
        setConfirmModal(null);
        try { await window.api.deleteUser(id); showToast("User removed."); load(); }
        catch (e) { showToast(e.message, "error"); }
      }
    });
  };

  const roleBadge = { Admin: "badge-violet", Student: "badge-blue", Professor: "badge-amber" };

  const filteredUsers = users.filter(u => {
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    const matchesSearch = !searchQuery ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.enrolled_section && u.enrolled_section.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  return (
    <div className="animate-fade-in">
      {toast && <div className={`status-banner ${toast.type}`}>{toast.msg}</div>}

      <div className="glass-card" style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ marginBottom: "1rem", fontFamily: "var(--font-display)" }}>Create New Account</h3>
        <form onSubmit={handleCreate} id="create-user-form">
          <div className="form-row" style={{ marginBottom: "1rem" }}>
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input className="input" placeholder="e.g. Juan dela Cruz" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="input-group">
              <label className="input-label">Email Address (Prefix)</label>
              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  className="input"
                  style={{ flex: 1, borderRight: "none", borderRadius: "var(--radius-md) 0 0 var(--radius-md)" }}
                  placeholder="e.g. j.delacruz"
                  value={form.email_prefix}
                  onChange={e => {
                    const val = e.target.value.split("@")[0].replace(/\s/g, ''); // Auto-strip anything after @ and spaces
                    setForm({ ...form, email_prefix: val });
                  }}
                  required
                />
                <span style={{
                  background: "rgba(255,255,255,0.1)",
                  padding: "0 0.85rem",
                  height: 42,
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid var(--border-glass)",
                  borderLeft: "none",
                  borderRadius: "0 var(--radius-md) var(--radius-md) 0",
                  fontSize: "0.85rem",
                  color: "#fff",
                  whiteSpace: "nowrap",
                  fontWeight: 700
                }}>
                  @sadgen.edu.ph
                </span>
              </div>
            </div>
          </div>
          <div className="form-row" style={{ marginBottom: "1rem" }}>
            <div className="input-group">
              <label className="input-label">Password</label>
              <input className="input" type="password" placeholder="••••••••" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div className="input-group">
              <label className="input-label">Role</label>
              <select className="select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option>Admin</option>
                <option>Student</option>
                <option>Professor</option>
              </select>
            </div>
          </div>
          {form.role === "Student" && (
            <div className="form-row" style={{ marginBottom: "1rem" }}>
              <div className="input-group">
                <label className="input-label">Program</label>
                <select
                  className="select"
                  value={form.program}
                  onChange={e => setForm({ ...form, program: e.target.value })}
                  required
                >
                  <option value="">Select Program</option>
                  {[...new Set([...blueprints.map(b => b.program), ...users.filter(u => u.program).map(u => u.program)])].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Year Level</label>
                <select className="select" value={form.year_level} onChange={e => setForm({ ...form, year_level: e.target.value })} required>
                  <option value="">Select Year</option>
                  {[1, 2, 3, 4].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          )}
          <button id="create-user-btn" type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Creating…</> : "+ Create Account"}
          </button>
        </form>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", gap: "0.75rem", flexWrap: "wrap" }}>
        <h3 style={{ fontFamily: "var(--font-display)", flexShrink: 0 }}>User Directory</h3>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end", flex: 1 }}>
          <input
            className="input"
            placeholder="Search by name or email…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", flex: "1", minWidth: "160px", maxWidth: "280px" }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexShrink: 0 }}>
            <label className="text-xs font-medium" style={{ color: "var(--text-secondary)", whiteSpace: "nowrap" }}>Role:</label>
            <select className="select" style={{ width: "120px", padding: "0.4rem", fontSize: "0.85rem" }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option>All</option><option>Admin</option><option>Student</option><option>Professor</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? <div style={{ textAlign: "center", padding: "2rem" }}><span className="spinner" /></div> : (
        <div className="data-table-wrap" style={{ display: "flex", flexDirection: "column", overflowX: "auto" }}>
          <div style={{ minWidth: "720px" }}>
          {/* Standalone Header */}
          <div style={{ background: "#1e293b", borderRadius: "var(--radius-lg) var(--radius-lg) 0 0", borderBottom: "1px solid var(--border-glass)" }}>
            <table className="data-table" style={{ tableLayout: "fixed", marginBottom: 0 }}>
              <thead>
                <tr>
                  <th style={{ width: "44px" }}>#</th>
                  <th style={{ minWidth: "140px" }}>Name</th>
                  <th style={{ width: "200px" }}>Email</th>
                  <th style={{ width: "100px" }}>Role</th>
                  <th style={{ width: "100px" }}>Program</th>
                  <th style={{ width: "80px" }}>Year</th>
                  <th style={{ width: "120px" }}>Section</th>
                  <th style={{ width: "136px" }}>Actions</th>
                </tr>
              </thead>
            </table>
          </div>
          {/* Scrollable Body */}
          <div style={{ maxHeight: "450px", overflowY: "auto", borderRadius: "0 0 var(--radius-lg) var(--radius-lg)" }}>
            <table className="data-table" style={{ tableLayout: "fixed", marginTop: 0 }}>
              <tbody>
                {filteredUsers.length === 0 ? <tr><td colSpan="7" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>No users found</td></tr> :
                  filteredUsers.map((u, i) => (
                    <tr key={u.id}>
                      <td style={{ width: "44px", color: "var(--text-muted)" }}>{i + 1}</td>
                      <td style={{ minWidth: "140px", fontWeight: 500 }}>{u.name}</td>
                      <td style={{ width: "200px", color: "var(--text-secondary)", fontSize: "0.82rem", wordBreak: "break-all" }}>{u.email}</td>
                      <td style={{ width: "100px" }}><span className={`badge ${roleBadge[u.role] || "badge-blue"}`}>{u.role}</span></td>
                      <td style={{ width: "100px", color: "var(--text-secondary)" }}>{u.program || "—"}</td>
                      <td style={{ width: "80px", color: "var(--text-secondary)" }}>{u.year_level ? `Yr ${u.year_level}` : "—"}</td>
                      <td style={{ width: "120px" }}>
                        {u.enrolled_section ? (
                          <span className="badge badge-emerald" style={{ fontSize: "0.72rem" }}>{u.enrolled_section}</span>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>—</span>
                        )}
                      </td>
                      <td style={{ width: "136px", textAlign: "right" }}>
                        <div className="flex gap-1" style={{ justifyContent: "flex-end" }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => setEditUser(u)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleRemove(u.id)}>Remove</button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          </div>
        </div>
      )}

      {editUser && <UserEditModal user={editUser} blueprints={blueprints} onClose={() => setEditUser(null)} onSave={() => { setEditUser(null); load(); }} showToast={showToast} />}
      {confirmModal && <ConfirmModal {...confirmModal} onCancel={() => setConfirmModal(null)} />}
    </div>
  );
}

/* ── Courses Tab ── */
function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ course_name: "", course_code: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [editCourse, setEditCourse] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const showToast = (m, t = "success") => { setToast({ msg: m, type: t }); setTimeout(() => setToast(null), 3500); };

  const load = () => {
    window.api.getCourses()
      .then(setCourses)
      .catch(e => showToast(e.message, "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (courses.some(c => c.course_name.toLowerCase() === form.course_name.toLowerCase())) {
      showToast("Course name already exists.", "error");
      return;
    }
    setSaving(true);
    try {
      await window.api.createCourse({
        ...form,
        course_code: form.course_code.toUpperCase().trim()
      });
      showToast("Course created.");
      setForm({ course_name: "", course_code: "" });
      load();
    } catch (e) { showToast(e.message, "error"); } finally { setSaving(false); }
  };

  const handleRemove = async (id) => {
    setConfirmModal({
      title: "Remove Course",
      message: "Are you sure you want to remove this course? It will be moved to the Recycle Bin.",
      onConfirm: async () => {
        setConfirmModal(null);
        try { await window.api.deleteCourse(id); showToast("Course removed."); load(); }
        catch (e) { showToast(e.message, "error"); }
      }
    });
  };

  const filteredCourses = courses.filter(c =>
    !searchQuery ||
    c.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.course_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      {toast && <div className={`status-banner ${toast.type}`}>{toast.msg}</div>}
      <div className="glass-card" style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ marginBottom: "1rem", fontFamily: "var(--font-display)" }}>Add Course</h3>
        <form onSubmit={handleCreate} id="create-course-form">
          <div className="form-row" style={{ marginBottom: "1rem" }}>
            <div className="input-group">
              <label className="input-label">Course Name</label>
              <input className="input" placeholder="e.g. Human-Computer Interaction 2" value={form.course_name}
                onChange={e => setForm({ ...form, course_name: e.target.value })} required />
            </div>
            <div className="input-group">
              <label className="input-label">Course Code</label>
              <input className="input" placeholder="e.g. HCI2" value={form.course_code}
                onChange={e => setForm({ ...form, course_code: e.target.value.toUpperCase() })} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving} id="create-course-btn">
            {saving ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Adding…</> : "+ Add Course"}
          </button>
        </form>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", gap: "1rem" }}>
        <h3 style={{ fontFamily: "var(--font-display)" }}>Available Courses</h3>
        <div className="input-group" style={{ width: "300px" }}>
          <input
            className="input"
            placeholder="Search courses or codes…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
          />
        </div>
      </div>

      {loading ? <div style={{ textAlign: "center", padding: "2rem" }}><span className="spinner" /></div> : (
        <div className="data-table-wrap" style={{ display: "flex", flexDirection: "column", overflowX: "auto" }}>
          <div style={{ minWidth: "480px" }}>
          {/* Standalone Header */}
          <div style={{ background: "#1e293b", borderRadius: "var(--radius-lg) var(--radius-lg) 0 0", borderBottom: "1px solid var(--border-glass)" }}>
            <table className="data-table" style={{ tableLayout: "fixed", marginBottom: 0 }}>
              <thead>
                <tr>
                  <th style={{ width: "44px" }}>#</th>
                  <th>Course Name</th>
                  <th style={{ width: "100px" }}>Code</th>
                  <th style={{ width: "140px" }}>Actions</th>
                </tr>
              </thead>
            </table>
          </div>
          {/* Scrollable Body */}
          <div style={{ maxHeight: "450px", overflowY: "auto", borderRadius: "0 0 var(--radius-lg) var(--radius-lg)" }}>
            <table className="data-table" style={{ tableLayout: "fixed", marginTop: 0 }}>
              <tbody>
                {filteredCourses.length === 0 ? <tr><td colSpan="4" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>No courses found</td></tr> :
                  filteredCourses.map((c, i) => (
                    <tr key={c.id}>
                      <td style={{ width: "44px", color: "var(--text-muted)" }}>{i + 1}</td>
                      <td style={{ fontWeight: 500 }}>{c.course_name}</td>
                      <td style={{ width: "100px" }}><span className="badge badge-blue">{c.course_code}</span></td>
                      <td style={{ width: "140px", textAlign: "right" }}>
                        <div className="flex gap-1" style={{ justifyContent: "flex-end" }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => setEditCourse(c)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleRemove(c.id)}>Remove</button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          </div>
        </div>
      )}

      {editCourse && <CourseEditModal course={editCourse} onClose={() => setEditCourse(null)} onSave={() => { setEditCourse(null); load(); showToast("Course updated."); }} />}
      {confirmModal && <ConfirmModal {...confirmModal} onCancel={() => setConfirmModal(null)} />}
    </div>
  );
}

/* ── Blueprint Tab ── */
function AdminBlueprint() {
  const [bps, setBps] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ program: "", year_level: "", course_id: "", course_search: "" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [editGroup, setEditGroup] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const showToast = (m, t = "success") => {
    let msg = m;
    if (Array.isArray(m)) {
      msg = m.map(e => e.msg).join(", ");
    } else if (typeof m === 'object' && m !== null) {
      msg = m.detail || JSON.stringify(m);
    }
    setToast({ msg, type: t });
    setTimeout(() => setToast(null), 3500);
  };

  const load = () => {
    Promise.all([window.api.getBlueprints(), window.api.getCourses()])
      .then(([b, c]) => {
        setBps(b);
        setCourses(c);
      })
      .catch(e => showToast(e.message, "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.course_id) {
      showToast("Please select a course from the dropdown.", "error");
      return;
    }
    setSaving(true);
    try {
      await window.api.addBlueprint({ program: form.program, year_level: parseInt(form.year_level), course_id: parseInt(form.course_id) });
      showToast("Added to blueprint.");
      setForm({ ...form, course_id: "", course_search: "" });
      load();
    } catch (e) {
      // Handle Pydantic/FastAPI validation errors
      try {
        const err = JSON.parse(e.message);
        showToast(err, "error");
      } catch {
        showToast(e.message, "error");
      }
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await window.api.deleteBlueprint(id); showToast("Removed."); load(); }
    catch (e) { showToast(e.message, "error"); }
  };

  const handleDeleteGroup = (grp) => {
    const parts = grp.split(" · Year ");
    setConfirmModal({
      title: "Remove Curriculum",
      message: `Are you sure you want to delete all course mappings for ${grp}? These will be moved to the Recycle Bin.`,
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await window.api.deleteBlueprintGroup(parts[0], parts[1] || "");
          showToast("Curriculum deleted.");
          load();
        } catch (e) { showToast(e.message, "error"); }
      }
    });
  };

  const groups = {};
  bps.forEach(b => {
    const key = `${b.program} · Year ${b.year_level}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(b);
  });

  const filteredCourses = courses.filter(c =>
    !form.course_search ||
    c.course_name.toLowerCase().includes(form.course_search.toLowerCase()) ||
    c.course_code.toLowerCase().includes(form.course_search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      {toast && <div className={`status-banner ${toast.type}`}>{toast.msg}</div>}
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div className="page-header" style={{margin: 0}}>
          <h2 className="page-title">🗺 Curriculum Blueprints</h2>
          <p className="page-subtitle">Define the standard set of courses for each program and year level.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditGroup("NEW")}>
          <span style={{marginRight: "0.5rem"}}>✨</span> Create New Curriculum
        </button>
      </div>

      {loading ? <div style={{ textAlign: "center", padding: "2rem" }}><span className="spinner" /></div> : (
        Object.entries(groups).length === 0
          ? <div className="empty-state"><div className="empty-state-icon">🗺</div><div className="empty-state-title">No blueprints defined</div></div>
          : Object.entries(groups).map(([grp, items]) => (
            <div key={grp} style={{ marginBottom: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.5rem" }}>
                <h3 style={{
                  fontFamily: "var(--font-display)", fontSize: "0.9rem", color: "var(--text-secondary)",
                  textTransform: "uppercase", letterSpacing: "0.06em", margin: 0
                }}>{grp}</h3>
                <div className="flex gap-1">
                  <button className="btn btn-ghost btn-sm" style={{fontSize: "0.7rem"}} onClick={() => setEditGroup(grp)}>⚙ Manage Blueprint</button>
                  <button className="btn btn-danger btn-sm" style={{fontSize: "0.7rem"}} onClick={() => handleDeleteGroup(grp)}>🗑 Delete Group</button>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {items.map(b => (
                  <div key={b.id} className="section-course-row">
                    <div>
                      <span style={{ fontWeight: 500 }}>{b.course.course_name}</span>
                      <span className="badge badge-blue" style={{ marginLeft: "0.5rem" }}>{b.course.course_code}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
      )}

      {editGroup && (
        <BlueprintManageModal 
          group={editGroup === "NEW" ? null : editGroup} 
          allCourses={courses}
          onClose={() => setEditGroup(null)} 
          onSave={() => { setEditGroup(null); showToast("Curriculum updated."); load(); }} 
        />
      )}

      {confirmModal && <ConfirmModal {...confirmModal} onCancel={() => setConfirmModal(null)} />}
    </div>
  );
}

/* ── Sections Tab ── */
function AdminSections() {
  const [sections, setSections] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [blueprints, setBlueprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ program: "", year_level: "", slot_limit: 40 });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [expandedSections, setExpandedSections] = useState([]);
  const [confirmModal, setConfirmModal] = useState(null);

  const showToast = (m, t = "success") => { setToast({ msg: m, type: t }); setTimeout(() => setToast(null), 3500); };

  const load = () => {
    Promise.all([window.api.getAllSections(), window.api.getUsers(), window.api.getBlueprints()])
      .then(([s, u, b]) => {
        const sortedSections = [...s].sort((x, y) => x.section_name.localeCompare(y.section_name));
        setSections(sortedSections);
        setProfessors(u.filter(user => user.role === "Professor"));
        setBlueprints(b);
        // Default program to empty
        if (!form.program) setForm(prev => ({ ...prev, program: "" }));
      })
      .catch(e => showToast(e.message, "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const programs = [...new Set(blueprints.map(bp => bp.program))];

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.program) { showToast("Please select a program.", "error"); return; }
    setSaving(true);
    try {
      await window.api.generateSection({ program: form.program, year_level: parseInt(form.year_level), slot_limit: parseInt(form.slot_limit) });
      showToast(`Section generated from blueprint.`);
      load();
    } catch (e) { showToast(e.message, "error"); } finally { setSaving(false); }
  };

  const handleAssign = async (scId, profId) => {
    if (!profId) return;
    try {
      await window.api.assignProfessor({ section_course_id: parseInt(scId), professor_id: parseInt(profId) });
      showToast("Professor assigned.");
      load();
    } catch (e) { showToast(e.message, "error"); }
  };

  const handleRemoveSection = async (sec) => {
    if (sec.enrolled_count > 0) {
      showToast(`Cannot remove section "${sec.section_name}" because it has ${sec.enrolled_count} enrolled students.`, "error");
      return;
    }
    setConfirmModal({
      title: "Remove Section",
      message: `Are you sure you want to remove section "${sec.section_name}"? All course assignments for this section will be lost.`,
      onConfirm: async () => {
        setConfirmModal(null);
        try { await window.api.deleteSection(sec.id); showToast("Section removed."); load(); }
        catch (e) { showToast(e.message, "error"); }
      }
    });
  };

  return (
    <div className="animate-fade-in">
      {toast && <div className={`status-banner ${toast.type}`}>{toast.msg}</div>}

      <div className="glass-card" style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ marginBottom: "0.4rem", fontFamily: "var(--font-display)" }}>Generate Block Section</h3>
        <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
          Automatically populates courses from the Curriculum Blueprint and handles automatic naming.
        </p>
        <form onSubmit={handleGenerate} id="generate-section-form" noValidate>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem", alignItems: "flex-end" }}>
            <div className="input-group">
              <label className="input-label">Program (from Blueprints)</label>
              <select className="select" value={form.program} onChange={e => setForm({ ...form, program: e.target.value })} required>
                <option value="">Select program…</option>
                {programs.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Year</label>
              <select className="select" value={form.year_level} onChange={e => setForm({ ...form, year_level: e.target.value })}>
                <option value="">Not Set</option>
                {[1, 2, 3, 4].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Slot Limit</label>
              <input className="input" type="number" min="1" value={form.slot_limit}
                onChange={e => setForm({ ...form, slot_limit: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-success" disabled={saving} id="generate-section-btn" style={{ height: 42 }}>
              {saving ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : "🎓 Generate"}
            </button>
          </div>
        </form>
      </div>

      {loading ? <div style={{ textAlign: "center", padding: "2rem" }}><span className="spinner" /></div> : (
        sections.length === 0
          ? <div className="empty-state"><div className="empty-state-icon">🏫</div><div className="empty-state-title">No sections yet</div></div>
          : <div className="section-grid">
            {sections.map(sec => {
              const isExpanded = expandedSections.includes(sec.id);
              return (
                <div key={sec.id} className="section-card-container">
                  <div className="glass-card" style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.85rem" }}>
                      <div>
                        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem" }}>{sec.section_name}</h3>
                        <div className="flex gap-1 mt-1">
                          <span className="badge badge-blue">{sec.program}</span>
                          <span className="badge badge-violet">Yr {sec.year_level}</span>
                        </div>
                      </div>
                      <button className="modal-close" style={{ fontSize: "1rem" }} onClick={() => handleRemoveSection(sec)}>&times;</button>
                    </div>

                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1rem", display: "flex", justifyContent: "space-between" }}>
                      <span>Capacity: {sec.slot_limit}</span>
                      <span style={{ color: sec.enrolled_count >= sec.slot_limit ? "var(--accent-rose)" : "var(--accent-emerald)" }}>
                        Enrolled: {sec.enrolled_count}
                      </span>
                    </div>

                    <div style={{ marginTop: "auto" }}>
                      <button
                        className={`btn btn-sm w-full ${isExpanded ? "btn-primary" : "btn-ghost"}`}
                        style={{ transition: "all 0.3s ease" }}
                        onClick={() => {
                          if (isExpanded) setExpandedSections(expandedSections.filter(id => id !== sec.id));
                          else setExpandedSections([...expandedSections, sec.id]);
                        }}
                      >
                        {isExpanded ? "▴ Hide Course Roster" : "▾ Manage Course Assignments"}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="floating-roster">
                      <p style={{ fontSize: "0.75rem", color: "var(--text-accent)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Course Assignments</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {(sec.section_courses || [])
                          .sort((a, b) => a.course.course_name.localeCompare(b.course.course_name))
                          .map(sc => (
                            <div key={sc.id} style={{ padding: "0.75rem", background: "rgba(255,255,255,0.03)", borderRadius: "10px", border: "1px solid var(--border-glass)" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", alignItems: "flex-start" }}>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                  <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-primary)" }}>{sc.course.course_code}</span>
                                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.2 }}>{sc.course.course_name}</span>
                                </div>
                              </div>
                              <div className="input-group">
                                <label className="input-label" style={{ fontSize: "0.65rem" }}>Assign Instructor</label>
                                <select
                                  className="select"
                                  style={{ padding: "0.3rem 0.5rem", fontSize: "0.8rem" }}
                                  value={sc.professor?.id || ""}
                                  onChange={(e) => handleAssign(sc.id, e.target.value)}
                                >
                                  <option value="">TBA / Select Professor…</option>
                                  {professors.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
      )}
      {confirmModal && <ConfirmModal {...confirmModal} onCancel={() => setConfirmModal(null)} />}
    </div>
  );
}

/* ── Blueprint Management Modal ── */
function BlueprintManageModal({ group, onClose, onSave, allCourses }) {
  const parts = group ? group.split(" · Year ") : ["", ""];
  const [prog, setProg] = useState(parts[0]);
  const [year, setYear] = useState(parts[1] || "");
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    if (group) {
      window.api.getBlueprints().then(bps => {
        // Ensure type-safe comparison for year_level
        const targetYear = parseInt(parts[1], 10);
        const current = bps.filter(b => b.program === parts[0] && parseInt(b.year_level, 10) === targetYear);
        setSelectedIds(current.map(c => Number(c.course.id)));
      });
    }
  }, [group]);

  const toggleCourse = (id) => {
    const numId = Number(id);
    setSelectedIds(prev => prev.includes(numId) ? prev.filter(x => x !== numId) : [...prev, numId]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prog || !year) { setStatus({ msg: "Please set Program and Year.", type: "error" }); return; }
    if (selectedIds.length === 0) { setStatus({ msg: "Please select at least one course for the curriculum.", type: "error" }); return; }
    
    setSaving(true);
    try {
      if (group) {
        // Update header if changed
        if (prog !== parts[0] || year !== parts[1]) {
          await window.api.updateBlueprintGroup(parts[0], parts[1], prog, year);
        }
      }
      // Sync courses
      await window.api.syncBlueprintCourses(prog, year, selectedIds);
      onSave();
    } catch (e) { setStatus({ msg: e.message, type: "error" }); }
    finally { setSaving(false); }
  };

  const filtered = allCourses.filter(c => 
    !search || 
    c.course_name.toLowerCase().includes(search.toLowerCase()) || 
    c.course_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box" style={{ maxWidth: "500px" }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{group ? "Manage Curriculum" : "Create New Curriculum"}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          {status && <div className={`status-banner inline ${status.type}`}>{status.msg}</div>}
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            <div className="input-group">
              <label className="input-label">Program</label>
              <input className="input" placeholder="e.g. BSCS" value={prog} onChange={e => setProg(e.target.value.toUpperCase())} required />
            </div>
            <div className="input-group">
              <label className="input-label">Year Level</label>
              <select className="select" value={year} onChange={e => setYear(e.target.value)} required>
                <option value="">Select...</option>
                {[1, 2, 3, 4].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Courses Checklist ({selectedIds.length} selected)</label>
            <input className="input" style={{marginBottom: "0.5rem"}} placeholder="🔍 Search courses..." value={search} onChange={e => setSearch(e.target.value)} />
            <div className="glass-card" style={{ padding: "0.5rem", maxHeight: "250px", overflowY: "auto", background: "rgba(0,0,0,0.1)" }}>
              {filtered.map(c => (
                <label key={c.id} style={{ 
                  display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem", 
                  cursor: "pointer", borderRadius: "6px", transition: "0.2s" 
                }} className="hover-highlight">
                  <input type="checkbox" checked={selectedIds.includes(Number(c.id))} onChange={() => toggleCourse(c.id)} />
                  <div style={{ flex: 1, fontSize: "0.9rem" }}>
                    <div style={{ fontWeight: 600 }}>{c.course_code}</div>
                    <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>{c.course_name}</div>
                  </div>
                </label>
              ))}
              {filtered.length === 0 && <div style={{padding: "1rem", textAlign: "center", color: "var(--text-muted)"}}>No courses found.</div>}
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: "1.5rem" }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" style={{width: 14, height: 14}} /> : (group ? "Save Changes" : "Create Curriculum")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Recycle Bin Tab ── */
function AdminRecycleBin() {
  const [items, setItems] = useState({ users: [], courses: [], blueprints: [] });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const showToast = (m, t = "success") => { setToast({ msg: m, type: t }); setTimeout(() => setToast(null), 3500); };

  const load = () => {
    setLoading(true);
    window.api.getTrash()
      .then(setItems)
      .catch(e => showToast(e.message, "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleRestore = async (type, id) => {
    try {
      await window.api.restoreItem(type, id);
      showToast("Item restored successfully.");
      load();
    } catch (e) { showToast(e.message, "error"); }
  };

  const handlePurge = (type, id) => {
    setConfirmModal({
      title: "Permanent Delete",
      message: "This item will be deleted forever. This action cannot be undone.",
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await window.api.purgeItem(type, id);
          showToast("Item permanently deleted.");
          load();
        } catch (e) { showToast(e.message, "error"); }
      }
    });
  };

  const isEmpty = items.users.length === 0 && items.courses.length === 0 && items.blueprints.length === 0;

  return (
    <div className="animate-fade-in">
      {toast && <div className={`status-banner ${toast.type}`}>{toast.msg}</div>}
      
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <h2 className="page-title">♻ Recycle Bin</h2>
        <p className="page-subtitle">Review deleted items. You can restore them to their original location or purge them forever.</p>
      </div>

      {loading ? <div className="text-center p-8"><span className="spinner" /></div> : (
        isEmpty ? (
          <div className="empty-state">
            <div className="empty-state-icon">🗑</div>
            <div className="empty-state-title">Your trash is empty</div>
            <p style={{color: "var(--text-muted)", fontSize: "0.9rem"}}>Items you delete will appear here for recovery.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            
            {items.users.length > 0 && (
              <div>
                <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{fontSize: "1.2rem"}}>👤</span> Deleted Users
                </h3>
                <div className="glass-card" style={{padding: 0, overflow: "hidden"}}>
                  <div className="data-table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr><th>Name</th><th>Email</th><th>Role</th><th style={{ width: "200px" }}>Actions</th></tr>
                      </thead>
                      <tbody>
                        {items.users.map(u => (
                          <tr key={u.id}>
                            <td style={{fontWeight: 600}}>{u.name}</td>
                            <td style={{color: "var(--text-secondary)"}}>{u.email}</td>
                            <td><span className="badge badge-blue">{u.role}</span></td>
                            <td>
                              <div className="flex gap-1">
                                <button className="btn btn-ghost btn-sm" onClick={() => handleRestore("user", u.id)}>Restore</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handlePurge("user", u.id)}>Purge</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {items.courses.length > 0 && (
              <div>
                <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{fontSize: "1.2rem"}}>📘</span> Deleted Courses
                </h3>
                <div className="glass-card" style={{padding: 0, overflow: "hidden"}}>
                  <div className="data-table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr><th>Course Name</th><th>Code</th><th style={{ width: "200px" }}>Actions</th></tr>
                      </thead>
                      <tbody>
                        {items.courses.map(c => (
                          <tr key={c.id}>
                            <td style={{fontWeight: 600}}>{c.course_name}</td>
                            <td><span className="badge badge-violet">{c.course_code}</span></td>
                            <td>
                              <div className="flex gap-1">
                                <button className="btn btn-ghost btn-sm" onClick={() => handleRestore("course", c.id)}>Restore</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handlePurge("course", c.id)}>Purge</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {items.blueprints.length > 0 && (
              <div>
                <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{fontSize: "1.2rem"}}>🗺</span> Deleted Blueprint Entries
                </h3>
                <div className="glass-card" style={{padding: 0, overflow: "hidden"}}>
                  <div className="data-table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr><th>Program</th><th>Year</th><th>Course</th><th style={{ width: "200px" }}>Actions</th></tr>
                      </thead>
                      <tbody>
                        {items.blueprints.map(b => (
                          <tr key={b.id}>
                            <td style={{fontWeight: 600}}>{b.program}</td>
                            <td>Year {b.year_level}</td>
                            <td style={{color: "var(--text-secondary)"}}>{b.course?.course_name}</td>
                            <td>
                              <div className="flex gap-1">
                                <button className="btn btn-ghost btn-sm" onClick={() => handleRestore("blueprint", b.id)}>Restore</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handlePurge("blueprint", b.id)}>Purge</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      )}

      {confirmModal && <ConfirmModal {...confirmModal} onCancel={() => setConfirmModal(null)} />}
    </div>
  );
}

/* ── Main Dashboard ── */
function AdminDashboard() {
  const [tab, setTab] = useState(sessionStorage.getItem("sadgen_admin_tab") || "welcome");

  useEffect(() => {
    sessionStorage.setItem("sadgen_admin_tab", tab);
  }, [tab]);

  useEffect(() => {
    const handleTabChange = (e) => setTab(e.detail);
    window.addEventListener('changeAdminTab', handleTabChange);
    return () => window.removeEventListener('changeAdminTab', handleTabChange);
  }, []);

  return (
    <div className="page animate-fade-in">
      {tab === "welcome" && (
        <div className="page-header" style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 className="page-title">Admin Control Panel</h1>
          <p className="page-subtitle">Oversee user accounts, define curricula, and organize block sections.</p>
        </div>
      )}

      <div className="tab-content-container">
        {tab === "welcome" && <AdminWelcome />}
        {tab === "users" && <AdminUsers key="users" />}
        {tab === "courses" && <AdminCourses key="courses" />}
        {tab === "blueprint" && <AdminBlueprint key="blueprint" />}
        {tab === "sections" && <AdminSections key="sections" />}
        {tab === "trash" && <AdminRecycleBin key="trash" />}
      </div>
    </div>
  );
}

window.AdminDashboard = AdminDashboard;
