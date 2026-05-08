# College of Computer Studies

**Final Activity**  
**Human Computer Interaction 2**  
**LEC**

## System Modeling (DFD & System Architecture)

**Submitted by:**  
Anahaw, Samantha Isabel N.  
Austria, Arden Roland Nicholai M.  
Emperador, Radge Michael A.

**Submitted to:**  
Ma'am Ginalyn I. Contillo

**Date:** May 8, 2026

**Chosen System:** Enrollment System

---

# Data Flow Diagram (DFD)

## 1. Context Diagram

```mermaid
graph TD
    %% Central Process
    System((SADGEN Enrollment System))

    %% External Entities
    S[Student]
    A[Administrator]
    P[Professor]

    %% Student Interactions
    S -->|Login Credentials<br/>Section Selection| System
    System -->|Auth Status<br/>Available Sections<br/>Study Load Receipt| S

    %% Admin Interactions
    A -->|User & Course Data<br/>Curriculum Blueprints<br/>Section Parameters| System
    System -->|Process Confirmations<br/>System Activity Logs<br/>Roster Analytics| A

    %% Professor Interactions
    P -->|Login Credentials<br/>Roster Data Request| System
    System -->|Auth Status<br/>Class Roster| P
```

### **Description:**
The Context Diagram defines the outermost boundary of the SADGEN Enrollment System by mapping it as a single process against its three external actors.

The **Administrator** is the sole data configurator — they feed the system with user accounts, course definitions, curriculum blueprints, and section parameters. In return, the system outputs process confirmations and activity logs.

The **Student** is the primary transactional user — they submit login credentials and a section selection, and the system returns a filtered list of eligible sections and a Study Load receipt upon successful enrollment.

The **Professor** is a read-only consumer — they authenticate and request their assigned class data, receiving a formatted class roster in return. No data is written back to the system from the Professor.

---

## 2. Level 1 DFD

```mermaid
graph TD
    %% Entities
    Student[Student]
    Admin[Administrator]
    Professor[Professor]

    %% Processes
    P1((Account Authentication))
    P2((Curriculum Management))
    P3((Section Management))
    P4((Enrollment Process))
    P5((Class & Roster Viewing))
    P6((Trash Management))

    %% Student Flows
    Student -->|Credentials| P1
    Student -->|Section Choice| P4
    P4 -->|Study Load Output| Student

    %% Admin Flows
    Admin -->|Credentials| P1
    Admin -->|Course & Blueprint Data| P2
    Admin -->|Naming & Capacity Rules| P3
    Admin -->|Restore/Purge Requests| P6
    P2 -->|Curriculum Summary| Admin
    P6 -->|Trash Inventory| Admin

    %% Professor Flows
    Professor -->|Credentials| P1
    Professor -->|Request Roster| P5
    P5 -->|Class List Output| Professor
```

### **Description:**
The Level 1 DFD breaks the system into six primary processes and establishes which external entity owns each one.

**P1 (Account Authentication)** is the shared entry point for all three roles, issuing a JWT token that governs all subsequent access. **P2 (Curriculum Management)** and **P3 (Section Management)** are exclusive to the Administrator, handling the creation of courses, blueprints, and automatically named block sections. **P4 (Enrollment Process)** is the core student-facing transaction, producing a Study Load output on success. **P5 (Class & Roster Viewing)** serves the Professor as a read-only query endpoint. **P6 (Trash Management)** is an Admin-only recovery interface for soft-deleted records.

---

## 3. Level 2 DFD

```mermaid
graph TD
    %% Entities
    S[Student]
    A[Administrator]
    P[Professor]
    
    %% Processes
    Auth((Account Verification))
    UserMgmt((User Management))
    AcadMgmt((Academic Data Mgmt))
    SecMgmt((Section Controls))
    EnrolProc((Process Enrollment))
    RosterView((Class Roster Viewing))
    TrashMgmt((Trash Management))

    %% Data Stores
    D1[(Users DB)]
    D2[(Curriculum DB)]
    D3[(Sections DB)]
    D4[(Enrollments DB)]

    %% Shared Flow - Authentication
    S & A & P -->|Login Credentials| Auth
    Auth -->|User ID Query| D1
    D1 -->|Account Profile Data| Auth
    Auth -->|JWT Token / Role Info| S & A & P

    %% Admin Flows
    A -->|Profile Details & Role| UserMgmt
    UserMgmt -->|Register/Update| D1
    D1 -->|User Inventory| UserMgmt

    A -->|Course & Blueprint Defs| AcadMgmt
    AcadMgmt -->|Save Records| D2
    D2 -->|Retrieval Summary| AcadMgmt

    A -->|Generation Parameters| SecMgmt
    SecMgmt -->|Fetch Curriculum| D2
    D2 -->|Course List| SecMgmt
    SecMgmt -->|Write Section Entry| D3

    A -->|Toggle is_deleted| TrashMgmt
    TrashMgmt -->|Update Flag| D1 & D2 & D3

    %% Student Flows
    S -->|Section Selection| EnrolProc
    EnrolProc -->|Check Capacity| D3
    D3 -->|Slot Status| EnrolProc
    EnrolProc -->|Write Enrollment| D4
    D4 -->|Confirmation ID| EnrolProc

    %% Professor Flows
    P -->|Roster Request| RosterView
    RosterView -->|Assignment Query| D3
    D3 -->|Instructor Match| RosterView
    RosterView -->|Student List Query| D4
    D4 -->|Enrollment Records| RosterView
    RosterView -->|Class Roster Data| P
```

### **Description:**
The Level 2 DFD introduces the four core relational data stores and shows which process group reads from or writes to each one.

All three actors share the **Account Verification** process, which queries D1 (Users DB) to validate credentials and return a role-scoped JWT. The Administrator operates across three separate write paths: **User Management** writes directly to D1; **Academic Data Management** reads and writes to D2 (Curriculum DB); and **Section Controls** reads blueprint data from D2 and writes the generated section into D3 (Sections DB). The **Trash Management** process toggles the `is_deleted` flag on records across D1, D2, and D3 without performing a hard delete.

The Student's **Enrollment Process** reads D3 to verify slot availability, then commits a new record to D4 (Enrollments DB). The Professor's **Roster Viewing** process queries D3 to identify assigned sections, then reads D4 to retrieve the student enrollment records.

---

## 4. Level 3 DFD (Granular Workflows)

### 4.1 Student: Enrollment & Study Load

```mermaid
graph TD
    Student[Student]

    P1.1((Validate Program Match))
    P1.2((Load Matching Sections))
    P1.3((Check Slot Limit))
    P1.4((Check Existing Enrollment))
    P1.5((Commit Enrollment))
    P1.6((Retrieve Study Load))

    D1[(Users DB)]
    D3[(Sections DB)]
    D4[(Enrollments DB)]

    Student -->|JWT Token| P1.1
    P1.1 -->|Fetch Profile| D1
    D1 -->|Program & Year Level| P1.1

    P1.1 -->|Program + Year Filter| P1.2
    P1.2 -->|Query by Program & Year| D3
    D3 -->|Sections + Enrolled Count| P1.2
    P1.2 -->|Filtered Section List| Student

    Student -->|Chosen Section ID| P1.3
    P1.3 -->|Verify Program Match| D3
    P1.3 -->|Count Existing Enrollments| D4
    D4 -->|Count vs Slot Limit| P1.3

    P1.3 -->|Capacity Available| P1.4
    P1.4 -->|Check Student's Enrollment Record| D4
    D4 -->|No Existing Record| P1.4

    P1.4 -->|All Guards Passed| P1.5
    P1.5 -->|Write Enrollment Record| D4
    D4 -->|Success + Section Name| P1.5
    P1.5 -->|Enrollment Confirmed| Student

    Student -->|Request Study Load| P1.6
    P1.6 -->|Lookup Enrollment| D4
    D4 -->|Enrolled Section ID| P1.6
    P1.6 -->|Fetch SectionCourses & Professors| D3
    D3 -->|Course Code, Name, Professor| P1.6
    P1.6 -->|Study Load List| Student
```

### **Description:**
This diagram traces the full student journey across two phases: **enrollment** and **study load retrieval**.

In the enrollment phase, the system first fetches the student's profile from D1 to extract their program and year level. It then filters D3 (Sections DB) to return only matching sections. When the student selects a section, two sequential guards are enforced: (1) a **slot limit check** that counts current enrollments in D4 against the section's capacity, and (2) an **existing-enrollment check** that blocks any student already registered in another section. Only when both pass is a new record written to D4.

In the study load phase, the system looks up the student's active enrollment in D4, retrieves the linked section from D3, and traverses the SectionCourses relationship to return each subject's course code, course name, and assigned professor name.

---

### 4.2 Administrator: User, Blueprint & Section Management

```mermaid
graph TD
    Admin[Administrator]

    P2.1((Check Email Conflict))
    P2.2((Write User Record))
    P2.3((Apply Role Cleanup))
    P2.4((Verify Blueprint Exists))
    P2.5((Gap Scan for Letter))
    P2.6((Create Section & Courses))
    P2.7((Sync Blueprint to Sections))
    P2.8((Assign Professor to Course))

    D1[(Users DB)]
    D2[(Blueprints DB)]
    D3[(Sections DB)]
    D4[(SectionCourses DB)]

    Admin -->|User Payload| P2.1
    P2.1 -->|Email Duplicate Check| D1
    D1 -->|No Conflict| P2.1
    P2.1 -->|Validated Payload| P2.2
    P2.2 -->|Write/Update User| D1

    Admin -->|Role Change| P2.3
    P2.3 -->|Set Program & Year to null| D1
    D1 -->|Hardened Profile Saved| P2.3

    Admin -->|Program + Year + Slot| P2.4
    P2.4 -->|Check Blueprints Exist| D2
    D2 -->|Blueprint Course List| P2.4
    P2.4 -->|Blueprints Confirmed| P2.5
    P2.5 -->|Fetch Existing Section Names| D3
    D3 -->|Used Letter Set| P2.5
    P2.5 -->|First Available Letter| P2.6
    P2.6 -->|Write New Section| D3
    P2.6 -->|Write SectionCourse Entries| D4

    Admin -->|Add/Remove Course| P2.7
    P2.7 -->|Update Blueprint Entries| D2
    P2.7 -->|Propagate to SectionCourses| D4

    Admin -->|SectionCourse ID + Professor ID| P2.8
    P2.8 -->|Verify Professor Role| D1
    P2.8 -->|Update professor_id| D4
```

### **Description:**
This diagram documents four independent administrative workflows that share the same data stores.

**User Management (P2.1–P2.3):** Before creating a user, the system checks D1 for an email duplicate. On success, the user record is written to D1. When a role is changed away from Student, the system immediately nullifies the `program` and `year_level` fields in D1 to prevent stale academic metadata.

**Section Generation (P2.4–P2.6):** The admin provides a program, year, and slot limit. The system first confirms a matching blueprint exists in D2. It then scans all existing section names in D3 to build a set of used alphabetical suffixes (e.g., A, B, C), and selects the first missing letter — this is the **Alphabetical Gap Scan**. The new section is written to D3 and all linked course entries are written to D4 (SectionCourses DB).

**Blueprint Sync (P2.7):** When a course is added to or removed from a blueprint in D2, the change is immediately propagated to all existing SectionCourse entries in D4 for matching sections.

**Assign Professor (P2.8):** The admin provides a SectionCourse ID and a Professor ID. The system verifies the professor's role in D1, then updates the `professor_id` field on the target SectionCourse record in D4.

---

### 4.3 Professor: Teaching Load & Roster Retrieval

```mermaid
graph TD
    Professor[Professor]

    P3.1((Get Teaching Load))
    P3.2((Get Assigned Sections))
    P3.3((Verify Section Assignment))
    P3.4((Fetch Enrollments))
    P3.5((Build Student Roster))

    D1[(Users DB)]
    D3[(Sections DB)]
    D4[(SectionCourses DB)]
    D5[(Enrollments DB)]

    Professor -->|JWT Token| P3.1
    P3.1 -->|Filter SectionCourses by professor_id| D4
    D4 -->|Course-Section Pairs| P3.1
    P3.1 -->|Teaching Load List| Professor

    Professor -->|View My Sections| P3.2
    P3.2 -->|Distinct Section IDs from SectionCourses| D4
    D4 -->|Unique Section IDs| P3.2
    P3.2 -->|Fetch Section Details| D3
    D3 -->|Sections + Enrolled Count| P3.2
    P3.2 -->|Section List| Professor

    Professor -->|Select Section ID| P3.3
    P3.3 -->|Confirm professor_id in SectionCourse| D4
    D4 -->|Assignment Verified| P3.3

    P3.3 -->|Authorization Granted| P3.4
    P3.4 -->|Fetch All Enrollments for Section| D5
    D5 -->|Enrollment Records with student_id| P3.4

    P3.4 -->|Student IDs| P3.5
    P3.5 -->|Fetch Student Profiles| D1
    D1 -->|Name, Email, Program, Year Level| P3.5
    P3.5 -->|Formatted Class Roster| Professor
```

### **Description:**
This diagram reflects the three read-only professor-facing endpoints, all rooted in the `SectionCourses` table as the source of truth for professor assignments.

**Get Teaching Load (P3.1):** The system filters D4 (SectionCourses DB) by the professor's JWT-decoded ID, returning all course-section pairs they are assigned to teach.

**Get Assigned Sections (P3.2):** The system queries D4 for the distinct set of section IDs where the professor appears, then fetches the corresponding section records from D3 (Sections DB), including a live count of enrolled students.

**Roster Retrieval (P3.3–P3.5):** Before accessing any student data, the system enforces an **authorization guard** by confirming the professor's ID exists in a SectionCourse record for the requested section. If verified, it fetches all enrollment records from D5 (Enrollments DB), extracts the student IDs, and retrieves each student's name, email, program, and year level from D1 (Users DB) to assemble the final class roster.

---

## 5. System Architecture Diagram

```mermaid
graph LR
    %% Entities/Modules
    S[Student Module] --> SM[Login Module]
    A[Admin Module] --> AM[Login Module]
    P[Professor Module] --> PM[Login Module]

    %% Central DB
    SM --> DB[(Central Database)]
    AM --> DB
    PM --> DB

    %% Student Sub-Flow
    S --> EM[Enrollment Module]
    EM --> SL[Study Load Module]

    %% Admin Sub-Flow
    A --> UM[User Management]
    A --> CM[Course Management]
    A --> BM[Blueprint Management]
    A --> SG[Section Generation]
    A --> TM[Trash Management]

    %% Professor Sub-Flow
    P --> RV[Class Roster Viewer]
```

### **Description:**
The System Architecture Diagram illustrates the modular, role-based structure of the SADGEN portal across three layers.

All three roles (Student, Admin, Professor) pass through a shared **Login Module** before accessing their respective portals. Each module communicates with a **Central Database** through the backend API.

The **Student Module** connects to an **Enrollment Module** for section registration and a **Study Load Module** for viewing enrolled courses. The **Admin Module** branches into five sub-modules: **User Management** (account creation and role control), **Course Management** (subject definitions), **Blueprint Management** (curriculum groupings), **Section Generation** (automated block creation with gap-scan naming), and **Trash Management** (soft-delete and restore logic). The **Professor Module** connects to a **Class Roster Viewer** for reading assigned sections and student lists.

The frontend is built in Vanilla JavaScript using a component-based SPA architecture. The backend is a FastAPI REST API that enforces role-based access control via JWT tokens. Persistence is handled by SQLAlchemy ORM over SQLite (development) or PostgreSQL (production).

---

## Short Explanation:

The diagrams in this document collectively model the SADGEN Enrollment System across four levels of abstraction, from boundary definition to atomic code-level logic.

The **Context Diagram** establishes the system's three actors and their high-level inputs and outputs — the Admin configures the system, the Student transacts with it, and the Professor reads from it.

The **Level 1 DFD** decomposes the system into six functional processes, clarifying which role owns each process and what data flows between them at a conceptual level.

The **Level 2 DFD** introduces the four relational data stores and maps which process group reads from or writes to each one, revealing how the Admin, Student, and Professor flows are physically separated at the database level.

The **Level 3 DFDs** provide the highest fidelity by documenting the actual logic enforced in the backend code — including enrollment guards, the alphabetical gap scan for section naming, blueprint-to-section synchronization, and the professor authorization check before roster access.

Finally, the **System Architecture Diagram** maps these data flows to the concrete technology stack: a Vanilla JS SPA frontend, a FastAPI REST backend with JWT-based role control, and a SQLAlchemy-managed relational database. Together, these models demonstrate a system built for correctness, data integrity, and a frictionless multi-role user experience.




```mermaid
graph TD
    %% 1. Entities & External Systems
    Admin[Admin]
    Student[Student]
    Professor[Professor]
    DBMS[(Database)]
    CloudStorage[(Cloud Storage)]

    %% 2. Admin Flow: Configuration & Provisioning
    Admin -->|Login Credentials| P1_1[Authentication]
    Admin -->|System Config| P2_1[Manage User Roles]
    Admin -->|Manage Course Catalog| P2_3[Manage Courses]
    Admin -->|Manage Programs| P2_5[Manage Curriculums]
    Admin -->|Create Sections| P2_6[Generate Sections]
    Admin -->|Upload Files| P2_2[File Upload Service]

    %% 3. Student Flow: Learning & Enrollment
    Student -->|Login Credentials| P1_1
    Student -->|Enroll/Withdraw| P3_1[Enrollment Service]
    Student -->|View Schedule| P3_2[View Study Load]
    Student -->|Download Materials| P3_3[File Download Service]

    %% 4. Professor Flow: Teaching & Administration
    Professor -->|Login Credentials| P1_1
    Professor -->|View Load & Roster| P4_1[Roster Management]
    Professor -->|Upload Materials| P4_2[File Upload Service]
    Professor -->|Manage Grades| P4_3[Grade Management]

    %% 5. Backend Services & Data Flows
    P1_1 -->|JWT Token| S1[Backend API Gateway]
    S1 -->|Auth Check| AuthSvc[Authentication Service]
    AuthSvc -->|Validate Credentials| DBMS

    P2_1 -->|Create/Update/Delete User| UserSvc[User Service]
    UserSvc -->|CRUD Operations| DBMS
    UserSvc -->|Generate Credentials| MailSvc[Email Service]

    P2_3 -->|Manage Courses| CourseSvc[Course Service]
    CourseSvc -->|CRUD Operations| DBMS

    P2_5 -->|Manage Blueprints| BlueprintSvc[Blueprint Service]
    BlueprintSvc -->|CRUD Operations| DBMS

    P2_6 -->|Generate Sections| SectionSvc[Section Service]
    SectionSvc -->|Naming Algorithm| Algo[Gap Scan Algorithm]
    Algo -->|Create Sections| DBMS
    Algo -->|Map Courses| DBMS

    P2_2 -->|Upload Files| FileSvc[File Service]
    FileSvc -->|Store File| CloudStorage
    CloudStorage -->|Generate Presigned URL| S1

    P3_1 -->|Enrollment Logic| EnrollSvc[Enrollment Service]
    EnrollSvc -->|Check Capacity| DBMS
    EnrollSvc -->|Create Enrollment| DBMS
    EnrollSvc -->|Create Activity Log| ActivitySvc[Activity Service]

    P3_2 -->|Fetch Schedule| LoadSvc[Study Load Service]
    LoadSvc -->|Query Enrollments| DBMS
    LoadSvc -->|List Courses| DBMS

    P3_3 -->|Download File| FileSvc
    FileSvc -->|Get URL| CloudStorage

    P4_1 -->|Get Roster| RosterSvc[Roster Service]
    RosterSvc -->|Query Section & Students| DBMS
    RosterSvc -->|Check Auth| AuthSvc

    P4_2 -->|Upload Files| FileSvc

    P4_3 -->|Manage Grades| GradeSvc[Grade Service]
    GradeSvc -->|Check Assignment| DBMS
    GradeSvc -->|Update Grades| DBMS
    GradeSvc -->|Notify Student| MailSvc

    %% 6. System-Wide Flows
    S1 -->|All Requests| DBConn[Database Connection Pool]
    DBConn -->|SQL Queries| DBMS

    subgraph "External Systems"
        DBMS
        CloudStorage
        MailSvc
    end

    subgraph "Backend Microservices"
        S1
        AuthSvc
        UserSvc
        CourseSvc
        BlueprintSvc
        SectionSvc
        Algo
        FileSvc
        EnrollSvc
        LoadSvc
        RosterSvc
        GradeSvc
        ActivitySvc
    end
```
