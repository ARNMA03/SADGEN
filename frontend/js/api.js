// ═══════════════════════════════════════════════
//  api.js — Axios-like fetch wrapper
// ═══════════════════════════════════════════════

const BASE_URL = ""; // Empty for same-origin deployment

window.api = {
  _token: null,

  setToken(token) { this._token = token; },
  clearToken()    { this._token = null; },

  async _request(method, path, body = null) {
    const headers = { "Content-Type": "application/json" };
    if (this._token) headers["Authorization"] = `Bearer ${this._token}`;

    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${path}`, opts);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg = data.detail || `Error ${res.status}: ${res.statusText || "An error occurred"}`;
      throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
    return data;
  },

  get:    (path)         => window.api._request("GET",    path),
  post:   (path, body)   => window.api._request("POST",   path, body),
  put:    (path, body)   => window.api._request("PUT",    path, body),
  delete: (path)         => window.api._request("DELETE", path),

  // ── Auth ──────────────────────────────────
  login: (email, password) =>
    window.api.post("/api/auth/login", { email, password }),

  // ── Admin ─────────────────────────────────
  getUsers:     () => window.api.get("/api/admin/users"),
  getAdminStats: () => window.api.get("/api/admin/stats"),
  createUser:   (u) => window.api.post("/api/admin/users", u),
  updateUser:   (id, u) => window.api.put(`/api/admin/users/${id}`, u),
  deleteUser:   (id) => window.api.delete(`/api/admin/users/${id}`),

  getCourses:   () => window.api.get("/api/admin/courses"),
  createCourse: (c) => window.api.post("/api/admin/courses", c),
  updateCourse: (id, c) => window.api.put(`/api/admin/courses/${id}`, c),
  deleteCourse: (id) => window.api.delete(`/api/admin/courses/${id}`),

  getBlueprints: ()  => window.api.get("/api/admin/blueprints"),
  addBlueprint:  (b) => window.api.post("/api/admin/blueprints", b),
  deleteBlueprint: (id) => window.api.delete(`/api/admin/blueprints/${id}`),

  getAllSections:   () => window.api.get("/api/admin/sections"),
  generateSection: (s) => window.api.post("/api/admin/generate-section", s),
  updateSection: (id, s) => window.api.put(`/api/admin/sections/${id}`, s),
  deleteSection: (id) => window.api.delete(`/api/admin/sections/${id}`),
  assignProfessor: (p) => window.api.post("/api/admin/assign-professor", p),

  // ── Student ───────────────────────────────
  getSections: (program, year) =>
    window.api.get(`/api/sections/${encodeURIComponent(program)}/${year}`),
  enroll:           (section_id) => window.api.post("/api/enroll", { section_id }),
  getStudyLoad:     () => window.api.get("/api/student/load"),
  getEnrollStatus:  () => window.api.get("/api/student/enrollment-status"),

  // ── Professor ─────────────────────────────
  getProfLoad:     () => window.api.get("/api/professor/load"),
  getProfSections: () => window.api.get("/api/professor/sections"),
  getRoster:       (id) => window.api.get(`/api/professor/roster/${id}`),
};
