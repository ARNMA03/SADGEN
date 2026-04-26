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
    <div className="data-table-wrap animate-fade-in">
      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Student Name</th>
            <th>Email</th>
            <th>Program</th>
            <th>Year</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, idx) => (
            <tr key={s.student_id}>
              <td style={{color:"var(--text-muted)", fontWeight:500}}>{idx + 1}</td>
              <td>
                <div style={{display:"flex", alignItems:"center", gap:"0.6rem"}}>
                  <div style={{
                    width:30, height:30, borderRadius:"50%",
                    background:"var(--gradient-primary)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:"0.7rem", fontWeight:700, flexShrink:0
                  }}>
                    {s.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
                  </div>
                  <span style={{fontWeight:500}}>{s.name}</span>
                </div>
              </td>
              <td style={{color:"var(--text-secondary)"}}>{s.email}</td>
              <td><span className="badge badge-blue">{s.program || "—"}</span></td>
              <td style={{color:"var(--text-secondary)"}}>
                {s.year_level ? `Year ${s.year_level}` : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

window.RosterGrid = RosterGrid;
