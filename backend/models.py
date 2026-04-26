from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint, Enum
from sqlalchemy.orm import relationship
from database import Base
import enum

class RoleEnum(str, enum.Enum):
    admin = "Admin"
    student = "Student"
    professor = "Professor"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False)
    program = Column(String, nullable=True)   # e.g. BSCS
    year_level = Column(Integer, nullable=True)  # e.g. 2

    enrollments = relationship("Enrollment", back_populates="student", foreign_keys="Enrollment.student_id")
    section_courses = relationship("SectionCourse", back_populates="professor", foreign_keys="SectionCourse.professor_id")

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    course_name = Column(String, nullable=False)
    course_code = Column(String, unique=True, nullable=False)

    blueprints = relationship("CurriculumBlueprint", back_populates="course")
    section_courses = relationship("SectionCourse", back_populates="course")

class CurriculumBlueprint(Base):
    __tablename__ = "curriculum_blueprints"

    id = Column(Integer, primary_key=True, index=True)
    program = Column(String, nullable=False)
    year_level = Column(Integer, nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)

    course = relationship("Course", back_populates="blueprints")

    __table_args__ = (UniqueConstraint("program", "year_level", "course_id", name="uq_blueprint"),)

class Section(Base):
    __tablename__ = "sections"

    id = Column(Integer, primary_key=True, index=True)
    section_name = Column(String, unique=True, nullable=False)  # e.g. BSCS-2A
    program = Column(String, nullable=False)
    year_level = Column(Integer, nullable=False)

    section_courses = relationship("SectionCourse", back_populates="section")
    enrollments = relationship("Enrollment", back_populates="section")

class SectionCourse(Base):
    __tablename__ = "section_courses"

    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    professor_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    section = relationship("Section", back_populates="section_courses")
    course = relationship("Course", back_populates="section_courses")
    professor = relationship("User", back_populates="section_courses", foreign_keys=[professor_id])

    __table_args__ = (UniqueConstraint("section_id", "course_id", name="uq_section_course"),)

class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=False)

    student = relationship("User", back_populates="enrollments", foreign_keys=[student_id])
    section = relationship("Section", back_populates="enrollments")

    __table_args__ = (UniqueConstraint("student_id", "section_id", name="uq_enrollment"),)
