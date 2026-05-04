from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List
from database import get_db
from auth import hash_password, require_role
import models, schemas

router = APIRouter(prefix="/api/admin", tags=["Admin"])
admin_only = require_role("Admin")

@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db), _=Depends(admin_only)):
    total_slots = db.query(func.sum(models.Section.slot_limit)).scalar() or 0
    total_enrolled = db.query(models.Enrollment).count()
    # Count unique (program, year) combinations
    total_blueprints = db.query(models.CurriculumBlueprint.program, models.CurriculumBlueprint.year_level).distinct().count()
    total_courses = db.query(models.Course).count()
    
    capacity_percentage = 0
    if total_slots > 0:
        capacity_percentage = round((total_enrolled / total_slots) * 100)
    
    return {
        "total_slots": total_slots,
        "total_enrolled": total_enrolled,
        "capacity_percentage": capacity_percentage,
        "total_blueprints": total_blueprints,
        "total_courses": total_courses
    }

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

@router.put("/users/{user_id}", response_model=schemas.UserOut)
def update_user(user_id: int, payload: schemas.UserUpdate, db: Session = Depends(get_db), _=Depends(admin_only)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    data = payload.model_dump(exclude_unset=True)
    if "password" in data and data["password"]:
        data["password_hash"] = hash_password(data.pop("password"))
    elif "password" in data:
        data.pop("password")
        
    for key, value in data.items():
        setattr(user, key, value)
    
    db.commit()
    db.refresh(user)
    return user

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

@router.put("/courses/{course_id}", response_model=schemas.CourseOut)
def update_course(course_id: int, payload: schemas.CourseUpdate, db: Session = Depends(get_db), _=Depends(admin_only)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(course, key, value)
    
    db.commit()
    db.refresh(course)
    return course

@router.delete("/courses/{course_id}", status_code=204)
def delete_course(course_id: int, db: Session = Depends(get_db), _=Depends(admin_only)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(course)
    db.commit()

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
    # Auto-naming logic: BSIT-3A, BSIT-3B...
    base_name = f"{payload.program}-{payload.year_level}"
    existing_sections = db.query(models.Section).filter(
        models.Section.section_name.like(f"{base_name}%")
    ).order_by(models.Section.section_name.desc()).all()
    
    next_letter = "A"
    if existing_sections:
        # Get the highest letter used so far
        last_names = [s.section_name for s in existing_sections]
        # Sort and get the last one
        last_names.sort()
        last_name = last_names[-1]
        last_char = last_name[-1]
        if last_char.isalpha():
            next_letter = chr(ord(last_char) + 1)
    
    section_name = f"{base_name}{next_letter}"

    blueprints = db.query(models.CurriculumBlueprint).filter_by(
        program=payload.program, year_level=payload.year_level
    ).all()
    if not blueprints:
        raise HTTPException(status_code=404, detail="No blueprint found for given program and year")

    section = models.Section(
        section_name=section_name,
        program=payload.program,
        year_level=payload.year_level,
        slot_limit=payload.slot_limit
    )
    db.add(section)
    db.flush()

    for bp in blueprints:
        sc = models.SectionCourse(section_id=section.id, course_id=bp.course_id)
        db.add(sc)

    db.commit()
    db.refresh(section)
    section.enrolled_count = 0
    return section

@router.put("/sections/{section_id}", response_model=schemas.SectionOut)
def update_section(section_id: int, payload: schemas.SectionUpdate, db: Session = Depends(get_db), _=Depends(admin_only)):
    section = db.query(models.Section).filter(models.Section.id == section_id).first()
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    if payload.slot_limit is not None:
        section.slot_limit = payload.slot_limit
    
    db.commit()
    db.refresh(section)
    section.enrolled_count = db.query(models.Enrollment).filter_by(section_id=section.id).count()
    return section

@router.delete("/sections/{section_id}", status_code=204)
def delete_section(section_id: int, db: Session = Depends(get_db), _=Depends(admin_only)):
    section = db.query(models.Section).filter(models.Section.id == section_id).first()
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    db.delete(section)
    db.commit()

@router.get("/sections", response_model=List[schemas.SectionOut])
def list_all_sections(db: Session = Depends(get_db), _=Depends(admin_only)):
    sections = db.query(models.Section).all()
    for s in sections:
        s.enrolled_count = db.query(models.Enrollment).filter_by(section_id=s.id).count()
    return sections

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
