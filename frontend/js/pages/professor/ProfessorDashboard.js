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
        <p className="page-subtitle">Read-only view of your assigned sections and student rosters.</p>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-card-value" style={{background:"var(--gradient-primary)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            {sections.length}
          </div>
          <div className="stat-card-label">Assigned Sections</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{background:"var(--gradient-success)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            {load.length}
          </div>
          <div className="stat-card-label">Course Loads</div>
        </div>
      </div>

      <div style={{display:"grid", gridTemplateColumns: selectedSec ? "320px 1fr" : "1fr", gap:"1.5rem", alignItems:"start"}}>
        {/* Section List */}
        <div>
          <h2 style={{fontFamily:"var(--font-display)",fontSize:"0.8rem",fontWeight:600,
                      color:"var(--text-secondary)",textTransform:"uppercase",letterSpacing:"0.06em",
                      marginBottom:"0.85rem"}}>
            Your Sections
          </h2>

          {sections.length === 0 ? (
            <div className="empty-state" style={{padding:"2rem"}}>
              <div className="empty-state-icon">📂</div>
              <div className="empty-state-title">No sections assigned</div>
            </div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:"0.6rem"}}>
              {sections.map(sec => (
                <button
                  key={sec.id}
                  onClick={() => openRoster(sec)}
                  className="glass-card"
                  id={`section-btn-${sec.id}`}
                  style={{
                    border: selectedSec?.id === sec.id
                      ? "1px solid rgba(59,130,246,0.5)"
                      : undefined,
                    background: selectedSec?.id === sec.id
                      ? "rgba(59,130,246,0.08)"
                      : undefined,
                    textAlign:"left",cursor:"pointer",
                    padding:"1rem 1.25rem",
                    transition:"all 200ms"
                  }}
                >
                  <div style={{fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1rem"}}>
                    {sec.section_name}
                  </div>
                  <div style={{display:"flex",gap:"0.4rem",marginTop:"0.4rem"}}>
                    <span className="badge badge-blue">{sec.program}</span>
                    <span className="badge badge-violet">Yr {sec.year_level}</span>
                  </div>
                  <div style={{fontSize:"0.78rem",color:"var(--text-muted)",marginTop:"0.4rem"}}>
                    {(sec.section_courses||[]).length} courses · click to view roster
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Roster Panel */}
        {selectedSec && (
          <div className="animate-slide-up">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.85rem"}}>
              <h2 style={{fontFamily:"var(--font-display)",fontSize:"0.8rem",fontWeight:600,
                          color:"var(--text-secondary)",textTransform:"uppercase",letterSpacing:"0.06em"}}>
                Class Roster — {selectedSec.section_name}
              </h2>
              <span style={{fontSize:"0.8rem",color:"var(--text-muted)"}}>
                {roster.length} student{roster.length !== 1 ? "s" : ""}
              </span>
            </div>
            <RosterGrid students={roster} loading={loadRoster} />
          </div>
        )}
      </div>
    </div>
  );
}

window.ProfessorDashboard = ProfessorDashboard;
