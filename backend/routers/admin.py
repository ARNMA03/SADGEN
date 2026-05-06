from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List
from database import get_db
from auth import hash_password, require_role
from datetime import datetime
import models, schemas

router = APIRouter(prefix="/api/admin", tags=["Admin"])
admin_only = require_role("Admin")

@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db), _=Depends(admin_only)):
    total_slots = db.query(func.sum(models.Section.slot_limit)).scalar() or 0
    total_enrolled = db.query(models.Enrollment).count()
    # Count unique (program, year) combinations
    total_blueprints = db.query(models.CurriculumBlueprint.program, models.CurriculumBlueprint.year_level).filter(models.CurriculumBlueprint.is_deleted == False).distinct().count()
    total_courses = db.query(models.Course).filter(models.Course.is_deleted == False).count()
    
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
    users = db.query(models.User).filter(models.User.is_deleted == False).all()
    for u in users:
        if u.role == models.RoleEnum.student and u.enrollments:
            u.enrolled_section = u.enrollments[0].section.section_name
    return users

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
def delete_user(user_id: int, db: Session = Depends(get_db), current_user=Depends(admin_only)):
    user = db.query(models.User).filter(models.User.id == user_id, models.User.is_deleted == False).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Guard: Dependency Check (Enrollments)
    has_enrollments = db.query(models.Enrollment).filter_by(student_id=user_id).first()
    if has_enrollments:
        raise HTTPException(status_code=400, detail="Cannot remove user. Student is currently enrolled in sections. Unenroll them first.")
    
    # Protect Admins from being deleted via dashboard
    if user.role == models.RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Admin accounts cannot be deleted through the portal.")

    try:
        user.is_deleted = True
        user.deleted_at = datetime.utcnow()
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="Cannot delete user.")

@router.put("/users/{user_id}", response_model=schemas.UserOut)
def update_user(user_id: int, payload: schemas.UserUpdate, db: Session = Depends(get_db), current_user=Depends(admin_only)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    data = payload.model_dump(exclude_unset=True)
    
    # Security: Disable ability to change any Admin account or own account to other roles
    if "role" in data and user.role == models.RoleEnum.admin:
        if data["role"] != models.RoleEnum.admin:
             raise HTTPException(status_code=403, detail="Admin roles cannot be changed to other roles.")

    # Action Item: Clear program and year level if role changes from Student to Prof/Admin
    if "role" in data and data["role"] != models.RoleEnum.student:
        user.program = None
        user.year_level = None

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
    return db.query(models.Course).filter(models.Course.is_deleted == False).all()

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
    course = db.query(models.Course).filter(models.Course.id == course_id, models.Course.is_deleted == False).first()
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
    course = db.query(models.Course).filter(models.Course.id == course_id, models.Course.is_deleted == False).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Guard: Dependency Check (Blueprints)
    is_in_blueprint = db.query(models.CurriculumBlueprint).filter_by(course_id=course_id, is_deleted=False).first()
    if is_in_blueprint:
        raise HTTPException(status_code=400, detail="Cannot remove course. It is currently part of an active curriculum blueprint.")

    course.is_deleted = True
    course.deleted_at = datetime.utcnow()
    db.commit()

# ─── Curriculum Blueprints ────────────────────────────────────────────────────

@router.get("/blueprints", response_model=List[schemas.BlueprintOut])
def list_blueprints(db: Session = Depends(get_db), _=Depends(admin_only)):
    return db.query(models.CurriculumBlueprint).filter(models.CurriculumBlueprint.is_deleted == False).all()

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
    
    # Sync: Add this course to all existing sections of this program/year
    sections = db.query(models.Section).filter_by(program=payload.program, year_level=payload.year_level).all()
    for sec in sections:
        # Check if already exists to avoid unique constraint error
        exists = db.query(models.SectionCourse).filter_by(section_id=sec.id, course_id=payload.course_id).first()
        if not exists:
            db.add(models.SectionCourse(section_id=sec.id, course_id=payload.course_id))

    db.commit()
    db.refresh(bp)
    return bp

@router.post("/blueprints/sync")
def sync_blueprint_courses(program: str, year_level: int, course_ids: List[int], db: Session = Depends(get_db), _=Depends(admin_only)):
    # Get current active entries
    current_entries = db.query(models.CurriculumBlueprint).filter_by(program=program, year_level=year_level, is_deleted=False).all()
    current_ids = {e.course_id for e in current_entries}
    target_ids = set(course_ids)

    # 1. Add new courses
    to_add = target_ids - current_ids
    for cid in to_add:
        # Check if course exists
        if db.query(models.Course).filter_by(id=cid, is_deleted=False).first():
            db.add(models.CurriculumBlueprint(program=program, year_level=year_level, course_id=cid))
            # Sync to sections
            sections = db.query(models.Section).filter_by(program=program, year_level=year_level).all()
            for sec in sections:
                if not db.query(models.SectionCourse).filter_by(section_id=sec.id, course_id=cid).first():
                    db.add(models.SectionCourse(section_id=sec.id, course_id=cid))

    # 2. Remove courses not in target
    to_remove_ids = current_ids - target_ids
    if to_remove_ids:
        # Remove from sections
        section_ids = [s.id for s in db.query(models.Section).filter_by(program=program, year_level=year_level).all()]
        if section_ids:
            db.query(models.SectionCourse).filter(
                models.SectionCourse.section_id.in_(section_ids),
                models.SectionCourse.course_id.in_(list(to_remove_ids))
            ).delete(synchronize_session=False)
        
        # Hard delete blueprint entries (as they are just properties of the "Blueprint Group")
        db.query(models.CurriculumBlueprint).filter(
            models.CurriculumBlueprint.program == program,
            models.CurriculumBlueprint.year_level == year_level,
            models.CurriculumBlueprint.course_id.in_(list(to_remove_ids))
        ).delete(synchronize_session=False)

    db.commit()
    return {"message": "Blueprint synchronized"}

@router.put("/blueprints/group")
def update_blueprint_group(old_program: str, old_year: int, new_program: str, new_year: int, db: Session = Depends(get_db), _=Depends(admin_only)):
    # 1. Update the identity of all blueprint entries
    db.query(models.CurriculumBlueprint).filter_by(program=old_program, year_level=old_year, is_deleted=False).update({
        "program": new_program, "year_level": new_year
    }, synchronize_session=False)
    
    # 2. Identify sections that were matching the old identity
    old_sections = db.query(models.Section).filter_by(program=old_program, year_level=old_year).all()
    if old_program != new_program or old_year != new_year:
        # Clear courses for sections that are now without their specific blueprint
        for sec in old_sections:
            db.query(models.SectionCourse).filter_by(section_id=sec.id).delete(synchronize_session=False)
    
    # 3. Identify sections matching the new identity and sync them
    new_sections = db.query(models.Section).filter_by(program=new_program, year_level=new_year).all()
    new_courses = db.query(models.CurriculumBlueprint).filter_by(program=new_program, year_level=new_year, is_deleted=False).all()
    course_ids = [c.course_id for c in new_courses]
    
    for sec in new_sections:
        # Re-populate section courses based on the updated blueprint
        for cid in course_ids:
            if not db.query(models.SectionCourse).filter_by(section_id=sec.id, course_id=cid).first():
                db.add(models.SectionCourse(section_id=sec.id, course_id=cid))
    
    db.commit()
    return {"message": "Group updated and sections synchronized"}

@router.delete("/blueprints/group")
def delete_blueprint_group(program: str, year_level: int, db: Session = Depends(get_db), _=Depends(admin_only)):
    # Guard: Dependency Check (Sections)
    has_sections = db.query(models.Section).filter_by(program=program, year_level=year_level).first()
    if has_sections:
        raise HTTPException(status_code=400, detail=f"Cannot remove curriculum. There are active sections assigned to {program} Year {year_level}.")

    items = db.query(models.CurriculumBlueprint).filter_by(program=program, year_level=year_level, is_deleted=False).all()
    now = datetime.utcnow()
    for it in items:
        it.is_deleted = True
        it.deleted_at = now
    db.commit()
    return {"message": "Group deleted"}

@router.delete("/blueprints/{blueprint_id}", status_code=204)
def delete_blueprint(blueprint_id: int, db: Session = Depends(get_db), _=Depends(admin_only)):
    bp = db.query(models.CurriculumBlueprint).filter(models.CurriculumBlueprint.id == blueprint_id, models.CurriculumBlueprint.is_deleted == False).first()
    if not bp:
        raise HTTPException(status_code=404, detail="Blueprint not found")
    
    # Sync: Remove this course from all sections of this program/year
    db.query(models.SectionCourse).filter(
        models.SectionCourse.section_id.in_(
            db.query(models.Section.id).filter_by(program=bp.program, year_level=bp.year_level)
        ),
        models.SectionCourse.course_id == bp.course_id
    ).delete(synchronize_session=False)

    bp.is_deleted = True
    bp.deleted_at = datetime.utcnow()
    db.commit()

# ─── Section Generation ───────────────────────────────────────────────────────

@router.post("/generate-section", response_model=schemas.SectionOut, status_code=201)
def generate_section(payload: schemas.GenerateSectionRequest, db: Session = Depends(get_db), _=Depends(admin_only)):
    # Auto-naming logic: BSIT-3A, BSIT-A, etc.
    year_part = f"-{payload.year_level}" if payload.year_level else ""
    base_name = f"{payload.program}{year_part}"
    
    existing_sections = db.query(models.Section).filter(
        models.Section.section_name.like(f"{base_name}%")
    ).order_by(models.Section.section_name.desc()).all()
    
    # Smart Naming: Find the first available letter in alphabetical order
    used_letters = set()
    for s in existing_sections:
        suffix = s.section_name[len(base_name):]
        if suffix and suffix[0].isalpha():
            used_letters.add(suffix[0].upper())
    
    next_letter = "A"
    for char_code in range(ord('A'), ord('Z') + 1):
        candidate = chr(char_code)
        if candidate not in used_letters:
            next_letter = candidate
            break
    
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
    # Guard: Strictly block only if students are enrolled
    has_enrollments = db.query(models.Enrollment).filter_by(section_id=section_id).first()
    if has_enrollments:
        raise HTTPException(status_code=400, detail="Cannot delete section. There are students currently enrolled. Unenroll all students first.")
    
    try:
        db.delete(section)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error deleting section: {str(e)}")

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

@router.post("/unenroll/{user_id}", status_code=200)
def unenroll_student(user_id: int, db: Session = Depends(get_db), _=Depends(admin_only)):
    enrollment = db.query(models.Enrollment).filter(models.Enrollment.student_id == user_id).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found for this user")
    db.delete(enrollment)
    db.commit()
    return {"message": "Student unenrolled successfully"}

# ─── Recycle Bin ──────────────────────────────────────────────────────────────

@router.get("/trash")
def get_trash(db: Session = Depends(get_db), _=Depends(admin_only)):
    users = db.query(models.User).filter_by(is_deleted=True).all()
    courses = db.query(models.Course).filter_by(is_deleted=True).all()
    blueprints = db.query(models.CurriculumBlueprint).filter_by(is_deleted=True).options(joinedload(models.CurriculumBlueprint.course)).all()
    
    return {
        "users": users,
        "courses": courses,
        "blueprints": blueprints
    }

@router.post("/restore/{item_type}/{item_id}")
def restore_item(item_type: str, item_id: int, db: Session = Depends(get_db), _=Depends(admin_only)):
    model = None
    if item_type == "user": model = models.User
    elif item_type == "course": model = models.Course
    elif item_type == "blueprint": model = models.CurriculumBlueprint
    
    if not model: raise HTTPException(status_code=400, detail="Invalid item type")
    
    item = db.query(model).filter_by(id=item_id, is_deleted=True).first()
    if not item: raise HTTPException(status_code=404, detail="Item not found in trash")
    
    item.is_deleted = False
    item.deleted_at = None
    db.commit()
    return {"message": "Restored successfully"}

@router.delete("/purge/{item_type}/{item_id}")
def purge_item(item_type: str, item_id: int, db: Session = Depends(get_db), _=Depends(admin_only)):
    model = None
    if item_type == "user": model = models.User
    elif item_type == "course": model = models.Course
    elif item_type == "blueprint": model = models.CurriculumBlueprint
    
    if not model: raise HTTPException(status_code=400, detail="Invalid item type")
    
    item = db.query(model).filter_by(id=item_id, is_deleted=True).first()
    if not item: raise HTTPException(status_code=404, detail="Item not found in trash")
    
    try:
        db.delete(item)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="Cannot permanently delete item. It may have dependencies.")
    
    return {"message": "Permanently deleted"}
