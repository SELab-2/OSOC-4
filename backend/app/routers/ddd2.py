from random import choice, randrange, sample

from app.database import db
from app.models.edition import Edition
from app.models.project import Partner, Project, RequiredRole
from app.models.role import Role
from app.models.student_form import StudentForm
from app.models.user import User, UserRole
from app.utils.response import response
from fastapi import APIRouter

router = APIRouter(prefix="/ddd2")

roles = [Role(name="backend developer"), Role(name="frontend developer"), Role(name="UX designer")]

first_names = ["Eva", "Mark", "Jonathan", "Christine", "Sebatian", "Ava",
               "Blake", "Andrea", "Joanne", "Frank", "Emma", "Ruth", "Leah",
               "Jacob", "Megan", "Richard", "Piers", "Felicity", "Melanie",
               "Max", "Maria", "Anne", "Anne", "Charles", "Jacob"]
last_names = ["Andrews", "Hayes", "Martinez", "Evans", "Pratt", "Vaughan",
              "Roberts", "Forsyth", "Walker", "Baker", "Avery", "Davidson",
              "Wilkins", "Morrison", "Ball", "Paige", "Gray", "Marshall",
              "Langdon", "McLean", "James", "Anderson", "Clark", "Henderson",
              "Scott"]
emails = ["gmail.com", "outlook.com", "yahoo.com", "hotmail.com"]


def generate_user(role=UserRole.COACH, active=True, approved=True):
    first_name = choice(first_names)
    last_name = choice(last_names)
    email = choice(emails)
    return User(email=f"{first_name}.{last_name}@{email}".lower(),
                name=f"{first_name} {last_name}",
                password="a",
                role=role,
                active=active,
                approved=approved)


def generate_student(edition_id):
    first_name = choice(first_names)
    last_name = choice(last_names)
    email = choice(emails)
    random_roles = sample(roles, k=randrange(1, len(roles)))
    return StudentForm(name=f"{first_name} {last_name}",
                       email=f"{first_name}.{last_name}@{email}".lower(),
                       phonenumber=f"04{randrange(100):0>2} {randrange(1000):0>3} {randrange(1000):0>3}",
                       nickname=first_name,
                       questions=[],
                       roles=[role.id for role in random_roles],
                       edition=edition_id)


@router.get("/", response_description="Data retrieved")
async def ddd():
    coaches = [generate_user() for i in range(5)]

    partner = Partner(
        name="UGent",
        about="De C in UGent staat voor communicatie")

    edition = Edition(
        name="2019 Summer Fest",
        year=2019,
        user_ids=[coach.id for coach in coaches])

    project = Project(
        name="Student Volunteer Project",
        goals=["Goal 1", "Goal 2"],
        description="Free real estate",
        student_amount=7,
        partner=partner,
        user_ids=[coaches[i].id for i in range(2)],
        required_roles=[RequiredRole(role=roles[0].id, number=2),
                        RequiredRole(role=roles[1].id, number=3),
                        RequiredRole(role=roles[2].id, number=1)],
        edition=edition.id)

    students = [generate_student(edition.id) for _ in range(10)]

    for role in roles:
        await db.engine.save(role)
    for coach in coaches:
        await db.engine.save(coach)
    await db.engine.save(edition)
    await db.engine.save(project)
    for student in students:
        await db.engine.save(student)

    return response(None, "Dummy data inserted")
