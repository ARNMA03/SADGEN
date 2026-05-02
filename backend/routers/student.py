from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from auth import get_current_user, require_role
import models, schemas

router = APIRouter(prefix="/api", tags=["Student"])
student_only = require_role("Student")

@router.get("/sections/{program}/{year}", response_model=List[schemas.SectionOut])
def get_sections_for_student(
    program: str,
    year: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Enforce that a student can only see sections matching their own profile
    if current_user.role == models.RoleEnum.student:
        if current_user.program != program or current_user.year_level != year:
            raise HTTPException(status_code=403, detail="Cannot view sections outside your program/year")
    return db.query(models.Section).filter_by(program=program, year_level=year).all()

@router.post("/enroll", status_code=201)
def enroll(
    payload: schemas.EnrollRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(student_only),
):
    section = db.query(models.Section).filter(models.Section.id == payload.section_id).first()
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")

    # Validate section matches student's program and year
    if section.program != current_user.program or section.year_level != current_user.year_level:
        raise HTTPException(status_code=403, detail="Section does not match your program or year level")

    # Check if already enrolled in ANY section (one enrollment per student)
    existing = db.query(models.Enrollment).filter(models.Enrollment.student_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="You are already enrolled in a section")

    enrollment = models.Enrollment(student_id=current_user.id, section_id=payload.section_id)
    db.add(enrollment)
    db.commit()
    return {"message": "Enrollment successful", "section": section.section_name}

@router.get("/student/load", response_model=List[schemas.StudyLoadItem])
def get_study_load(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(student_only),
):
    enrollment = db.query(models.Enrollment).filter(models.Enrollment.student_id == current_user.id).first()
    if not enrollment:
        return []

    section = db.query(models.Section).filter(models.Section.id == enrollment.section_id).first()
    result = []
    for sc in section.section_courses:
        result.append(schemas.StudyLoadItem(
            course_code=sc.course.course_code,
            course_name=sc.course.course_name,
            professor_name=sc.professor.name if sc.professor else "TBA",
            section_name=section.section_name,
        ))
    return result

@router.get("/student/enrollment-status")
def enrollment_status(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(student_only),
):
    enrollment = db.query(models.Enrollment).filter(models.Enrollment.student_id == current_user.id).first()
    if not enrollment:
        return {"enrolled": False, "section": None}
    section = db.query(models.Section).filter(models.Section.id == enrollment.section_id).first()
    return {"enrolled": True, "section": section.section_name, "section_id": section.id}
