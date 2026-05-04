// ═══════════════════════════════════════════════
//  SectionCard.js
// ═══════════════════════════════════════════════

function SectionCard({ section, onPreview, isEnrolled, onEnroll, enrolling }) {
  const courseCount = section.section_courses ? section.section_courses.length : 0;
  const profSet = new Set(
    (section.section_courses || [])
      .filter(sc => sc.professor)
      .map(sc => sc.professor.name)
  );

  return (
    <div className={`glass-card animate-slide-up ${isEnrolled ? "enrolled-glow" : ""}`}
         style={{cursor:"default", display:"flex", flexDirection:"column", justifyContent:"space-between"}}>
      <div>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:"0.5rem"}}>
          <h3 style={{fontFamily:"var(--font-display)", fontSize:"1.2rem", fontWeight:700}}>
            {section.section_name}
          </h3>
          <div style={{display:"flex", gap:"0.4rem"}}>
            {section.enrolled_count >= section.slot_limit && !isEnrolled && (
              <span className="badge badge-rose">Full</span>
            )}
            {isEnrolled && <span className="badge badge-green">✓ Enrolled</span>}
          </div>
        </div>

        <div className="section-card-badge-row">
          <span className="badge badge-blue">{section.program}</span>
          <span className="badge badge-violet">Year {section.year_level}</span>
        </div>

        <div style={{marginTop:"1.25rem", display:"flex", flexDirection:"column", gap:"0.75rem"}}>
          <div style={{display:"flex", flexDirection:"column", gap:"0.35rem"}}>
            <div style={{display:"flex", justifyContent:"space-between", fontSize:"0.75rem", fontWeight:600, color:"var(--text-secondary)"}}>
                <span>👥 Slot Capacity</span>
                <span style={{color: section.enrolled_count >= section.slot_limit ? "var(--accent-rose)" : "var(--text-accent)"}}>
                    {section.enrolled_count} / {section.slot_limit}
                </span>
            </div>
            <div style={{height:"6px", background:"rgba(255,255,255,0.05)", borderRadius:"10px", overflow:"hidden", border:"1px solid var(--border-glass)"}}>
                <div style={{
                    height:"100%", 
                    width:`${Math.min(100, (section.enrolled_count / section.slot_limit) * 100)}%`,
                    background: section.enrolled_count >= section.slot_limit ? "var(--accent-rose)" : "var(--gradient-primary)",
                    boxShadow: section.enrolled_count >= section.slot_limit ? "0 0 10px rgba(244,63,94,0.4)" : "0 0 10px rgba(59,130,246,0.4)",
                    transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
                }} />
            </div>
          </div>

          <div style={{fontSize:"0.82rem", color:"var(--text-secondary)", display:"flex", alignItems:"center", gap:"0.5rem"}}>
            📚 <span style={{color:"var(--text-primary)", fontWeight:500}}>{courseCount} subjects</span> bundled
          </div>
          
          {profSet.size > 0 && (
            <div style={{fontSize:"0.82rem", color:"var(--text-secondary)", display:"flex", alignItems:"center", gap:"0.5rem"}}>
              👩‍🏫 <span style={{color:"var(--text-primary)", fontWeight:500}}>
                {Array.from(profSet).slice(0,2).join(", ")}{profSet.size > 2 ? ` +${profSet.size-2}` : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="section-card-footer" style={{marginTop:"1.5rem", paddingTop:"1rem", borderTop:"1px solid var(--border-glass)"}}>
        <span className="section-card-count" style={{fontSize:"0.75rem", opacity:0.7}}>{courseCount} courses</span>
        <div style={{display:"flex", gap:"0.5rem"}}>
          <button className="btn btn-ghost btn-sm" onClick={() => onPreview(section)}>
            Preview
          </button>
          {!isEnrolled && onEnroll && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onEnroll(section.id)}
              disabled={enrolling || section.enrolled_count >= section.slot_limit}
            >
              {enrolling ? <span className="spinner" style={{width:14,height:14,borderWidth:2}} /> : (section.enrolled_count >= section.slot_limit ? "Full" : "Enroll")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

window.SectionCard = SectionCard;
