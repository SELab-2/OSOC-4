from app.config import config
from app.crud import read_all_where, read_where, update, update_all
from app.database import get_session
from app.exceptions.permissions import NotPermittedException
from app.exceptions.project_exceptions import ProjectNotFoundException
from app.models.participation import Participation, ParticipationOutProject
from app.models.project import (Project, ProjectCoach, ProjectCreate,
                                ProjectOutExtended, ProjectOutSimple,
                                ProjectRequiredSkill, RequiredSkillOut)
from app.models.suggestion import Suggestion
from app.models.user import User, UserRole
from app.utils.checkers import RoleChecker
from app.utils.response import response
from fastapi import APIRouter, Depends
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

router = APIRouter(prefix="/projects")


@router.post("/create", dependencies=[Depends(RoleChecker(UserRole.ADMIN))], response_description="Project data added into the database")
async def add_project_data(project: ProjectCreate, session: AsyncSession = Depends(get_session)):
    """add_project_data add a new project

    :param project: defaults to Body(...)
    :type project: ProjectCreate, optional
    :return: data of new created project
    :rtype: dict
    """

    project_data = project.dict()
    required_skills = project_data.pop("required_skills", [])
    user_ids = project_data.pop("users", [])

    new_project = await update(Project.parse_obj(project_data), session=session)

    skills = [ProjectRequiredSkill(project=new_project,
                                   skill_name=required_skill["skill_name"],
                                   number=required_skill["number"])
              for required_skill in required_skills]
    users = [ProjectCoach(project_id=new_project.id, coach_id=user_id) for user_id in user_ids]

    await update_all(skills, session=session)
    await update_all(users, session=session)
    return response(ProjectOutSimple.parse_raw(new_project.json()), "Project added successfully.")


@router.get("/{id}", response_description="Project with id retrieved")
async def get_project_with_id(id: int, role: RoleChecker(UserRole.COACH) = Depends(), session: AsyncSession = Depends(get_session), Authorize: AuthJWT = Depends()):
    """get_project_with_id get Project instance with id from the database

    :return: project with id
    :rtype: ProjectOutExtended
    """

    project = await read_where(Project, Project.id == int(id), session=session)
    if not project:
        raise ProjectNotFoundException()

    projectUsers = (
        await session.execute(select(User.id).join(ProjectCoach).where(ProjectCoach.project_id == int(id)))
    ).all()

    if role == UserRole.COACH:
        current_user_id = Authorize.get_jwt_subject()
        if (current_user_id,) not in projectUsers:
            raise NotPermittedException()

    projectOutExtended = ProjectOutExtended.parse_raw(project.json())
    projectOutExtended.users = [f"{config.api_url}users/{id}" for (id,) in projectUsers]
    projectRequiredSkills = await session.execute(select(ProjectRequiredSkill).where(ProjectRequiredSkill.project_id == int(id)))
    projectOutExtended.required_skills = [RequiredSkillOut.parse_raw(s.json()) for (s,) in projectRequiredSkills.all()]
    projectParticipations = await session.execute(select(Participation).where(Participation.project_id == int(id)))
    projectOutExtended.participations = {s.student_id: ParticipationOutProject.parse_raw(s.json()) for (s,) in projectParticipations.all()}
    return projectOutExtended


@router.patch("/{id}", response_description="Project with id updated", dependencies=[Depends(RoleChecker(UserRole.ADMIN))])
async def update_project_with_id(id: int, updated_project: ProjectCreate, session: AsyncSession = Depends(get_session)):
    """update_project_with_id get Project instance with id from the database

    :return: project with id
    :rtype: ProjectOutExtended
    """

    project = await read_where(Project, Project.id == id, session=session)
    if not project:
        raise ProjectNotFoundException()

    # update old data
    new_project_data = updated_project.dict(exclude_unset=True)
    required_skills = new_project_data.pop("required_skills", [])
    user_ids = new_project_data.pop("users", [])

    for key, value in new_project_data.items():
        setattr(project, key, value)
    await update(project, session)

    # remove old skills and users
    old_skills = await read_all_where(ProjectRequiredSkill, ProjectRequiredSkill.project_id == int(id), session=session)
    for skill in old_skills:
        await session.delete(skill)

    old_users = await read_all_where(ProjectCoach, ProjectCoach.project_id == int(id), session=session)
    for user in old_users:
        await session.delete(user)

    await session.commit()

    # add new skills and users
    skills = [ProjectRequiredSkill(project=project,
                                   skill_name=required_skill["skill_name"],
                                   number=required_skill["number"])
              for required_skill in required_skills]
    await update_all(skills, session=session)

    users = [ProjectCoach(project_id=project.id, coach_id=user_id) for user_id in user_ids]
    await update_all(users, session=session)

    return response(None, "Project updated succesfully")


@router.delete("/{id}", response_description="Project with id deleted")
async def delete_project_with_id(id: int, role: RoleChecker(UserRole.ADMIN) = Depends(), session: AsyncSession = Depends(get_session), Authorize: AuthJWT = Depends()):
    """delete_project_with_id delete Project instance with id from the database
            also deletes the participations, requiredskills, projectcoaches, suggestions
    """
    project = await read_where(Project, Project.id == id, session=session)
    if not project:
        raise ProjectNotFoundException()
    
    # remove participations
    participations = await read_all_where(Participation, Participation.project_id == int(id), session=session)
    for participation in participations:
        await session.delete(participation)

    # remove skills
    skills = await read_all_where(ProjectRequiredSkill, ProjectRequiredSkill.project_id == int(id), session=session)
    for skill in skills:
        await session.delete(skill)

    # remove users
    users = await read_all_where(ProjectCoach, ProjectCoach.project_id == int(id), session=session)
    for user in users:
        await session.delete(user)
    
    # remove suggestions
    suggestions = await read_all_where(Suggestion, Suggestion.project_id == int(id), session=session)
    for suggestion in suggestions:
        await session.delete(suggestion)


    await session.delete(project)

    await session.commit()
