// ═══════════════════════════════════════════════
//  StudentDashboard.js
// ═══════════════════════════════════════════════

const { useState: useSt_Stu, useEffect: useEf_Stu } = React;

function StudentDashboard() {
  const { user } = window.useAuth();
  const [sections, setSections]         = useSt_Stu([]);
  const [studyLoad, setStudyLoad]       = useSt_Stu([]);
  const [enrollStatus, setEnrollStatus] = useSt_Stu(null);
  const [previewSection, setPreviewSection] = useSt_Stu(null);
  const [enrolling, setEnrolling]       = useSt_Stu(false);
  const [loadingPage, setLoadingPage]   = useSt_Stu(true);
  const [toast, setToast]               = useSt_Stu(null);
  const [showWelcome, setShowWelcome]   = useSt_Stu(true);

  const showToast = (msg, type="success") => {
    setToast({msg, type});
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoadingPage(true);
    try {
      const [secs, status] = await Promise.all([
        window.api.getSections(user.program, user.year_level),
        window.api.getEnrollStatus(),
      ]);
      setSections(secs);
      setEnrollStatus(status);
      if (status.enrolled) {
        const load = await window.api.getStudyLoad();
        setStudyLoad(load);
      }
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoadingPage(false);
    }
  };

  useEf_Stu(() => { loadData(); }, []);

  const handleEnroll = async (sectionId) => {
    setEnrolling(true);
    try {
      await window.api.enroll(sectionId);
      setPreviewSection(null);
      showToast("🎉 Enrollment successful! Your study load is ready.", "success");
      await loadData();
    } catch (e) {
      // Close the modal on error so the toast notification is clearly visible 
      // and not blocked by the modal overlay
      setPreviewSection(null); 
      showToast(e.message, "error");
    } finally {
      setEnrolling(false);
    }
  };

  if (loadingPage) {
    return (
      <div style={{display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"60vh", gap:"1rem"}}>
        <span className="spinner spinner-lg" />
        <p style={{color:"var(--text-secondary)"}}>Loading your portal…</p>
      </div>
    );
  }

  return (
    <div className="page animate-fade-in">
      {toast && (
        <div className={`status-banner ${toast.type}`} style={{marginBottom:"1.5rem"}}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Student Portal</h1>
        <p className="page-subtitle">
          {user.program} · Year {user.year_level} · {enrollStatus?.enrolled ? "Enrolled" : "Cleared to Enroll"}
        </p>
      </div>

      {/* Enrollment Status Banner */}
      {!enrollStatus?.enrolled && showWelcome && (
        <div className="status-banner inline info" style={{marginBottom:"2rem", justifyContent:"space-between"}}>
          <div style={{display:"flex", alignItems:"center", gap:"0.75rem"}}>
            ✅ You are <strong>Cleared to Enroll</strong>. Browse sections below and click a block to confirm.
          </div>
          <button className="btn btn-ghost btn-sm" style={{border:"none", background:"transparent", padding:"0.2rem", fontSize:"1rem"}} onClick={() => setShowWelcome(false)}>&times;</button>
        </div>
      )}

      {/* Study Load — shown when enrolled */}
      {enrollStatus?.enrolled && studyLoad.length > 0 && (
        <div className="study-load-wrap animate-slide-up" style={{marginBottom:"2.5rem"}}>
          <div className="study-load-header">
            <div style={{display:"flex", alignItems:"center", gap:"0.75rem", justifyContent:"space-between"}}>
              <div>
                <h2 style={{fontFamily:"var(--font-display)", fontSize:"1.25rem", color:"var(--text-primary)"}}>
                  📚 Your Study Load
                </h2>
                <p style={{color:"var(--text-secondary)", fontSize:"0.85rem", marginTop:"0.2rem"}}>
                  Section: <strong style={{color:"var(--accent-emerald)"}}>{enrollStatus.section}</strong> · {studyLoad.length} subjects
                </p>
              </div>
              <span className="badge badge-green">✓ Enrolled</span>
            </div>
          </div>
          <div className="data-table-wrap" style={{border:"none", borderRadius:0}}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Course Name</th>
                  <th>Instructor</th>
                </tr>
              </thead>
              <tbody>
                {studyLoad.map((item, i) => (
                  <tr key={i}>
                    <td><span className="badge badge-blue">{item.course_code}</span></td>
                    <td style={{fontWeight:500}}>{item.course_name}</td>
                    <td style={{color:"var(--text-secondary)"}}>{item.professor_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Available Sections */}
      <h2 style={{fontFamily:"var(--font-display)", fontSize:"1.1rem", fontWeight:600,
                  color:"var(--text-secondary)", marginBottom:"1rem", textTransform:"uppercase",
                  letterSpacing:"0.06em", fontSize:"0.8rem"}}>
        Available Block Sections for {user.program} · Year {user.year_level}
      </h2>

      {sections.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-title">No sections found</div>
          <div className="empty-state-desc">No block sections have been set up for your program and year yet. Contact your Admin.</div>
        </div>
      ) : (
        <div className="section-grid">
          {sections.map(sec => (
            <SectionCard
              key={sec.id}
              section={sec}
              onPreview={setPreviewSection}
              isEnrolled={enrollStatus?.enrolled && enrollStatus.section_id === sec.id}
              onEnroll={enrollStatus?.enrolled ? null : handleEnroll}
              enrolling={enrolling}
            />
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewSection && (
        <SectionModal
          section={previewSection}
          onClose={() => setPreviewSection(null)}
          onEnroll={enrollStatus?.enrolled ? null : handleEnroll}
          isEnrolled={enrollStatus?.enrolled && enrollStatus.section_id === previewSection.id}
          enrolling={enrolling}
        />
      )}
    </div>
  );
}

window.StudentDashboard = StudentDashboard;
