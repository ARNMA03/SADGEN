"""
Seed the database with demo data for all three roles.

Credentials:
  Admin   → admin@sadgen.edu       / admin123
  Prof 1  → reyes@sadgen.edu       / prof123
  Prof 2  → santos@sadgen.edu      / prof123
  Student → juan@sadgen.edu        / student123  (BSCS Year 2)
  Student → maria@sadgen.edu       / student123  (BSCS Year 2)
  Student → pedro@sadgen.edu       / student123  (BSIT Year 1)
"""

from database import SessionLocal, engine
import models
from auth import hash_password

models.Base.metadata.create_all(bind=engine)
db = SessionLocal()

def seed():
    if db.query(models.User).first():
        print("DB already seeded. Skipping.")
        return

    # ── Users ─────────────────────────────────────────────
    admin = models.User(name="System Admin", email="admin@sadgen.edu",
                        password_hash=hash_password("admin123"), role=models.RoleEnum.admin)
    prof1 = models.User(name="Prof. Ana Reyes", email="reyes@sadgen.edu",
                        password_hash=hash_password("prof123"), role=models.RoleEnum.professor)
    prof2 = models.User(name="Prof. Ben Santos", email="santos@sadgen.edu",
                        password_hash=hash_password("prof123"), role=models.RoleEnum.professor)
    s1 = models.User(name="Juan dela Cruz", email="juan@sadgen.edu",
                     password_hash=hash_password("student123"), role=models.RoleEnum.student,
                     program="BSCS", year_level=2)
    s2 = models.User(name="Maria Garcia", email="maria@sadgen.edu",
                     password_hash=hash_password("student123"), role=models.RoleEnum.student,
                     program="BSCS", year_level=2)
    s3 = models.User(name="Pedro Reyes", email="pedro@sadgen.edu",
                     password_hash=hash_password("student123"), role=models.RoleEnum.student,
                     program="BSIT", year_level=1)

    db.add_all([admin, prof1, prof2, s1, s2, s3])
    db.flush()

    # ── Courses ───────────────────────────────────────────
    courses_data = [
        ("Human-Computer Interaction 2", "HCI2"),
        ("Data Structures & Algorithms", "DSA"),
        ("Database Management Systems", "DBMS"),
        ("Object-Oriented Programming", "OOP"),
        ("Discrete Mathematics", "DISMATH"),
        ("Introduction to Programming", "INPROG"),
        ("Computer Organization", "COMPORG"),
        ("Web Development Fundamentals", "WEBDEV"),
    ]
    course_objs = {}
    for name, code in courses_data:
        c = models.Course(course_name=name, course_code=code)
        db.add(c)
        db.flush()
        course_objs[code] = c

    # ── Blueprints: BSCS Year 2 ───────────────────────────
    bscs2_courses = ["HCI2", "DSA", "DBMS", "OOP", "DISMATH"]
    for code in bscs2_courses:
        db.add(models.CurriculumBlueprint(
            program="BSCS", year_level=2, course_id=course_objs[code].id
        ))

    # ── Blueprints: BSIT Year 1 ───────────────────────────
    bsit1_courses = ["INPROG", "COMPORG", "WEBDEV", "DISMATH"]
    for code in bsit1_courses:
        db.add(models.CurriculumBlueprint(
            program="BSIT", year_level=1, course_id=course_objs[code].id
        ))
    db.flush()

    # ── Sections: BSCS Year 2 ─────────────────────────────
    sec_a = models.Section(section_name="BSCS-2A", program="BSCS", year_level=2)
    sec_b = models.Section(section_name="BSCS-2B", program="BSCS", year_level=2)
    sec_c = models.Section(section_name="BSIT-1A", program="BSIT", year_level=1)
    db.add_all([sec_a, sec_b, sec_c])
    db.flush()

    # ── Section Courses for BSCS-2A ───────────────────────
    prof_assign = {
        "HCI2": prof1.id, "DSA": prof2.id, "DBMS": prof1.id,
        "OOP": prof2.id, "DISMATH": prof1.id
    }
    for code in bscs2_courses:
        db.add(models.SectionCourse(
            section_id=sec_a.id,
            course_id=course_objs[code].id,
            professor_id=prof_assign[code]
        ))

    # ── Section Courses for BSCS-2B ───────────────────────
    for code in bscs2_courses:
        db.add(models.SectionCourse(
            section_id=sec_b.id,
            course_id=course_objs[code].id,
            professor_id=prof_assign.get(code)
        ))

    # ── Section Courses for BSIT-1A ───────────────────────
    bsit_assign = {"INPROG": prof2.id, "COMPORG": prof1.id, "WEBDEV": prof2.id, "DISMATH": prof1.id}
    for code in bsit1_courses:
        db.add(models.SectionCourse(
            section_id=sec_c.id,
            course_id=course_objs[code].id,
            professor_id=bsit_assign[code]
        ))

    db.commit()
    print("✅ Database seeded successfully!")
    print("\nDemo credentials:")
    print("  Admin:     admin@sadgen.edu / admin123")
    print("  Prof 1:    reyes@sadgen.edu / prof123")
    print("  Prof 2:    santos@sadgen.edu / prof123")
    print("  Student 1: juan@sadgen.edu / student123  (BSCS Yr2)")
    print("  Student 2: maria@sadgen.edu / student123  (BSCS Yr2)")
    print("  Student 3: pedro@sadgen.edu / student123  (BSIT Yr1)")

if __name__ == "__main__":
    seed()
    db.close()
