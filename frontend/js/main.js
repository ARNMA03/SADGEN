// ═══════════════════════════════════════════════
//  main.js — Mount point
// ═══════════════════════════════════════════════

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
