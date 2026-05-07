# SADGEN Enrollment System Diagrams

This document illustrates the functional flow and architectural structure of the **SADGEN Enrollment System**. The diagrams follow a progressive level of detail, from broad system interactions to specific data-handling processes.

---

## 1. DFD Level 0: Context Diagram
The Context Diagram represents the entire SADGEN system as a single central process, showing high-level data exchanges with external entities.

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

---

## 2. System Architecture
High-level layout showing the modular separation of concerns and the central database hub.

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

    %% Professor Sub-Flow
    P --> RV[Class Roster Viewer]
```

---

## 3. DFD Level 1: Broad Overview (Processes & Entities)
Breaking down the central system into its primary functional modules.

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

    %% Student Flows
    Student -->|Credentials| P1
    Student -->|Section Choice| P4
    P4 -->|Study Load Output| Student

    %% Admin Flows
    Admin -->|Credentials| P1
    Admin -->|Course & Blueprint Data| P2
    Admin -->|Naming & Capacity Rules| P3
    P2 -->|Curriculum Summary| Admin

    %% Professor Flows
    Professor -->|Credentials| P1
    Professor -->|Request Roster| P5
    P5 -->|Class List Output| Professor
```

---

## 4. DFD Level 2: Medium Specificity (Data Flows & Storage)
Detailed interactions showing how specific data elements move between users, processes, and database stores.

```mermaid
graph TD
    %% Entities
    U[User / Admin]
    
    %% Processes
    Auth((Account Verification))
    AcadMgmt((Manage Academic Records))
    SecMgmt((Section Controls))
    EnrolProc((Process Enrollment))

    %% Data Stores
    D1[(Users DB)]
    D2[(Curriculum DB)]
    D3[(Sections DB)]
    D4[(Enrollments DB)]

    %% Flow - Authentication
    U -->|Login Credentials| Auth
    Auth -->|User ID Query| D1
    D1 -->|Account Profile Data| Auth
    Auth -->|JWT Token / Role Info| U

    %% Flow - Admin Academic Mgmt
    U -->|Course Metadata<br/>Blueprint Defs| AcadMgmt
    AcadMgmt -->|Save New Record| D2
    D2 -->|Retrieval Summary| AcadMgmt
    AcadMgmt -->|Update Notification| U

    %% Flow - Section Controls
    U -->|Generation Request| SecMgmt
    SecMgmt -->|Fetch Curriculum| D2
    D2 -->|Course List Data| SecMgmt
    SecMgmt -->|Write Section Entry| D3
    D3 -->|Section Metadata| SecMgmt

    %% Flow - Enrollment
    U -->|Selection Data| EnrolProc
    EnrolProc -->|Check Capacity| D3
    D3 -->|Current Slot Status| EnrolProc
    EnrolProc -->|Commit Enrollment| D4
    D4 -->|Receipt Number| EnrolProc
    EnrolProc -->|Success Feedback| U
```

---

## 5. DFD Level 3: Specific Detail (Granular Workflows)
The highest level of specificity, breaking down internal system logic into atomic steps with precise data labels.

```mermaid
graph TD
    %% Entities
    Student[Student]
    Admin[Administrator]

    %% Specific Processes
    P1.1((Validate Eligibility))
    P1.2((Load Filtered Sections))
    P1.3((Verify Slot Availability))
    P1.4((Commit Enrollment))
    
    P2.1((Map Courses to Group))
    P2.2((Generate Alpha Name))
    P2.3((Assign Instructor))
    P2.4((Publish Block Section))

    %% Data Stores
    D1[(Users DB)]
    D2[(Blueprint DB)]
    D3[(Sections DB)]
    D4[(Enrollments DB)]

    %% Detailed Enrollment Workflow
    Student -->|Student ID| P1.1
    P1.1 -->|Profile Search| D1
    D1 -->|Program & Year Level| P1.1
    P1.1 -->|Eligibility Status| P1.2
    
    P1.2 -->|Identity Filter| D3
    D3 -->|Available Sections| P1.2
    P1.2 -->|Selection Prompt| Student
    
    Student -->|Chosen Section ID| P1.3
    P1.3 -->|Current Enrollment Count| D3
    D3 -->|Remaining Capacity| P1.3
    
    P1.3 -->|Verified Data Object| P1.4
    P1.4 -->|Atomic Record Write| D4
    D4 -->|Confirmation ID| P1.4
    P1.4 -->|Success UI Message| Student

    %% Detailed Admin Workflow
    Admin -->|List of Course IDs| P2.1
    P2.1 -->|Atomic Identity Link| D2
    D2 -->|Unique Blueprint ID| P2.1
    
    P2.1 -->|Curriculum Structure| P2.2
    P2.2 -->|Alphabetical Gap Scan| D3
    D3 -->|First Available Letter| P2.2
    
    Admin -->|Instructor Staff ID| P2.3
    P2.3 -->|Professor Profile Query| D1
    D1 -->|Verified Staff Object| P2.3
    
    P2.2 & P2.3 -->|Aggregated Block Data| P2.4
    P2.4 -->|Final Section Commit| D3
    D3 -->|Write Success Status| P2.4
    P2.4 -->|Dashboard Toast| Admin
```
