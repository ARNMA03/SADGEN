from pydantic import BaseModel, EmailStr
from typing import Optional, List
from enum import Enum

# ─── Enums ────────────────────────────────────────────────
class RoleEnum(str, Enum):
    admin = "Admin"
    student = "Student"
    professor = "Professor"

# ─── Auth ─────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    name: str
    role: RoleEnum
    program: Optional[str] = None
    year_level: Optional[int] = None

# ─── Users ────────────────────────────────────────────────
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: RoleEnum
    program: Optional[str] = None
    year_level: Optional[int] = None

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: RoleEnum
    program: Optional[str] = None
    year_level: Optional[int] = None

    class Config:
        from_attributes = True

# ─── Courses ──────────────────────────────────────────────
class CourseOut(BaseModel):
    id: int
    course_name: str
    course_code: str

    class Config:
        from_attributes = True

class CourseCreate(BaseModel):
    course_name: str
    course_code: str

# ─── Blueprints ───────────────────────────────────────────
class BlueprintCreate(BaseModel):
    program: str
    year_level: int
    course_id: int

class BlueprintOut(BaseModel):
    id: int
    program: str
    year_level: int
    course: CourseOut

    class Config:
        from_attributes = True

# ─── Section Generation ───────────────────────────────────
class GenerateSectionRequest(BaseModel):
    program: str
    year_level: int
    section_name: str  # e.g. BSCS-2A

class AssignProfessorRequest(BaseModel):
    section_course_id: int
    professor_id: int

# ─── Sections ─────────────────────────────────────────────
class SectionCourseOut(BaseModel):
    id: int
    course: CourseOut
    professor: Optional[UserOut] = None

    class Config:
        from_attributes = True

class SectionOut(BaseModel):
    id: int
    section_name: str
    program: str
    year_level: int
    section_courses: List[SectionCourseOut] = []

    class Config:
        from_attributes = True

# ─── Enrollment ───────────────────────────────────────────
class EnrollRequest(BaseModel):
    section_id: int

class EnrollmentOut(BaseModel):
    id: int
    section: SectionOut

    class Config:
        from_attributes = True

# ─── Study Load ───────────────────────────────────────────
class StudyLoadItem(BaseModel):
    course_code: str
    course_name: str
    professor_name: Optional[str] = None
    section_name: str

# ─── Roster ───────────────────────────────────────────────
class RosterStudent(BaseModel):
    student_id: int
    name: str
    email: str
    program: Optional[str]
    year_level: Optional[int]
