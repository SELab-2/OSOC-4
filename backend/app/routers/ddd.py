""" This router is used to generate dummy data and insert it in the database """

from random import choice, randrange
from typing import List

from app.crud import clear_data
from app.database import get_session
from app.models.participation import Participation
from app.models.suggestion import Suggestion, SuggestionOption
from app.models.user import UserRole
from app.tests.utils_for_tests.EditionGenerator import EditionGenerator
from app.tests.utils_for_tests.ProjectGenerator import ProjectGenerator
from app.tests.utils_for_tests.SkillGenerator import SkillGenerator
from app.tests.utils_for_tests.StudentGenerator import StudentGenerator
from app.tests.utils_for_tests.UserGenerator import UserGenerator
from app.utils.response import response
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/ddd")


def generate_suggestions(student, student_skills, project, coaches, unconfirmed=3, confirmed_suggestion=None,
                         admin=None) -> List[Suggestion]:
    """ generate suggestions for student

    :return: the generated suggestions
    :rtype: List[Suggestion]
    """
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
    """add_dummy_data insert dummy data in the database

    :param session: session used to perform database operations, defaults to Depends(get_session)
    :type session: AsyncSession, optional
    :return: response message
    :rtype: response
    """

    await clear_data(session)

    #########
    # users #
    #########

    user_generator = UserGenerator(session)
    user_generator.generate_default_users()

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
    edition_generator.add_to_db()
    await session.commit()
    for d in edition_generator.data:
        await session.refresh(d)

    user_generator.add_to_db()

    project_generator = ProjectGenerator(session)
    project1, project2 = project_generator.generate_default_projects(edition.year)

    project1_skills = project_generator.generate_project_skills(project1, skills)
    project_generator.generate_project_skills(project2, skills)

    project_generator.add_to_db()

    student_generator = StudentGenerator(session, edition, skills)
    # generate students without suggestions
    student_generator.generate_students(50)
    student_generator.add_to_db()

    suggestions = []
    participations = []

    # generate students with conflicts in suggestions
    for s in SuggestionOption:
        for i in range(2):
            student = student_generator.generate_student()
            suggestions += generate_suggestions(student, skills, project1, coaches[:2], 5, s, choice(admins))
            suggestions += generate_suggestions(student, skills, project2, coaches[2:], 5, s, choice(admins))
            suggestions += generate_suggestions(student, skills, project2, coaches[2:], 5, s, choice(admins))

    # generate students that participate in a project
    for required_skill in project1_skills:
        for _ in range(randrange(required_skill.number)):
            student = student_generator.generate_student()
            participations.append(Participation(student=student, project=project1,
                                                skill=required_skill.skill))

    for suggestion in suggestions:
        session.add(suggestion)

    for participation in participations:
        session.add(participation)

    await session.commit()

    return response(None, "Dummy data inserted")


@router.delete("/", response_description="Data cleared")
async def clear_database(session: AsyncSession = Depends(get_session)):
    """clear_database clear the database

    :param session: session used to perform database operations, defaults to Depends(get_session)
    :type session: AsyncSession, optional
    """
    await clear_data(session)
