// ═══════════════════════════════════════════════
//  SectionModal.js — Preview modal for a section
// ═══════════════════════════════════════════════

function SectionModal({ section, onClose, onEnroll, isEnrolled, enrolling }) {
  if (!section) return null;

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <div>
            <h2 style={{fontFamily:"var(--font-display)", fontSize:"1.35rem"}}>
              {section.section_name}
            </h2>
          <div style={{display:"flex", gap:"0.5rem", marginTop:"0.5rem", alignItems:"center"}}>
              <span className="badge badge-blue">{section.program}</span>
              <span className="badge badge-violet">Year {section.year_level}</span>
              {section.enrolled_count >= section.slot_limit && !isEnrolled && (
                <span className="badge badge-rose">Full</span>
              )}
              {isEnrolled && <span className="badge badge-green">✓ Enrolled</span>}
              <span style={{fontSize:"0.75rem", color:"var(--text-muted)", marginLeft:"0.5rem"}}>
                ({section.enrolled_count} / {section.slot_limit} slots)
              </span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <p style={{color:"var(--text-secondary)", fontSize:"0.875rem", marginBottom:"0.5rem"}}>
            Bundled courses in this block section:
          </p>

          <div className="course-list">
            {(section.section_courses || []).map(sc => (
              <div key={sc.id} className="course-item">
                <div>
                  <div className="course-item-name">{sc.course.course_name}</div>
                  <div className="course-item-code">{sc.course.course_code}</div>
                </div>
                <div className="course-item-prof">
                  {sc.professor ? `👩‍🏫 ${sc.professor.name}` : "👩‍🏫 TBA"}
                </div>
              </div>
            ))}
          </div>

          {(section.section_courses || []).length === 0 && (
            <p style={{color:"var(--text-muted)", textAlign:"center", padding:"2rem"}}>
              No courses assigned yet.
            </p>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          {!isEnrolled && onEnroll && (
            <button
              className={section.enrolled_count >= section.slot_limit ? "btn btn-ghost" : "btn btn-success"}
              onClick={() => onEnroll(section.id)}
              disabled={enrolling || section.enrolled_count >= section.slot_limit}
              id={`enroll-btn-${section.id}`}
            >
              {enrolling
                ? <><span className="spinner" style={{width:16,height:16,borderWidth:2}} /> Enrolling…</>
                : (section.enrolled_count >= section.slot_limit ? "Section Full" : "✓ Confirm Enrollment")
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

window.SectionModal = SectionModal;
