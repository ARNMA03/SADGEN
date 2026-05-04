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
    <div className="animate-fade-in" style={{animation:"fadeSlideUp 0.6s ease-out"}}>
      <div className="glass-card text-center" style={{padding:"4rem 2rem", marginBottom:"2rem"}}>
        <h2 style={{fontFamily:"var(--font-display)", fontSize:"3rem", marginBottom:"1rem", background:"var(--gradient-primary)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>Welcome, Admin</h2>
        <p style={{color:"var(--text-secondary)", fontSize:"1.1rem", maxWidth:"600px", margin:"0 auto", lineHeight:1.8}}>
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
function UserEditModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({ ...user, password: "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      await window.api.updateUser(user.id, payload);
      onSave();
    } catch(e) { alert(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit User: {user.name}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body login-form">
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
          </div>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input className="input" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
          </div>
          <div className="input-group">
            <label className="input-label">New Password (leave blank to keep current)</label>
            <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Role</label>
            <select className="select" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
              <option>Admin</option><option>Student</option><option>Professor</option>
            </select>
          </div>
          {form.role === "Student" && (
            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Program</label>
                <input className="input" value={form.program || ""} onChange={e=>setForm({...form,program:e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Year Level</label>
                <select className="select" value={form.year_level || ""} onChange={e=>setForm({...form,year_level:e.target.value})}>
                  <option value="">Select year</option>
                  {[1,2,3,4].map(y=><option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          )}
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

/* ── Course Edit Modal ── */
function CourseEditModal({ course, onClose, onSave }) {
  const [form, setForm] = useState({ ...course });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await window.api.updateCourse(course.id, form);
      onSave();
    } catch(e) { alert(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Course</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body login-form">
          <div className="input-group">
            <label className="input-label">Course Name</label>
            <input className="input" value={form.course_name} onChange={e=>setForm({...form,course_name:e.target.value})} required />
          </div>
          <div className="input-group">
            <label className="input-label">Course Code</label>
            <input className="input" value={form.course_code} onChange={e=>setForm({...form,course_code:e.target.value})} required />
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

/* ── Users Tab ── */
function AdminUsers() {
  const [users, setUsers]       = useState([]);
  const [blueprints, setBlueprints] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [form, setForm]         = useState({ name:"", email_prefix:"", password:"", role:"Student", program:"", year_level:"" });
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState(null);
  const [roleFilter, setRoleFilter] = useState("All");
  const [editUser, setEditUser] = useState(null);

  const showToast = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3500); };
  
  const load = () => {
    Promise.all([window.api.getUsers(), window.api.getBlueprints()])
      .then(([u, b]) => {
        setUsers(u);
        setBlueprints(b);
        const programs = [...new Set(b.map(bp => bp.program))];
        if (programs.length > 0 && !form.program) {
            setForm(prev => ({...prev, program: programs[0]}));
        }
      })
      .catch(e => showToast(e.message, "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (form.email_prefix.includes("@")) {
        showToast("Username should not contain '@'. The domain is automatically added.", "error");
        return;
    }
    setSaving(true);
    try {
      const body = {
        name: form.name, 
        email: `${form.email_prefix}@sadgen.edu.ph`, 
        password: form.password, 
        role: form.role,
        program: form.role === "Student" ? form.program : null,
        year_level: form.role === "Student" && form.year_level ? parseInt(form.year_level) : null,
      };
      await window.api.createUser(body);
      showToast("User created successfully.");
      setForm({ name:"", email_prefix:"", password:"", role:"Student", program:"", year_level:"" });
      load();
    } catch(e) { showToast(e.message, "error"); }
    finally { setSaving(false); }
  };

  const handleRemove = async (id) => {
    if (!confirm("Remove this user? This action cannot be undone.")) return;
    try { await window.api.deleteUser(id); showToast("User removed."); load(); }
    catch(e) { showToast(e.message, "error"); }
  };

  const roleBadge = { Admin:"badge-violet", Student:"badge-blue", Professor:"badge-amber" };

  const filteredUsers = roleFilter === "All" ? users : users.filter(u => u.role === roleFilter);

  return (
    <div className="animate-fade-in">
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
              <label className="input-label">Email Address</label>
              <div style={{display:"flex", alignItems:"center"}}>
                <input 
                  className="input" 
                  style={{flex:1, borderRight:"none", borderRadius:"var(--radius-md) 0 0 var(--radius-md)"}} 
                  placeholder="e.g. j.delacruz" 
                  value={form.email_prefix}
                  onChange={e => {
                    const val = e.target.value.split("@")[0]; // Auto-strip anything after @
                    setForm({...form, email_prefix: val});
                  }} 
                  required 
                />
                <span style={{
                  background:"rgba(255,255,255,0.1)", 
                  padding:"0 0.85rem", 
                  height:42, 
                  display:"flex", 
                  alignItems:"center", 
                  border:"1px solid var(--border-glass)", 
                  borderLeft:"none", 
                  borderRadius:"0 var(--radius-md) var(--radius-md) 0",
                  fontSize:"0.85rem", 
                  color:"#fff", 
                  whiteSpace:"nowrap",
                  fontWeight:700
                }}>
                  @sadgen.edu.ph
                </span>
              </div>
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
                <label className="input-label">Program</label>
                <select 
                  className="select" 
                  value={form.program} 
                  onChange={e=>setForm({...form,program:e.target.value})} 
                  required
                >
                  <option value="">Select Program</option>
                  {[...new Set(blueprints.map(b => b.program))].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Year Level</label>
                <select className="select" value={form.year_level} onChange={e=>setForm({...form,year_level:e.target.value})} required>
                  <option value="">Select Year</option>
                  {[1,2,3,4].map(y=><option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          )}
          <button id="create-user-btn" type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <><span className="spinner" style={{width:14,height:14,borderWidth:2}}/> Creating…</> : "+ Create Account"}
          </button>
        </form>
      </div>

      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem"}}>
        <h3 style={{fontFamily:"var(--font-display)"}}>User Directory</h3>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium" style={{color:"var(--text-secondary)"}}>Filter by Role:</label>
          <select className="select" style={{width:"150px", padding:"0.4rem"}} value={roleFilter} onChange={e=>setRoleFilter(e.target.value)}>
            <option>All</option><option>Admin</option><option>Student</option><option>Professor</option>
          </select>
        </div>
      </div>

      {loading ? <div style={{textAlign:"center",padding:"2rem"}}><span className="spinner"/></div> : (
        <div className="data-table-wrap" style={{display:"flex", flexDirection:"column"}}>
          {/* Standalone Header */}
          <div style={{background:"#1e293b", borderRadius:"var(--radius-lg) var(--radius-lg) 0 0", borderBottom:"1px solid var(--border-glass)"}}>
            <table className="data-table" style={{tableLayout:"fixed", marginBottom:0}}>
              <thead>
                <tr>
                  <th style={{width:"60px"}}>#</th>
                  <th>Name</th>
                  <th style={{width:"250px"}}>Email</th>
                  <th style={{width:"120px"}}>Role</th>
                  <th style={{width:"120px"}}>Program</th>
                  <th style={{width:"100px"}}>Year</th>
                  <th style={{width:"160px", textAlign:"right"}}>Actions</th>
                </tr>
              </thead>
            </table>
          </div>
          {/* Scrollable Body */}
          <div style={{maxHeight:"450px", overflowY:"auto", borderRadius:"0 0 var(--radius-lg) var(--radius-lg)"}}>
            <table className="data-table" style={{tableLayout:"fixed", marginTop:0}}>
              <tbody>
                {filteredUsers.length === 0 ? <tr><td colSpan="7" style={{textAlign:"center", padding:"3rem", color:"var(--text-muted)"}}>No users found</td></tr> : 
                  filteredUsers.map((u,i)=>(
                  <tr key={u.id}>
                    <td style={{width:"60px", color:"var(--text-muted)"}}>{i+1}</td>
                    <td style={{fontWeight:500}}>{u.name}</td>
                    <td style={{width:"250px", color:"var(--text-secondary)", fontSize:"0.85rem"}}>{u.email}</td>
                    <td style={{width:"120px"}}><span className={`badge ${roleBadge[u.role]||"badge-blue"}`}>{u.role}</span></td>
                    <td style={{width:"120px", color:"var(--text-secondary)"}}>{u.program||"—"}</td>
                    <td style={{width:"100px", color:"var(--text-secondary)"}}>{u.year_level ? `Year ${u.year_level}` : "—"}</td>
                    <td style={{width:"160px", textAlign:"right"}}>
                      <div className="flex gap-1" style={{justifyContent:"flex-end"}}>
                        <button className="btn btn-ghost btn-sm" onClick={()=>setEditUser(u)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={()=>handleRemove(u.id)}>Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editUser && <UserEditModal user={editUser} onClose={()=>setEditUser(null)} onSave={()=>{setEditUser(null); load(); showToast("User updated.");}} />}
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
  const [editCourse, setEditCourse] = useState(null);

  const showToast = (m,t="success")=>{ setToast({msg:m,type:t}); setTimeout(()=>setToast(null),3500); };
  
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
      await window.api.createCourse(form);
      showToast("Course created.");
      setForm({course_name:"",course_code:""});
      load();
    } catch(e){ showToast(e.message,"error"); } finally { setSaving(false); }
  };

  const handleRemove = async (id) => {
    if (!confirm("Remove this course? This may affect blueprints and sections.")) return;
    try { await window.api.deleteCourse(id); showToast("Course removed."); load(); }
    catch(e) { showToast(e.message, "error"); }
  }

  return (
    <div className="animate-fade-in">
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

      <h3 style={{marginBottom:"1rem",fontFamily:"var(--font-display)"}}>Available Courses</h3>

      {loading ? <div style={{textAlign:"center",padding:"2rem"}}><span className="spinner"/></div> : (
        <div className="data-table-wrap" style={{display:"flex", flexDirection:"column"}}>
          {/* Standalone Header */}
          <div style={{background:"#1e293b", borderRadius:"var(--radius-lg) var(--radius-lg) 0 0", borderBottom:"1px solid var(--border-glass)"}}>
            <table className="data-table" style={{tableLayout:"fixed", marginBottom:0}}>
              <thead>
                <tr>
                  <th style={{width:"60px"}}>#</th>
                  <th>Course Name</th>
                  <th style={{width:"120px"}}>Code</th>
                  <th style={{width:"160px", textAlign:"right"}}>Actions</th>
                </tr>
              </thead>
            </table>
          </div>
          {/* Scrollable Body */}
          <div style={{maxHeight:"450px", overflowY:"auto", borderRadius:"0 0 var(--radius-lg) var(--radius-lg)"}}>
            <table className="data-table" style={{tableLayout:"fixed", marginTop:0}}>
              <tbody>
                {courses.length === 0 ? <tr><td colSpan="4" style={{textAlign:"center", padding:"3rem", color:"var(--text-muted)"}}>No courses found</td></tr> : 
                  courses.map((c,i)=>(
                  <tr key={c.id}>
                    <td style={{width:"60px", color:"var(--text-muted)"}}>{i+1}</td>
                    <td style={{fontWeight:500}}>{c.course_name}</td>
                    <td style={{width:"120px"}}><span className="badge badge-blue">{c.course_code}</span></td>
                    <td style={{width:"160px", textAlign:"right"}}>
                      <div className="flex gap-1" style={{justifyContent:"flex-end"}}>
                        <button className="btn btn-ghost btn-sm" onClick={()=>setEditCourse(c)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={()=>handleRemove(c.id)}>Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editCourse && <CourseEditModal course={editCourse} onClose={()=>setEditCourse(null)} onSave={()=>{setEditCourse(null); load(); showToast("Course updated.");}} />}
    </div>
  );
}

/* ── Blueprint Tab ── */
function AdminBlueprint() {
  const [bps, setBps]         = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState({ program:"BSCS", year_level:"2", course_id:"", course_search:"" });
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const showToast = (m,t="success")=>{ 
    let msg = m;
    if (Array.isArray(m)) {
        msg = m.map(e => e.msg).join(", ");
    } else if (typeof m === 'object' && m !== null) {
        msg = m.detail || JSON.stringify(m);
    }
    setToast({msg, type:t}); 
    setTimeout(()=>setToast(null),3500); 
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
      await window.api.addBlueprint({ program:form.program, year_level:parseInt(form.year_level), course_id:parseInt(form.course_id) });
      showToast("Added to blueprint.");
      setForm({...form, course_id:"", course_search:""});
      load();
    } catch(e){ 
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
    catch(e){ showToast(e.message,"error"); }
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
              <div style={{position:"relative"}}>
                <input 
                  type="text"
                  className="input" 
                  placeholder="Type to search course…" 
                  value={form.course_search || ""} 
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        if (!form.course_id) {
                            e.preventDefault();
                            if (filteredCourses.length > 0) {
                                const top = filteredCourses[0];
                                setForm({...form, course_id: top.id, course_search: `${top.course_code} - ${top.course_name}`});
                                setShowDropdown(false);
                            }
                        }
                    }
                  }}
                  onChange={e => {
                    const val = e.target.value;
                    setForm({...form, course_search: val, course_id: ""});
                    setShowDropdown(true);
                  }} 
                  style={{paddingRight:"2.5rem"}}
                />
                {form.course_search && (
                    <button type="button" onClick={() => setForm({...form, course_search:"", course_id:""})}
                            style={{position:"absolute", right:"0.75rem", top:"50%", transform:"translateY(-50%)", 
                                    background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer", fontSize:"1.2rem"}}>&times;</button>
                )}
                {showDropdown && !form.course_id && (
                    <div className="glass-card" style={{position:"absolute", top:"100%", left:0, right:0, zIndex:100, marginTop:"0.25rem", maxHeight:"200px", overflowY:"auto", padding:"0.5rem", boxShadow:"0 10px 25px rgba(0,0,0,0.5)"}}>
                        {filteredCourses.length === 0 ? (
                            <div style={{padding:"0.6rem", color:"var(--text-muted)", textAlign:"center", fontSize:"0.8rem"}}>No matching courses</div>
                        ) : (
                            filteredCourses.map(c => (
                                <div key={c.id} className="dropdown-item" 
                                     style={{padding:"0.6rem", borderRadius:"4px", cursor:"pointer", transition:"background 0.2s"}}
                                     onClick={() => {
                                        setForm({...form, course_id: c.id, course_search: `${c.course_code} - ${c.course_name}`});
                                        setShowDropdown(false);
                                     }}>
                                    <span style={{fontWeight:600}}>{c.course_code}</span> — {c.course_name}
                                </div>
                            ))
                        )}
                    </div>
                )}
              </div>
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
              <div style={{display:"flex", flexDirection:"column", gap:"0.4rem"}}>
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
  const [blueprints, setBlueprints] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [form, setForm]           = useState({ program:"", year_level:"2", slot_limit:40 });
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);

  const showToast = (m,t="success")=>{ setToast({msg:m,type:t}); setTimeout(()=>setToast(null),3500); };

  const load = () => {
    Promise.all([window.api.getAllSections(), window.api.getUsers(), window.api.getBlueprints()])
      .then(([s, u, b]) => {
        setSections(s);
        setProfessors(u.filter(user => user.role === "Professor"));
        setBlueprints(b);
        // Default program to first available if not set
        const programs = [...new Set(b.map(bp => bp.program))];
        if (programs.length > 0 && !form.program) setForm(prev => ({...prev, program: programs[0]}));
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
      await window.api.generateSection({ program:form.program, year_level:parseInt(form.year_level), slot_limit:parseInt(form.slot_limit) });
      showToast(`Section generated from blueprint.`);
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

  const handleRemoveSection = async (id) => {
    if (!confirm("Remove this section? All student enrollments for this section will be lost.")) return;
    try { await window.api.deleteSection(id); showToast("Section removed."); load(); }
    catch(e) { showToast(e.message, "error"); }
  };

  return (
    <div className="animate-fade-in">
      {toast && <div className={`status-banner ${toast.type}`}>{toast.msg}</div>}

      <div className="glass-card" style={{marginBottom:"1.5rem"}}>
        <h3 style={{marginBottom:"0.4rem",fontFamily:"var(--font-display)"}}>Generate Block Section</h3>
        <p style={{fontSize:"0.82rem",color:"var(--text-secondary)",marginBottom:"1rem"}}>
          Automatically populates courses from the Curriculum Blueprint and handles automatic naming.
        </p>
        <form onSubmit={handleGenerate} id="generate-section-form">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr auto",gap:"0.75rem",alignItems:"flex-end"}}>
            <div className="input-group">
              <label className="input-label">Program (from Blueprints)</label>
              <select className="select" value={form.program} onChange={e=>setForm({...form,program:e.target.value})} required>
                <option value="">Select program…</option>
                {programs.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Year</label>
              <select className="select" value={form.year_level} onChange={e=>setForm({...form,year_level:e.target.value})}>
                {[1,2,3,4].map(y=><option key={y}>{y}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Slot Limit</label>
              <input className="input" type="number" min="1" value={form.slot_limit}
                onChange={e=>setForm({...form,slot_limit:e.target.value})} required />
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
          : <div className="section-grid">
              {sections.map(sec=>(
                <div key={sec.id} className="glass-card">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"0.85rem"}}>
                    <div>
                        <h3 style={{fontFamily:"var(--font-display)",fontSize:"1.2rem"}}>{sec.section_name}</h3>
                        <div className="flex gap-1 mt-1">
                            <span className="badge badge-blue">{sec.program}</span>
                            <span className="badge badge-violet">Yr {sec.year_level}</span>
                        </div>
                    </div>
                    <button className="modal-close" style={{fontSize:"1rem"}} onClick={()=>handleRemoveSection(sec.id)}>&times;</button>
                  </div>
                  
                  <div style={{fontSize:"0.8rem", color:"var(--text-secondary)", marginBottom:"1rem", display:"flex", justifyContent:"space-between"}}>
                    <span>Capacity: {sec.slot_limit}</span>
                    <span style={{color: sec.enrolled_count >= sec.slot_limit ? "var(--accent-rose)" : "var(--accent-emerald)"}}>
                        Enrolled: {sec.enrolled_count}
                    </span>
                  </div>

                  <button className="btn btn-ghost btn-sm w-full" style={{marginBottom:"0.5rem"}} onClick={() => setExpandedSection(expandedSection === sec.id ? null : sec.id)}>
                    {expandedSection === sec.id ? "Collapse Courses" : "Expand Courses"}
                  </button>

                  {expandedSection === sec.id && (
                    <div className="animate-slide-up" style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
                        {(sec.section_courses||[]).map(sc=>(
                        <div key={sc.id} style={{padding:"0.6rem", background:"rgba(255,255,255,0.03)", borderRadius:"8px", border:"1px solid var(--border-glass)"}}>
                            <div style={{display:"flex", justifyContent:"space-between", marginBottom:"0.4rem"}}>
                            <span style={{fontWeight:600,fontSize:"0.8rem"}}>{sc.course.course_code}</span>
                            <span style={{fontSize:"0.75rem", color:"var(--text-muted)"}}>{sc.course.course_name}</span>
                            </div>
                            <select
                                className="select"
                                style={{padding:"0.3rem 0.6rem",fontSize:"0.75rem"}}
                                value={sc.professor?.id||""}
                                onChange={e=>handleAssign(sc.id, e.target.value)}
                            >
                                <option value="">— Assign professor —</option>
                                {professors.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
      )}
    </div>
  );
}

/* ── Main Dashboard ── */
function AdminDashboard() {
  const [tab, setTab] = useState("welcome");

  useEffect(() => {
    const handleTabChange = (e) => setTab(e.detail);
    window.addEventListener('changeAdminTab', handleTabChange);
    return () => window.removeEventListener('changeAdminTab', handleTabChange);
  }, []);

  return (
    <div className="page animate-fade-in">
      {tab === "welcome" && (
          <div className="page-header" style={{textAlign:"center", marginBottom:"3rem"}}>
            <h1 className="page-title">Admin Control Panel</h1>
            <p className="page-subtitle">Oversee user accounts, define curricula, and organize block sections.</p>
          </div>
      )}

      <div className="tab-content-container">
        {tab === "welcome"   && <AdminWelcome />}
        {tab === "users"     && <AdminUsers key="users" />}
        {tab === "courses"   && <AdminCourses key="courses" />}
        {tab === "blueprint" && <AdminBlueprint key="blueprint" />}
        {tab === "sections"  && <AdminSections key="sections" />}
      </div>
    </div>
  );
}

window.AdminDashboard = AdminDashboard;
