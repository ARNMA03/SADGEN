// ═══════════════════════════════════════════════
//  ProfessorDashboard.js
// ═══════════════════════════════════════════════

const { useState: useSt_Prof, useEffect: useEf_Prof } = React;

function ProfessorDashboard() {
  const { user } = window.useAuth();
  const [sections, setSections]       = useSt_Prof([]);
  const [selectedSec, setSelectedSec] = useSt_Prof(null);
  const [roster, setRoster]           = useSt_Prof([]);
  const [loadPage, setLoadPage]       = useSt_Prof(true);
  const [loadRoster, setLoadRoster]   = useSt_Prof(false);
  const [load, setLoad]               = useSt_Prof([]);
  const [view, setView]               = useSt_Prof("sections"); // "sections" or "loads"

  useEf_Prof(() => {
    Promise.all([window.api.getProfSections(), window.api.getProfLoad()])
      .then(([secs, ld]) => { setSections(secs); setLoad(ld); })
      .catch(console.error)
      .finally(() => setLoadPage(false));
  }, []);

  const openRoster = async (sec) => {
    setSelectedSec(sec);
    setLoadRoster(true);
    try {
      const r = await window.api.getRoster(sec.id);
      setRoster(r);
    } catch (e) { setRoster([]); }
    finally { setLoadRoster(false); }
  };

  const getCoursesForSection = (sectionId) => {
    return load.filter(l => l.section_id === sectionId).map(l => l.course);
  };

  const exportToCSV = () => {
    if (!selectedSec || roster.length === 0) return;
    
    // Define headers
    const headers = ["#", "Student Name", "Email", "Program", "Year Level"];
    const rows = roster.map((s, i) => [
      i + 1,
      s.name,
      s.email,
      s.program,
      s.year_level
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Roster_${selectedSec.section_name}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loadPage) {
    return (
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"60vh",flexDirection:"column",gap:"1rem"}}>
        <span className="spinner spinner-lg" />
        <p style={{color:"var(--text-secondary)"}}>Loading your portal…</p>
      </div>
    );
  }

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Professor Portal</h1>
        <p className="page-subtitle">Oversee your assigned classes and student rosters.</p>
      </div>

      {/* View Toggle */}
      <div className="tab-nav">
        <button className={`tab-btn ${view === "sections" ? "active" : ""}`} onClick={() => setView("sections")}>
            Assigned Sections
        </button>
        <button className={`tab-btn ${view === "loads" ? "active" : ""}`} onClick={() => setView("loads")}>
            Course Loads
        </button>
      </div>

      {view === "sections" ? (
        <div className="animate-fade-in">
            {/* Consistent Header for Sections */}
            <h2 style={{fontFamily:"var(--font-display)",fontSize:"0.8rem",fontWeight:600,
                        color:"var(--text-secondary)",textTransform:"uppercase",letterSpacing:"0.06em",
                        marginBottom:"2.5rem", paddingTop:"0.5rem"}}>
                Your Sections
            </h2>

            <div style={{display:"grid", gridTemplateColumns: selectedSec ? "350px 1fr" : "1fr", gap:"2rem", alignItems:"start"}}>
                {/* Section List */}
                {sections.length === 0 ? (
                    <div className="empty-state" style={{padding:"2rem"}}>
                        <div className="empty-state-icon">📂</div>
                        <div className="empty-state-title">No sections assigned</div>
                    </div>
                ) : (
                    <div style={{display:"flex",flexDirection:"column",gap:"1rem", maxHeight:"650px", overflowY:"auto", padding:"0.5rem", paddingRight:"1rem"}}>
                    {sections.map(sec => {
                        const courses = getCoursesForSection(sec.id);
                        return (
                            <button
                            key={sec.id}
                            onClick={() => openRoster(sec)}
                            className="glass-card"
                            style={{
                                border: selectedSec?.id === sec.id
                                ? "1px solid var(--accent-blue)"
                                : "1px solid var(--border-glass)",
                                background: selectedSec?.id === sec.id
                                ? "rgba(59,130,246,0.1)"
                                : "var(--bg-glass)",
                                textAlign:"left",cursor:"pointer",
                                padding:"1.5rem",
                                transition:"all 200ms",
                                width:"100%",
                                flexShrink: 0
                            }}
                            >
                            <div style={{fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1.1rem", marginBottom:"0.8rem"}}>
                                {sec.section_name}
                            </div>
                            
                            <div style={{display:"flex", flexWrap:"wrap", gap:"0.4rem", marginBottom:"0.8rem"}}>
                                {courses.map(c => (
                                    <span key={c.id} className="badge badge-blue" style={{fontSize:"0.7rem", padding:"0.25rem 0.6rem"}}>
                                        {c.course_code}
                                    </span>
                                ))}
                            </div>

                            <div style={{display:"flex",gap:"0.5rem", marginTop:"0.5rem"}}>
                                <span className="badge badge-violet" style={{opacity:0.8, fontSize:"0.65rem"}}>Yr {sec.year_level}</span>
                                <span className="badge badge-blue" style={{opacity:0.8, fontSize:"0.65rem"}}>{sec.program}</span>
                            </div>
                            </button>
                        );
                    })}
                    </div>
                )}

                {/* Roster Panel */}
                {selectedSec ? (
                <div className="animate-slide-up">
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.5rem"}}>
                    <div>
                        <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.3rem", fontWeight:700}}>
                            {selectedSec.section_name} Roster
                        </h2>
                        <div style={{display:"flex", flexWrap:"wrap", gap:"0.5rem", marginTop:"0.6rem"}}>
                            {getCoursesForSection(selectedSec.id).map(c => (
                                <span key={c.id} className="badge badge-violet" style={{fontSize:"0.75rem"}}>
                                    {c.course_name}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div style={{textAlign:"right", display:"flex", alignItems:"center", gap:"1.5rem"}}>
                        <button className="btn btn-ghost btn-sm" onClick={exportToCSV} disabled={roster.length === 0}>
                            💾 Download CSV
                        </button>
                        <div>
                            <div style={{fontSize:"1.8rem", fontWeight:800, color:"var(--text-primary)"}}>{roster.length}</div>
                            <div style={{fontSize:"0.7rem", textTransform:"uppercase", color:"var(--text-muted)"}}>Enrolled</div>
                        </div>
                    </div>
                    </div>
                    <RosterGrid students={roster} loading={loadRoster} />
                </div>
                ) : (
                    <div className="glass-card text-center" style={{padding:"6rem 2rem", opacity:0.6}}>
                        <div style={{fontSize:"3.5rem", marginBottom:"1.5rem"}}>👥</div>
                        <p style={{fontSize:"1.1rem"}}>Select a section on the left to view the student roster.</p>
                    </div>
                )}
            </div>
        </div>
      ) : (
        <div className="animate-fade-in">
            <h2 style={{fontFamily:"var(--font-display)",fontSize:"0.8rem",fontWeight:600,
                        color:"var(--text-secondary)",textTransform:"uppercase",letterSpacing:"0.06em",
                        marginBottom:"1.5rem"}}>
                Your Course Loads
            </h2>
            <div className="data-table-wrap" style={{display:"flex", flexDirection:"column"}}>
                {/* Standalone Header */}
                <div style={{background:"#1e293b", borderRadius:"var(--radius-lg) var(--radius-lg) 0 0", borderBottom:"1px solid var(--border-glass)"}}>
                    <table className="data-table" style={{tableLayout:"fixed", marginBottom:0}}>
                        <thead>
                            <tr>
                                <th style={{width:"60px"}}>#</th>
                                <th>Course Name</th>
                                <th style={{width:"120px"}}>Code</th>
                                <th style={{width:"150px"}}>Section</th>
                                <th style={{width:"180px"}}>Program</th>
                            </tr>
                        </thead>
                    </table>
                </div>
                {/* Scrollable Body */}
                <div style={{maxHeight:"500px", overflowY:"auto", borderRadius:"0 0 var(--radius-lg) var(--radius-lg)"}}>
                    <table className="data-table" style={{tableLayout:"fixed", marginTop:0}}>
                        <tbody>
                            {load.map((item, idx) => (
                                <tr key={item.id}>
                                    <td style={{width:"60px", color:"var(--text-muted)"}}>{idx + 1}</td>
                                    <td style={{fontWeight:600}}>{item.course.course_name}</td>
                                    <td style={{width:"120px"}}><span className="badge badge-blue">{item.course.course_code}</span></td>
                                    <td style={{width:"150px", fontWeight:500}}>{item.section_name}</td>
                                    <td style={{width:"180px"}}><span className="badge badge-violet">{item.program} Yr {item.year_level}</span></td>
                                </tr>
                            ))}
                            {load.length === 0 && (
                                <tr><td colSpan="5" style={{textAlign:"center", padding:"3rem", color:"var(--text-muted)"}}>No course loads assigned.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

window.ProfessorDashboard = ProfessorDashboard;
