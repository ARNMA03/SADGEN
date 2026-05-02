from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from auth import hash_password, require_role
import models, schemas

router = APIRouter(prefix="/api/admin", tags=["Admin"])
admin_only = require_role("Admin")

# ─── User Management ──────────────────────────────────────────────────────────

@router.get("/users", response_model=List[schemas.UserOut])
def list_users(db: Session = Depends(get_db), _=Depends(admin_only)):
    return db.query(models.User).all()

@router.post("/users", response_model=schemas.UserOut, status_code=201)
def create_user(payload: schemas.UserCreate, db: Session = Depends(get_db), _=Depends(admin_only)):
    if db.query(models.User).filter(models.User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = models.User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role,
        program=payload.program,
        year_level=payload.year_level,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.delete("/users/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(get_db), _=Depends(admin_only)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()

# ─── Courses ──────────────────────────────────────────────────────────────────

@router.get("/courses", response_model=List[schemas.CourseOut])
def list_courses(db: Session = Depends(get_db), _=Depends(admin_only)):
    return db.query(models.Course).all()

@router.post("/courses", response_model=schemas.CourseOut, status_code=201)
def create_course(payload: schemas.CourseCreate, db: Session = Depends(get_db), _=Depends(admin_only)):
    if db.query(models.Course).filter(models.Course.course_code == payload.course_code).first():
        raise HTTPException(status_code=400, detail="Course code already exists")
    course = models.Course(**payload.model_dump())
    db.add(course)
    db.commit()
    db.refresh(course)
    return course

# ─── Curriculum Blueprints ────────────────────────────────────────────────────

@router.get("/blueprints", response_model=List[schemas.BlueprintOut])
def list_blueprints(db: Session = Depends(get_db), _=Depends(admin_only)):
    return db.query(models.CurriculumBlueprint).all()

@router.post("/blueprints", response_model=schemas.BlueprintOut, status_code=201)
def add_blueprint(payload: schemas.BlueprintCreate, db: Session = Depends(get_db), _=Depends(admin_only)):
    course = db.query(models.Course).filter(models.Course.id == payload.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    existing = db.query(models.CurriculumBlueprint).filter_by(
        program=payload.program, year_level=payload.year_level, course_id=payload.course_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Blueprint entry already exists")
    bp = models.CurriculumBlueprint(**payload.model_dump())
    db.add(bp)
    db.commit()
    db.refresh(bp)
    return bp

@router.delete("/blueprints/{blueprint_id}", status_code=204)
def delete_blueprint(blueprint_id: int, db: Session = Depends(get_db), _=Depends(admin_only)):
    bp = db.query(models.CurriculumBlueprint).filter(models.CurriculumBlueprint.id == blueprint_id).first()
    if not bp:
        raise HTTPException(status_code=404, detail="Blueprint not found")
    db.delete(bp)
    db.commit()

# ─── Section Generation ───────────────────────────────────────────────────────

@router.post("/generate-section", response_model=schemas.SectionOut, status_code=201)
def generate_section(payload: schemas.GenerateSectionRequest, db: Session = Depends(get_db), _=Depends(admin_only)):
    if db.query(models.Section).filter(models.Section.section_name == payload.section_name).first():
        raise HTTPException(status_code=400, detail="Section name already exists")

    blueprints = db.query(models.CurriculumBlueprint).filter_by(
        program=payload.program, year_level=payload.year_level
    ).all()
    if not blueprints:
        raise HTTPException(status_code=404, detail="No blueprint found for given program and year")

    section = models.Section(
        section_name=payload.section_name,
        program=payload.program,
        year_level=payload.year_level,
    )
    db.add(section)
    db.flush()

    for bp in blueprints:
        sc = models.SectionCourse(section_id=section.id, course_id=bp.course_id)
        db.add(sc)

    db.commit()
    db.refresh(section)
    return section

@router.get("/sections", response_model=List[schemas.SectionOut])
def list_all_sections(db: Session = Depends(get_db), _=Depends(admin_only)):
    return db.query(models.Section).all()

@router.post("/assign-professor", status_code=200)
def assign_professor(payload: schemas.AssignProfessorRequest, db: Session = Depends(get_db), _=Depends(admin_only)):
    sc = db.query(models.SectionCourse).filter(models.SectionCourse.id == payload.section_course_id).first()
    if not sc:
        raise HTTPException(status_code=404, detail="Section course not found")
    prof = db.query(models.User).filter(models.User.id == payload.professor_id, models.User.role == models.RoleEnum.professor).first()
    if not prof:
        raise HTTPException(status_code=404, detail="Professor not found")
    sc.professor_id = payload.professor_id
    db.commit()
    return {"message": f"Assigned {prof.name} to section course {sc.id}"}
