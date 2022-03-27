from app.crud import read_all_where, read_where, update
from app.models.project import Project, ProjectOutExtended, ProjectOutSimple, ProjectCreate
from app.models.user import UserRole
from app.utils.checkers import RoleChecker
from app.utils.response import list_modeltype_response, response
from fastapi import APIRouter, Depends
from odmantic import ObjectId

router = APIRouter(prefix="/projects")
router.dependencies.append(Depends(RoleChecker(UserRole.COACH)))


@router.get("", response_description="Projects retrieved")
async def get_projects():
    """get_projects get all the Project instances from the database

    :return: list of projects
    :rtype: dict
    """

    results = await read_all_where(Project)
    return list_modeltype_response([ProjectOutSimple.parse_raw(r.json()) for r in results], Project)


@router.post("/create", dependencies=[Depends(RoleChecker(UserRole.ADMIN))], response_description="Project data added into the database")
async def add_user_data(project: ProjectCreate):
    """add_user_data add a new user

    :param project: defaults to Body(...)
    :type project: ProjectCreate, optional
    :return: data of new created project
    :rtype: dict
    """

    new_project = await update(Project.parse_obj(project))
    return response(ProjectOutSimple.parse_raw(new_project.json()), "Project added successfully.")


@router.get("/{id}", response_description="project with id retrieved")
async def get_project_with_id(id):
    """get_project_with_id get Project instance with id from the database

    :return: project with id
    :rtype: ProjectOutExtended
    """

    result = await read_where(Project, Project.id == ObjectId(id))
    return list_modeltype_response(ProjectOutExtended.parse_raw(result.json()), Project)
