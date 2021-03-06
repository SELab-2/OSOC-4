""" This module includes all the project endpoints """

from app.config import config
from app.crud import read_all_where, read_where, update, update_all
from app.database import get_session, websocketManager
from app.exceptions.project_exceptions import ProjectNotFoundException
from app.models.participation import Participation, ParticipationOutProject
from app.models.project import (Project, ProjectCreate,
                                ProjectOutExtended, ProjectOutSimple,
                                ProjectRequiredSkill, RequiredSkillOut)
from app.models.suggestion import Suggestion
from app.models.user import UserRole
from app.utils.checkers import RoleChecker
from app.utils.response import response
from fastapi import APIRouter, Depends
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

router = APIRouter(prefix="/projects")


@router.post("/create", dependencies=[Depends(RoleChecker(UserRole.ADMIN))], response_description="Project data added into the database")
async def add_project_data(project: ProjectCreate, session: AsyncSession = Depends(get_session)) -> dict:
    """add_project_data add a new project

    :param project: the input data for the new project
    :type project: ProjectCreate
    :param session: the session object, defaults to Depends(get_session)
    :type session: AsyncSession, optional
    :return: the new project
    :rtype: dict
    """

    project_data = project.dict()
    required_skills = project_data.pop("required_skills", [])

    new_project = await update(Project.parse_obj(project_data), session=session)

    skills: [ProjectRequiredSkill] = [ProjectRequiredSkill(project=new_project,
                                                           skill_name=required_skill["skill_name"],
                                                           number=required_skill["number"])
                                      for required_skill in required_skills]

    await update_all(skills, session=session)
    return response(ProjectOutSimple.parse_raw(new_project.json()), "Project added successfully.")


@router.get("/{id}", dependencies=[Depends(RoleChecker(UserRole.COACH))], response_description="Project with id retrieved")
async def get_project_with_id(id: int, session: AsyncSession = Depends(get_session), Authorize: AuthJWT = Depends()) -> dict:
    """get_project_with_id get Project instance with id from the database

    :param id: the id of the project
    :type id: int
    :param session: the session object, defaults to Depends(get_session)
    :type session: AsyncSession, optional
    :param Authorize: needed to know who requested this, defaults to Depends()
    :type Authorize: AuthJWT, optional
    :raises ProjectNotFoundException: raised when the project isn't found
    :return: the project
    :rtype: dict
    """

    project = await read_where(Project, Project.id == int(id), session=session)
    if not project:
        raise ProjectNotFoundException()

    projectOutExtended = ProjectOutExtended.parse_raw(project.json())
    projectRequiredSkills = await session.execute(select(ProjectRequiredSkill).where(ProjectRequiredSkill.project_id == int(id)))
    projectOutExtended.required_skills = [RequiredSkillOut.parse_raw(s.json()) for (s,) in projectRequiredSkills.all()]
    projectParticipations = await session.execute(select(Participation).where(Participation.project_id == int(id)))
    projectOutExtended.participations = {s.student_id: ParticipationOutProject.parse_raw(s.json()) for (s,) in projectParticipations.all()}
    return projectOutExtended


@router.patch("/{id}", response_description="Project with id updated", dependencies=[Depends(RoleChecker(UserRole.ADMIN))])
async def update_project_with_id(id: int, updated_project: ProjectCreate, session: AsyncSession = Depends(get_session)) -> dict:
    """update_project_with_id get Project instance with id from the database

    :param id: the id of the project
    :type id: int
    :param updated_project: the updated data of the project
    :type updated_project: ProjectCreate
    :param session: the session object, defaults to Depends(get_session)
    :type session: AsyncSession, optional
    :raises ProjectNotFoundException: _description_
    :return: response message
    :rtype: dict
    """

    project = await read_where(Project, Project.id == id, session=session)
    if not project:
        raise ProjectNotFoundException()

    # update old data
    new_project_data = updated_project.dict(exclude_unset=True)
    required_skills = new_project_data.pop("required_skills", [])

    for key, value in new_project_data.items():
        setattr(project, key, value)
    await update(project, session)

    # remove old skills
    old_skills = await read_all_where(ProjectRequiredSkill, ProjectRequiredSkill.project_id == int(id), session=session)
    for skill in old_skills:
        await session.delete(skill)

    await session.commit()

    # add new skills
    skills = [ProjectRequiredSkill(project=project,
                                   skill_name=required_skill["skill_name"],
                                   number=required_skill["number"])
              for required_skill in required_skills]
    await update_all(skills, session=session)

    return response(None, "Project updated succesfully")


@router.delete("/{id}", response_description="Project with id deleted")
async def delete_project_with_id(id: int, role: RoleChecker(UserRole.ADMIN) = Depends(), session: AsyncSession = Depends(get_session), Authorize: AuthJWT = Depends()) -> None:
    """delete_project_with_id delete Project instance with id from the database
            also deletes the participations, requiredskills, suggestions


    :param id: the id of the project
    :type id: int
    :param role: the role of the user who requested this, defaults to Depends()
    :type role: RoleChecker, optional
    :param session: the session object, defaults to Depends(get_session)
    :type session: AsyncSession, optional
    :param Authorize: needed to know who requested this, defaults to Depends()
    :type Authorize: AuthJWT, optional
    :raises ProjectNotFoundException: raised when the project isn't found
    :return: None
    :rtype: dict
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

    # remove suggestions
    suggestions = await read_all_where(Suggestion, Suggestion.project_id == int(id), session=session)
    for suggestion in suggestions:
        await session.delete(suggestion)

    await session.delete(project)

    await session.commit()

    await websocketManager.broadcast({"deleted_project": config.api_url + "projects/" + str(id)})
