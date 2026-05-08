# SADGEN Enrollment System Documentation

## 1. Executive Summary
The **SADGEN Enrollment System** is an automated block enrollment portal designed to streamline the registration process for students and administrators. By utilizing a "block-based" approach, students can enroll in a pre-defined set of courses (sections) that correspond to their program and year level, ensuring curriculum compliance and balanced class sizes.

---

## 2. Technology Stack
- **Backend:** [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Database:** PostgreSQL (Production) / SQLite (Local/Development)
- **ORM:** [SQLAlchemy](https://www.sqlalchemy.org/)
- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3 (No-build Component Architecture)
- **Visuals:** [Mermaid.js](https://mermaid.js.org/) for architectural diagrams
- **Containerization:** Docker & Docker Compose

---

## 3. Key System Features (Hardened Logic)
SADGEN is designed with robust data integrity and "smart" management features that go beyond basic CRUD operations:

*   **Smart Section Naming (Gap Scan):** When generating new sections, the system performs an alphabetical "Gap Scan." If sections A, B, and C exist and B is deleted, the next section created will automatically reclaim "B" before incrementing to "D."
*   **Dependency-Aware Deletion:** Sections can be deleted even if they have course assignments (the system handles the cleanup). However, a hard block is maintained if students are enrolled, preventing accidental data loss.
*   **Automatic Role Cleanup:** When a user's role is changed (e.g., from Student to Professor), the system automatically clears irrelevant academic data (Program, Year Level) to maintain a clean database.
*   **Curriculum Synchronization:** If an administrator updates a Curriculum Blueprint (adding/removing courses), the system automatically synchronizes all active block sections using that blueprint in real-time.
*   **Administrative Recycle Bin (Trash Management):** Soft-deletion logic is implemented for Users, Courses, and Blueprints, allowing administrators to review and restore deleted items before permanent removal.

---

## 4. User Roles & Permissions

| Role | Description | Key Capabilities |
| :--- | :--- | :--- |
| **Admin** | System Overseer | Manage users/recycle bin, create courses/blueprints, generate sections, assign professors. |
| **Student** | Primary User | View eligible sections, enroll in blocks, view study load receipt. |
| **Professor** | Academic Staff | Read-only access to assigned teaching sections and student rosters. |

---

## 5. Core Modules

### 5.1 Authentication (`auth.py`)
- Provides **Stateless JWT** (JSON Web Tokens) based authentication.
- Secure login and identity verification without session storage on the server.
- Role-based access control (RBAC) enforced on all API endpoints.

### 5.2 Admin Module (`routers/admin.py`)
- **User Management:** Detailed user tracking with automatic role-identity cleanup and trash recovery.
- **Blueprint Management:** Defines "Blueprints" (course sets for specific program/year) with live-sync capabilities.
- **Section Generation:** Automated "Block" creation with smart naming and capacity guards.

### 5.3 Student Module (`routers/student.py`)
- **Section Discovery:** Real-time filtering ensures students only see sections matching their Program and Year Level.
- **Enrollment Engine:** Validates slot availability and eligibility tokens before committing a record.

### 5.4 Professor Module (`routers/professor.py`)
- **Roster Access:** Provides secure access to student names and contact info for their specific assigned sections.

---

## 6. Setup & Installation

### Local Development (Windows)
1. **Prerequisites:** Python 3.10+ installed.
2. **Setup:** Run `setup.bat` in the root folder.
3. **Run:** Run `start.bat` in the root folder.
4. **Seed Data:** To populate the system with demo data, run:
   ```bash
   cd backend
   python seed.py
   ```

---

## 7. Database Schema Overview
- **User:** Credentials, Role, Academic Metadata.
- **Course:** Subject Metadata (Code, Title).
- **CurriculumBlueprint:** Mapping Course groups to Program/Year identities.
- **Section:** Physical instance of a blueprint with a Professor and Term.
- **Enrollment:** Secure join connecting Students to their specific Sections.

---

## 8. Presentation Guide
When presenting SADGEN, focus on these five **"Hardening"** talking points:

1.  **Integrity:** Demonstrate how updating/deleting a blueprint live-updates all active sections using it.
2.  **Usability:** Show the **Smart Naming** logic by deleting Section 'B' and creating a new one to reclaim the gap.
3.  **Safety:** Show the guardrail preventing the deletion of a section if students are already enrolled.
4.  **Recovery:** Demonstrate the **Trash Management / Recycle Bin** by deleting a user and then restoring them.
5.  **Cleanliness:** Show the **Role Cleanup** logic by changing a Student to a Professor and verifying their year level is purged.

---

*Documentation Version: 1.2.0*  
*Last Updated: May 7, 2026*
