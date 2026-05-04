from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from auth import require_role
import models, schemas

router = APIRouter(prefix="/api/professor", tags=["Professor"])
professor_only = require_role("Professor")

@router.get("/load", response_model=List[schemas.SectionCourseOut])
def get_assigned_load(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(professor_only),
):
    return (
        db.query(models.SectionCourse)
        .filter(models.SectionCourse.professor_id == current_user.id)
        .all()
    )

@router.get("/sections", response_model=List[schemas.SectionOut])
def get_assigned_sections(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(professor_only),
):
    """Get unique sections that a professor teaches in."""
    section_ids = (
        db.query(models.SectionCourse.section_id)
        .filter(models.SectionCourse.professor_id == current_user.id)
        .distinct()
        .all()
    )
    ids = [s[0] for s in section_ids]
    sections = db.query(models.Section).filter(models.Section.id.in_(ids)).all()
    for s in sections:
        s.enrolled_count = db.query(models.Enrollment).filter_by(section_id=s.id).count()
    return sections

@router.get("/roster/{section_id}", response_model=List[schemas.RosterStudent])
def get_class_roster(
    section_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(professor_only),
):
    # Confirm this professor teaches in this section
    teaches = db.query(models.SectionCourse).filter_by(
        section_id=section_id, professor_id=current_user.id
    ).first()
    if not teaches:
        raise HTTPException(status_code=403, detail="You are not assigned to this section")

    enrollments = db.query(models.Enrollment).filter(models.Enrollment.section_id == section_id).all()
    result = []
    for e in enrollments:
        s = e.student
        result.append(schemas.RosterStudent(
            student_id=s.id,
            name=s.name,
            email=s.email,
            program=s.program,
            year_level=s.year_level,
        ))
    return result
