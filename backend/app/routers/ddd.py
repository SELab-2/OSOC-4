from random import choice, randrange, sample

from app.crud import clear_data, update
from app.database import get_session
from app.models.participation import Participation
from app.models.project import Project, ProjectRequiredSkill
from app.models.suggestion import Suggestion, SuggestionOption
from app.models.user import UserRole
from app.tests.utils_for_tests.EditionGenerator import EditionGenerator
from app.tests.utils_for_tests.SkillGenerator import SkillGenerator
from app.tests.utils_for_tests.StudentGenerator import StudentGenerator
from app.tests.utils_for_tests.UserGenerator import UserGenerator
from app.utils.response import response
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/ddd")


def generate_suggestions(student, student_skills, project, coaches, unconfirmed=3, confirmed_suggestion=None,
                         admin=None):
    suggestions = [Suggestion(
        mail_sent=False,
        decision=choice(list(SuggestionOption)),
        reason="reason x",
        student=student,
        suggested_by=choice(coaches),
        project=project,
        skill=choice(student_skills)) for _ in range(unconfirmed)]

    if confirmed_suggestion is not None and admin is not None:
        suggestions.append(Suggestion(
            mail_sent=True,
            decision=confirmed_suggestion,
            reason="reason x",
            student=student,
            suggested_by=admin,
            project=project,
            skill=choice(student_skills)))

    return suggestions


@router.get("/", response_description="Data cleared and reinserted")
async def add_dummy_data(session: AsyncSession = Depends(get_session)):
    await clear_data(session)

    #########
    # users #
    #########

    user_generator = UserGenerator(session)

    user_generator.generate_user(role=UserRole.COACH, active=False, approved=False, disabled=False),
    user_generator.generate_user(role=UserRole.COACH, active=True, approved=False, disabled=False),
    user_generator.generate_user(role=UserRole.COACH, active=True, approved=True, disabled=False),
    user_generator.generate_user(role=UserRole.COACH, active=True, approved=True, disabled=True)

    admins = user_generator.generate_users(2, role=UserRole.ADMIN)
    coaches = [user for user in user_generator.data
               if user.role == UserRole.COACH and user.active and user.approved and not user.disabled]
    coaches.extend(user_generator.generate_users(5, role=UserRole.COACH))

    ##########
    # skills #
    ##########

    skill_generator = SkillGenerator(session)
    skills = skill_generator.generate_skills()

    ############
    # Editions #
    ############

    edition_generator = EditionGenerator(session)
    edition = edition_generator.generate_edition(2022, coaches)
    await edition_generator.add_to_db()

    await user_generator.add_to_db()

    project = Project(
        name="Student Volunteer Project",
        goals="Teach students about creating open source projects",
        description="Innovative open source projects, made by incredibly motivated students, coaches & organisations.",
        partner_name="UGent",
        partner_description="Universiteit Gent",
        coaches=coaches[:2],
        edition=edition.year)

    project1_skills = [ProjectRequiredSkill(
        number=randrange(2, 5),
        project=project,
        skill=skill)
        for skill in skills]

    project2 = Project(
        name="Cyberfest",
        goals="Goal 1\nGoal 2",
        description="Hackers & Cyborgs",
        partner_name="HoGent",
        partner_description="Hogeschool Gent",
        coaches=coaches[2:],
        edition=edition.year)
    await update(project, session)

    project2_skills = [ProjectRequiredSkill(
        number=randrange(1, 8),
        project=project2,
        skill=skill)
        for skill in sample(skills, k=randrange(3, len(skills)))]

    student_generator = StudentGenerator(session, edition, skills)
    # generate students without suggestions
    student_generator.generate_students(3)
    await student_generator.add_to_db()

    suggestions = []
    participations = []

    # generate students with conflicts in suggestions
    for s in SuggestionOption:
        for i in range(2):
            student = student_generator.generate_student()
            suggestions += generate_suggestions(student, skills, project, coaches[:2], 5, s, choice(admins))
            suggestions += generate_suggestions(student, skills, project2, coaches[2:], 5, s, choice(admins))
            suggestions += generate_suggestions(student, skills, project2, coaches[2:], 5, s, choice(admins))

    # generate students that participate in a project
    for required_skill in project1_skills:
        for _ in range(randrange(required_skill.number)):
            student = student_generator.generate_student()
            participations.append(Participation(student=student, project=project,
                                                skill=required_skill.skill))

    session.add(project)
    session.add(project2)

    for skill in project1_skills:
        session.add(skill)
    for skill in project2_skills:
        session.add(skill)


    for suggestion in suggestions:
        session.add(suggestion)

    for participation in participations:
        session.add(participation)

    return response(None, "Dummy data inserted")


@router.delete("/", response_description="Data cleared")
async def clear_database(session: AsyncSession = Depends(get_session)):
    await clear_data(session)
