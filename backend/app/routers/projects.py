from app.crud import read_where, update
from app.database import get_session
from app.exceptions.project_exceptions import ProjectNotFoundException
from app.models.project import (Project, ProjectCoach, ProjectCreate,
                                ProjectOutExtended, ProjectOutSimple)
from app.models.user import UserRole
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

    new_project = await update(Project.parse_obj(project), session=session)
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

    return ProjectOutExtended.parse_raw(project.json())


@router.patch("/{id}", response_description="Project with id updated", dependencies=[Depends(RoleChecker(UserRole.ADMIN))])
async def update_project_with_id(id: int, updated_project: ProjectCreate, session: AsyncSession = Depends(get_session)):
    """update_project_with_id get Project instance with id from the database

    :return: project with id
    :rtype: ProjectOutExtended
    """

    project = await read_where(Project, Project.id == id, session=session)
    if project:
        new_project_data = updated_project.dict(exclude_unset=True)
        for key, value in new_project_data.items():
            setattr(project, key, value)
        await update(project, session)
        return response(None, "Project updated succesfully")

    raise ProjectNotFoundException()
