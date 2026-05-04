// ═══════════════════════════════════════════════
//  RosterGrid.js — Student roster data table
// ═══════════════════════════════════════════════

function RosterGrid({ students, loading }) {
  if (loading) {
    return (
      <div style={{textAlign:"center", padding:"3rem"}}>
        <span className="spinner spinner-lg" />
        <p style={{color:"var(--text-secondary)", marginTop:"1rem"}}>Loading roster…</p>
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📋</div>
        <div className="empty-state-title">No students enrolled yet</div>
        <div className="empty-state-desc">Students who enroll in this section will appear here.</div>
      </div>
    );
  }

  return (
    <div className="data-table-wrap animate-fade-in" style={{display:"flex", flexDirection:"column"}}>
      {/* Standalone Header */}
      <div style={{background:"#1e293b", borderRadius:"var(--radius-lg) var(--radius-lg) 0 0", borderBottom:"1px solid var(--border-glass)"}}>
        <table className="data-table" style={{tableLayout:"fixed", marginBottom:0}}>
          <thead>
            <tr>
              <th style={{width:"60px"}}>#</th>
              <th>Student Name</th>
              <th style={{width:"250px"}}>Email</th>
              <th style={{width:"120px"}}>Program</th>
              <th style={{width:"100px"}}>Year</th>
            </tr>
          </thead>
        </table>
      </div>
      
      {/* Scrollable Body */}
      <div style={{maxHeight:"450px", overflowY:"auto", borderRadius:"0 0 var(--radius-lg) var(--radius-lg)"}}>
        <table className="data-table" style={{tableLayout:"fixed", marginTop:0}}>
          <tbody>
            {students.map((s, idx) => (
              <tr key={s.student_id}>
                <td style={{width:"60px", color:"var(--text-muted)", fontWeight:500}}>{idx + 1}</td>
                <td>
                  <div style={{display:"flex", alignItems:"center", gap:"0.6rem"}}>
                    <div style={{
                      width:28, height:28, borderRadius:"50%",
                      background:"var(--gradient-primary)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:"0.65rem", fontWeight:700, flexShrink:0
                    }}>
                      {s.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
                    </div>
                    <span style={{fontWeight:500}}>{s.name}</span>
                  </div>
                </td>
                <td style={{width:"250px", color:"var(--text-secondary)", fontSize:"0.8rem"}}>{s.email}</td>
                <td style={{width:"120px"}}><span className="badge badge-blue" style={{fontSize:"0.7rem"}}>{s.program || "—"}</span></td>
                <td style={{width:"100px", color:"var(--text-secondary)"}}>
                  {s.year_level ? `Yr ${s.year_level}` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

window.RosterGrid = RosterGrid;
