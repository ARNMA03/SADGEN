# SADGEN Enrollment System Documentation

## 1. Executive Summary
The **SADGEN Enrollment System** is an automated block enrollment portal designed to streamline the registration process for students and administrators. By utilizing a "block-based" approach, students can enroll in a pre-defined set of courses (sections) that correspond to their program and year level, ensuring curriculum compliance and balanced class sizes.

---

## 2. Technology Stack
- **Backend:** [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Database:** PostgreSQL (Production) / SQLite (Local/Development)
- **ORM:** [SQLAlchemy](https://www.sqlalchemy.org/)
- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3 (No-build React-like component structure)
- **Containerization:** Docker & Docker Compose
- **Deployment:** Optimized for Render.com

---

## 3. System Architecture
The system follows a decoupled client-server architecture:
- **Client (Frontend):** A component-based single-page application (SPA) architecture using modular JS components (`Navbar`, `RosterGrid`, `SectionCard`, etc.). It communicates with the backend via a centralized `api.js` client.
- **Server (Backend):** A RESTful API built with FastAPI, organized into functional routers (`admin`, `auth`, `student`, `professor`).
- **Database:** Stores user records, courses, curriculum blueprints, sections, and enrollment data.

*For detailed visual representations, refer to [diagrams.md](./diagrams.md).*

---

## 4. User Roles & Permissions

| Role | Description | Key Capabilities |
| :--- | :--- | :--- |
| **Admin** | System Overseer | Manage users, create courses/blueprints, generate sections, assign professors. |
| **Student** | Primary User | View available sections for their program/year, enroll in blocks, view study load. |
| **Professor** | Academic Staff | View assigned teaching sections and student rosters for those sections. |

---

## 5. Core Modules

### 5.1 Authentication (`auth.py`)
- Provides JWT (JSON Web Token) based authentication.
- Secure login and token verification for all protected routes.

### 5.2 Admin Module (`routers/admin.py`)
- **User Management:** Create and list users with specific roles.
- **Curriculum Management:** Define "Blueprints" (sets of courses for a specific program/year).
- **Section Generation:** Create sections based on blueprints and assign physical constraints (professor, term, capacity).

### 5.3 Student Module (`routers/student.py`)
- **Section Discovery:** Automatically filters sections based on the student's program and year level.
- **Enrollment Engine:** Handles the logic of joining a section and creating an enrollment record.
- **Study Load:** Provides a summary of the courses within the enrolled section.

### 5.4 Professor Module (`routers/professor.py`)
- **Schedule Management:** Lists all sections where the professor is assigned.
- **Roster Access:** Provides student names and IDs for each assigned class.

---

## 6. Setup & Installation

### Local Development (Windows)
1. **Prerequisites:** Python 3.10+ installed.
2. **Setup:** Run `setup.bat` in the root folder. This creates the virtual environment and installs dependencies.
3. **Run:** Run `start.bat` in the root folder. This starts the FastAPI server and opens the browser to the API documentation.
4. **Seed Data:** To populate the system with demo data, run:
   ```bash
   cd backend
   python seed.py
   ```

### Docker Deployment
1. Ensure Docker Desktop is running.
2. Execute the following command in the root directory:
   ```bash
   docker-compose up --build
   ```

---

## 7. Database Schema Overview
Key entities in the system include:
- **User:** Stores credentials, role, program, and year level.
- **Course:** Defines individual subjects (Code, Title, Units).
- **CurriculumBlueprint:** Maps courses to specific Programs and Year Levels.
- **Section:** A specific instance of a blueprint with an assigned Professor and Term.
- **Enrollment:** The join entity connecting a Student to a Section.

---

## 8. API Endpoints
Comprehensive API documentation is available at `http://localhost:8000/docs` (Swagger UI) or `http://localhost:8000/redoc` (ReDoc) when the server is running.

---

*Documentation Version: 1.0.0*  
*Last Updated: May 7, 2026*
