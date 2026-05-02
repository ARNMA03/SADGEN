// ═══════════════════════════════════════════════
//  AdminDashboard.js — Full admin control panel
// ═══════════════════════════════════════════════

const { useState, useEffect } = React;

/* ── Users Tab ── */
function AdminUsers() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [form, setForm]         = useState({ name:"", email:"", password:"", role:"Student", program:"", year_level:"" });
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState(null);

  const showToast = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3500); };
  
  const load = () => {
    window.api.getUsers()
      .then(setUsers)
      .catch(e => showToast(e.message, "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        name: form.name, email: form.email, password: form.password, role: form.role,
        program: form.program || null,
        year_level: form.year_level ? parseInt(form.year_level) : null,
      };
      await window.api.createUser(body);
      showToast("User created successfully.");
      setForm({ name:"", email:"", password:"", role:"Student", program:"", year_level:"" });
      load();
    } catch(e) { showToast(e.message, "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this user?")) return;
    try { await window.api.deleteUser(id); showToast("User deleted."); load(); }
    catch(e) { showToast(e.message, "error"); }
  };

  const roleBadge = { Admin:"badge-violet", Student:"badge-blue", Professor:"badge-amber" };

  return (
    <div>
      {toast && <div className={`status-banner ${toast.type}`}>{toast.msg}</div>}

      <div className="glass-card" style={{marginBottom:"1.5rem"}}>
        <h3 style={{marginBottom:"1rem",fontFamily:"var(--font-display)"}}>Create New Account</h3>
        <form onSubmit={handleCreate} id="create-user-form">
          <div className="form-row" style={{marginBottom:"1rem"}}>
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input className="input" placeholder="e.g. Juan dela Cruz" value={form.name}
                onChange={e=>setForm({...form,name:e.target.value})} required />
            </div>
            <div className="input-group">
              <label className="input-label">Email</label>
              <input className="input" type="email" placeholder="user@sadgen.edu" value={form.email}
                onChange={e=>setForm({...form,email:e.target.value})} required />
            </div>
          </div>
          <div className="form-row" style={{marginBottom:"1rem"}}>
            <div className="input-group">
              <label className="input-label">Password</label>
              <input className="input" type="password" placeholder="••••••••" value={form.password}
                onChange={e=>setForm({...form,password:e.target.value})} required />
            </div>
            <div className="input-group">
              <label className="input-label">Role</label>
              <select className="select" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
                <option>Admin</option><option>Student</option><option>Professor</option>
              </select>
            </div>
          </div>
          {form.role === "Student" && (
            <div className="form-row" style={{marginBottom:"1rem"}}>
              <div className="input-group">
                <label className="input-label">Program (e.g. BSCS)</label>
                <input className="input" placeholder="BSCS" value={form.program}
                  onChange={e=>setForm({...form,program:e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Year Level</label>
                <select className="select" value={form.year_level} onChange={e=>setForm({...form,year_level:e.target.value})}>
                  <option value="">Select year</option>
                  {[1,2,3,4].map(y=><option key={y}>{y}</option>)}
                </select>
              </div>
            </div>
          )}
          <button id="create-user-btn" type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <><span className="spinner" style={{width:14,height:14,borderWidth:2}}/> Creating…</> : "+ Create Account"}
          </button>
        </form>
      </div>

      {loading ? <div style={{textAlign:"center",padding:"2rem"}}><span className="spinner"/></div> : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Program</th><th>Year</th><th></th></tr></thead>
            <tbody>
              {users.map((u,i)=>(
                <tr key={u.id}>
                  <td style={{color:"var(--text-muted)"}}>{i+1}</td>
                  <td style={{fontWeight:500}}>{u.name}</td>
                  <td style={{color:"var(--text-secondary)"}}>{u.email}</td>
                  <td><span className={`badge ${roleBadge[u.role]||"badge-blue"}`}>{u.role}</span></td>
                  <td style={{color:"var(--text-secondary)"}}>{u.program||"—"}</td>
                  <td style={{color:"var(--text-secondary)"}}>{u.year_level ? `Year ${u.year_level}` : "—"}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(u.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Courses Tab ── */
function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState({ course_name:"", course_code:"" });
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState(null);

  const showToast = (m,t="success")=>{ setToast({msg:m,type:t}); setTimeout(()=>setToast(null),3500); };
  
  const load = () => {
    window.api.getCourses()
      .then(setCourses)
      .catch(e => showToast(e.message, "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await window.api.createCourse(form);
      showToast("Course created.");
      setForm({course_name:"",course_code:""});
      load();
    } catch(e){ showToast(e.message,"error"); } finally { setSaving(false); }
  };

  return (
    <div>
      {toast && <div className={`status-banner ${toast.type}`}>{toast.msg}</div>}
      <div className="glass-card" style={{marginBottom:"1.5rem"}}>
        <h3 style={{marginBottom:"1rem",fontFamily:"var(--font-display)"}}>Add Course</h3>
        <form onSubmit={handleCreate} id="create-course-form">
          <div className="form-row" style={{marginBottom:"1rem"}}>
            <div className="input-group">
              <label className="input-label">Course Name</label>
              <input className="input" placeholder="e.g. Human-Computer Interaction 2" value={form.course_name}
                onChange={e=>setForm({...form,course_name:e.target.value})} required />
            </div>
            <div className="input-group">
              <label className="input-label">Course Code</label>
              <input className="input" placeholder="e.g. HCI2" value={form.course_code}
                onChange={e=>setForm({...form,course_code:e.target.value})} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving} id="create-course-btn">
            {saving ? <><span className="spinner" style={{width:14,height:14,borderWidth:2}}/> Adding…</> : "+ Add Course"}
          </button>
        </form>
      </div>
      {loading ? <div style={{textAlign:"center",padding:"2rem"}}><span className="spinner"/></div> : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th>#</th><th>Course Name</th><th>Code</th></tr></thead>
            <tbody>
              {courses.map((c,i)=>(
                <tr key={c.id}>
                  <td style={{color:"var(--text-muted)"}}>{i+1}</td>
                  <td style={{fontWeight:500}}>{c.course_name}</td>
                  <td><span className="badge badge-blue">{c.course_code}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Blueprint Tab ── */
function AdminBlueprint() {
  const [bps, setBps]         = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState({ program:"BSCS", year_level:"2", course_id:"" });
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState(null);

  const showToast = (m,t="success")=>{ setToast({msg:m,type:t}); setTimeout(()=>setToast(null),3500); };
  
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
    e.preventDefault(); setSaving(true);
    try {
      await window.api.addBlueprint({ program:form.program, year_level:parseInt(form.year_level), course_id:parseInt(form.course_id) });
      showToast("Added to blueprint.");
      load();
    } catch(e){ showToast(e.message,"error"); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await window.api.deleteBlueprint(id); showToast("Removed."); load(); }
    catch(e){ showToast(e.message,"error"); }
  };

  const groups = {};
  bps.forEach(b => {
    const key = `${b.program} · Year ${b.year_level}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(b);
  });

  return (
    <div>
      {toast && <div className={`status-banner ${toast.type}`}>{toast.msg}</div>}
      <div className="glass-card" style={{marginBottom:"1.5rem"}}>
        <h3 style={{marginBottom:"1rem",fontFamily:"var(--font-display)"}}>Add to Blueprint</h3>
        <form onSubmit={handleAdd} id="add-blueprint-form">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 2fr auto",gap:"0.75rem",alignItems:"flex-end",flexWrap:"wrap"}}>
            <div className="input-group">
              <label className="input-label">Program</label>
              <input className="input" placeholder="BSCS" value={form.program}
                onChange={e=>setForm({...form,program:e.target.value})} required />
            </div>
            <div className="input-group">
              <label className="input-label">Year</label>
              <select className="select" value={form.year_level} onChange={e=>setForm({...form,year_level:e.target.value})}>
                {[1,2,3,4].map(y=><option key={y}>{y}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Course</label>
              <select className="select" value={form.course_id} onChange={e=>setForm({...form,course_id:e.target.value})} required>
                <option value="">Select course…</option>
                {courses.map(c=><option key={c.id} value={c.id}>{c.course_code} — {c.course_name}</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving} id="add-blueprint-btn" style={{height:42}}>
              {saving ? <span className="spinner" style={{width:14,height:14,borderWidth:2}}/> : "Add"}
            </button>
          </div>
        </form>
      </div>

      {loading ? <div style={{textAlign:"center",padding:"2rem"}}><span className="spinner"/></div> : (
        Object.entries(groups).length === 0
          ? <div className="empty-state"><div className="empty-state-icon">🗺</div><div className="empty-state-title">No blueprints defined</div></div>
          : Object.entries(groups).map(([grp, items]) => (
            <div key={grp} style={{marginBottom:"1.5rem"}}>
              <h3 style={{fontFamily:"var(--font-display)",fontSize:"0.85rem",color:"var(--text-secondary)",
                          textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"0.6rem"}}>{grp}</h3>
              <div style={{display:"flex",flexDirection:"column",gap:"0.4rem"}}>
                {items.map(b=>(
                  <div key={b.id} className="section-course-row">
                    <div>
                      <span style={{fontWeight:500}}>{b.course.course_name}</span>
                      <span className="badge badge-blue" style={{marginLeft:"0.5rem"}}>{b.course.course_code}</span>
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(b.id)}>Remove</button>
                  </div>
                ))}
              </div>
            </div>
          ))
      )}
    </div>
  );
}

/* ── Sections Tab ── */
function AdminSections() {
  const [sections, setSections]   = useState([]);
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [form, setForm]           = useState({ program:"BSCS", year_level:"2", section_name:"" });
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState(null);

  const showToast = (m,t="success")=>{ setToast({msg:m,type:t}); setTimeout(()=>setToast(null),3500); };

  const load = () => {
    Promise.all([window.api.getAllSections(), window.api.getUsers()])
      .then(([s, u]) => {
        setSections(s);
        setProfessors(u.filter(user => user.role === "Professor"));
      })
      .catch(e => showToast(e.message, "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleGenerate = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await window.api.generateSection({ program:form.program, year_level:parseInt(form.year_level), section_name:form.section_name });
      showToast(`Section ${form.section_name} generated from blueprint.`);
      setForm({...form,section_name:""});
      load();
    } catch(e){ showToast(e.message,"error"); } finally { setSaving(false); }
  };

  const handleAssign = async (scId, profId) => {
    if (!profId) return;
    try {
      await window.api.assignProfessor({ section_course_id:parseInt(scId), professor_id:parseInt(profId) });
      showToast("Professor assigned.");
      load();
    } catch(e){ showToast(e.message,"error"); }
  };

  return (
    <div>
      {toast && <div className={`status-banner ${toast.type}`}>{toast.msg}</div>}

      <div className="glass-card" style={{marginBottom:"1.5rem"}}>
        <h3 style={{marginBottom:"0.4rem",fontFamily:"var(--font-display)"}}>Generate Block Section</h3>
        <p style={{fontSize:"0.82rem",color:"var(--text-secondary)",marginBottom:"1rem"}}>
          Automatically populates courses from the Curriculum Blueprint.
        </p>
        <form onSubmit={handleGenerate} id="generate-section-form">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1.5fr auto",gap:"0.75rem",alignItems:"flex-end"}}>
            <div className="input-group">
              <label className="input-label">Program</label>
              <input className="input" placeholder="BSCS" value={form.program}
                onChange={e=>setForm({...form,program:e.target.value})} required />
            </div>
            <div className="input-group">
              <label className="input-label">Year</label>
              <select className="select" value={form.year_level} onChange={e=>setForm({...form,year_level:e.target.value})}>
                {[1,2,3,4].map(y=><option key={y}>{y}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Section Name (e.g. BSCS-2C)</label>
              <input className="input" placeholder="BSCS-2C" value={form.section_name}
                onChange={e=>setForm({...form,section_name:e.target.value})} required />
            </div>
            <button type="submit" className="btn btn-success" disabled={saving} id="generate-section-btn" style={{height:42}}>
              {saving ? <span className="spinner" style={{width:14,height:14,borderWidth:2}}/> : "⚡ Generate"}
            </button>
          </div>
        </form>
      </div>

      {loading ? <div style={{textAlign:"center",padding:"2rem"}}><span className="spinner"/></div> : (
        sections.length === 0
          ? <div className="empty-state"><div className="empty-state-icon">🏫</div><div className="empty-state-title">No sections yet</div></div>
          : sections.map(sec=>(
            <div key={sec.id} className="glass-card" style={{marginBottom:"1rem"}}>
              <div style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"0.85rem"}}>
                <h3 style={{fontFamily:"var(--font-display)",fontSize:"1.1rem"}}>{sec.section_name}</h3>
                <span className="badge badge-blue">{sec.program}</span>
                <span className="badge badge-violet">Year {sec.year_level}</span>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
                {(sec.section_courses||[]).map(sc=>(
                  <div key={sc.id} className="section-course-row">
                    <div>
                      <span style={{fontWeight:500,fontSize:"0.9rem"}}>{sc.course.course_name}</span>
                      <span className="badge badge-blue" style={{marginLeft:"0.5rem"}}>{sc.course.course_code}</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
                      {sc.professor
                        ? <span style={{fontSize:"0.82rem",color:"var(--accent-cyan)"}}>👩‍🏫 {sc.professor.name}</span>
                        : <span style={{fontSize:"0.78rem",color:"var(--text-muted)"}}>Unassigned</span>
                      }
                      <select
                        className="select"
                        style={{width:180,padding:"0.3rem 0.6rem",fontSize:"0.8rem"}}
                        value={sc.professor?.id||""}
                        onChange={e=>handleAssign(sc.id, e.target.value)}
                      >
                        <option value="">— Assign professor —</option>
                        {professors.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
      )}
    </div>
  );
}

/* ── Main Dashboard ── */
function AdminDashboard() {
  const [tab, setTab] = useState("users");

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Admin Control Panel</h1>
        <p className="page-subtitle">Manage users, curriculum blueprints, and block sections.</p>
      </div>

      <div className="tab-nav">
        {[
          { key:"users",     label:"👤 Users" },
          { key:"courses",   label:"📘 Courses" },
          { key:"blueprint", label:"🗺 Blueprint" },
          { key:"sections",  label:"🏫 Sections" },
        ].map(t => (
          <button
            key={t.key}
            id={`admin-tab-${t.key}`}
            className={`tab-btn${tab===t.key?" active":""}`}
            onClick={() => setTab(t.key)}
          >{t.label}</button>
        ))}
      </div>

      <div className="tab-content-container">
        {tab === "users"     && <AdminUsers key="users" />}
        {tab === "courses"   && <AdminCourses key="courses" />}
        {tab === "blueprint" && <AdminBlueprint key="blueprint" />}
        {tab === "sections"  && <AdminSections key="sections" />}
      </div>
    </div>
  );
}

window.AdminDashboard = AdminDashboard;
