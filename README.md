# Efficio Enrollment Portal

> **HCI2 Prototype** — Automated Block Enrollment System
> Stack: PostgreSQL · FastAPI · React (CDN, no build step)

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Python | 3.10+ | [python.org](https://python.org) |
| PostgreSQL | 14+ | [postgresql.org](https://www.postgresql.org) |
| Node.js | _Not required_ | Frontend runs via CDN |

---

## 1. Database Setup (PostgreSQL)

Open **pgAdmin** or `psql` and run:

```sql
CREATE DATABASE efficio_db;
```

Default connection used: `postgresql://postgres:postgres@localhost:5432/efficio_db`

To use different credentials, edit `backend/config.py` or create `backend/.env`:
```env
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASS@localhost:5432/efficio_db
```

---

## 2. Start the Backend

Double-click **`backend/start.bat`** (Windows), or run manually:

```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
pip install -r requirements.txt
python seed.py              # Seeds demo data
uvicorn main:app --reload --port 8000
```

API will be live at: **http://localhost:8000**  
Interactive Swagger docs: **http://localhost:8000/docs**

---

## 3. Open the Frontend

Simply open **`frontend/index.html`** in any modern browser.

> ⚠️ Because the frontend makes API calls to `localhost:8000`, open it via a local server or directly from file. Chrome may block local file fetches — use Firefox or serve via Python:
> ```bash
> cd frontend
> python -m http.server 3000
> # then open http://localhost:3000
> ```

---

## Demo Credentials

| Role | Email | Password | Profile |
|---|---|---|---|
| Admin | admin@efficio.edu | admin123 | — |
| Professor | reyes@efficio.edu | prof123 | — |
| Professor | santos@efficio.edu | prof123 | — |
| Student | juan@efficio.edu | student123 | BSCS · Year 2 |
| Student | maria@efficio.edu | student123 | BSCS · Year 2 |
| Student | pedro@efficio.edu | student123 | BSIT · Year 1 |

---

## Seeded Data

- **8 Courses**: HCI2, DSA, DBMS, OOP, DISMATH, INPROG, COMPORG, WEBDEV
- **Blueprints**: BSCS Year 2 (5 courses), BSIT Year 1 (4 courses)
- **Sections**: BSCS-2A, BSCS-2B (professors assigned), BSIT-1A

---

## API Reference (key endpoints)

| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/auth/login` | Public |
| GET | `/api/admin/users` | Admin |
| POST | `/api/admin/users` | Admin |
| POST | `/api/admin/blueprints` | Admin |
| POST | `/api/admin/generate-section` | Admin |
| POST | `/api/admin/assign-professor` | Admin |
| GET | `/api/sections/{program}/{year}` | Any |
| POST | `/api/enroll` | Student |
| GET | `/api/student/load` | Student |
| GET | `/api/professor/sections` | Professor |
| GET | `/api/professor/roster/{section_id}` | Professor |

Full docs at `/docs` (Swagger UI) after starting the backend.
