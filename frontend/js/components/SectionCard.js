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
          {isEnrolled && <span className="badge badge-green">✓ Enrolled</span>}
        </div>

        <div className="section-card-badge-row">
          <span className="badge badge-blue">{section.program}</span>
          <span className="badge badge-violet">Year {section.year_level}</span>
        </div>

        <div style={{marginTop:"0.85rem", display:"flex", flexDirection:"column", gap:"0.3rem"}}>
          <div style={{fontSize:"0.82rem", color:"var(--text-secondary)"}}>
            📚 <strong style={{color:"var(--text-primary)"}}>{courseCount}</strong> subjects bundled
          </div>
          {profSet.size > 0 && (
            <div style={{fontSize:"0.82rem", color:"var(--text-secondary)"}}>
              👩‍🏫 {Array.from(profSet).slice(0,2).join(", ")}{profSet.size > 2 ? ` +${profSet.size-2}` : ""}
            </div>
          )}
        </div>
      </div>

      <div className="section-card-footer">
        <span className="section-card-count">{courseCount} courses</span>
        <div style={{display:"flex", gap:"0.5rem"}}>
          <button className="btn btn-ghost btn-sm" onClick={() => onPreview(section)}>
            Preview
          </button>
          {!isEnrolled && onEnroll && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onEnroll(section.id)}
              disabled={enrolling}
            >
              {enrolling ? <span className="spinner" style={{width:14,height:14,borderWidth:2}} /> : "Enroll"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

window.SectionCard = SectionCard;
