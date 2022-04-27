from app.config import config
from app.crud import read_where, read_all_where, update, update_all
from app.database import get_session
from app.exceptions.project_exceptions import ProjectNotFoundException
from app.models.project import (Project, ProjectCoach, ProjectCreate,
                                ProjectOutExtended, ProjectOutSimple)
from app.models.participation import Participation, ParticipationOutProject
from app.models.user import UserRole, User
from app.utils.checkers import RoleChecker
from app.utils.response import response
from app.models.project import ProjectRequiredSkill, RequiredSkillOut
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

    if role == UserRole.ADMIN:
        project = await read_where(Project, Project.id == int(id), session=session)
    else:
        current_user_id = Authorize.get_jwt_subject()
        stat = select(Project).select_from(ProjectCoach).where(ProjectCoach.coach_id == int(current_user_id)).join(Project).where(Project.id == int(id))
        res = await session.execute(stat)
        try:
            result = res.one()
            project = result[0]
        except Exception:
            raise ProjectNotFoundException()
    if not project:
        raise ProjectNotFoundException()

    projectOutExtended = ProjectOutExtended.parse_raw(project.json())
    projectUsers = await session.execute(select(User.id).join(ProjectCoach).where(ProjectCoach.project_id == int(id)))
    projectOutExtended.users = [f"{config.api_url}users/{id}" for (id,) in projectUsers.all()]
    projectRequiredSkills = await session.execute(select(ProjectRequiredSkill).where(ProjectRequiredSkill.project_id == int(id)))
    projectOutExtended.required_skills = [RequiredSkillOut.parse_raw(s.json()) for (s,) in projectRequiredSkills.all()]
    projectParticipations = await session.execute(select(Participation).where(Participation.project_id == int(id)))
    projectOutExtended.participations = [ParticipationOutProject.parse_raw(s.json()) for (s,) in projectParticipations.all()]
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
