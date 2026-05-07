# Sadgen Enrollment Portal

> **HCI2 Prototype** — Automated Block Enrollment System
> Stack: PostgreSQL · FastAPI · React (CDN, no build step)

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Python | 3.10+ | [python.org](https://python.org) |
| PostgreSQL | 14+ | [postgresql.org](https://www.postgresql.org) |
| Node.js | _Not required_ | Frontend runs via CDN |

## 🚀 Deployment (Docker)

The system is now fully containerized. To deploy the entire stack (Database, Backend, and Frontend):

1. **Install Docker** and **Docker Compose**.
2. Run the following command in the root directory:
   ```bash
   docker-compose up --build
   ```
3. The system will be available at:
   - **Frontend & API:** [http://localhost:8000](http://localhost:8000)
   - **API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

The database will be automatically created and seeded on the first run.

---

## 🛠 Manual Setup (Local Development)

### 1. Initial Setup
To set up the project on a new Windows machine, run the setup script in the root directory. This will create a virtual environment, upgrade pip, and install all dependencies automatically.

```bash
setup.bat
```

### 2. Start the Backend
Once setup is complete, you can start the FastAPI server using the start script in the root directory:

```bash
start.bat
```

---

## 📚 Documentation & Diagrams

For in-depth technical details and system logic, please refer to:
- **[System Documentation](./DOCUMENTATION.md)**: Features, architecture, and module breakdown.
- **[System Diagrams](./diagrams.md)**: Context, Architecture, and DFD (Levels 1-3).

> **Note:** The first time you run the backend locally, you may want to seed the database with demo data. After activating your environment, run:
> `python seed.py`

API will be live at: **http://localhost:8000**  
Interactive Swagger docs: **http://localhost:8000/docs**

---

## 🌐 Deployment (Render)

This project is optimized for deployment on **Render**.

### Project Structure
The backend is now self-contained for easier deployment:
- `backend/main.py`: Entry point
- `backend/routers/`: API route logic
- `backend/requirements.txt`: Python dependencies

### Render Configuration
1. **Build Command:** `pip install -r backend/requirements.txt`
2. **Start Command:** `cd backend && python seed.py && uvicorn main:app --host 0.0.0.0 --port $PORT`
3. **Environment Variables:**
   - `PYTHON_VERSION`: `3.12.3` (Required for pre-built wheel compatibility)
   - `CARGO_HOME`: `/opt/render/project/src/.cargo` (Writable path for Rust builds)
   - `DATABASE_URL`: Your Render PostgreSQL connection string.

---

## 3. Open the Frontend

Simply open **`frontend/index.html`** in any modern browser.

> Because the frontend makes API calls to `localhost:8000`, open it via a local server or directly from file. Chrome may block local file fetches — use Firefox or serve via Python:
> ```bash
> cd frontend
> python -m http.server 3000
> # then open http://localhost:3000
> ```

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
