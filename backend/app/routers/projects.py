from app.crud import read_all_where, read_where
from app.models.project import Project, ProjectOutExtended, ProjectOutSimple
from app.utils.response import list_modeltype_response
from fastapi import APIRouter
from odmantic import ObjectId

router = APIRouter(prefix="/projects")


@router.get("", response_description="Projects retrieved")
async def get_projects():
    """get_projects get all the Project instances from the database

    :return: list of projects
    :rtype: dict
    """

    results = await read_all_where(Project)
    return list_modeltype_response([ProjectOutSimple.parse_raw(r.json()) for r in results], Project)


@router.get("/{id}", response_description="project with id retrieved")
async def get_project_with_id(id):
    """get_project_with_id get Project instance with id from the database

    :return: project with id
    :rtype: ProjectOutExtended
    """

    result = await read_where(Project, Project.id == ObjectId(id))
    return list_modeltype_response(ProjectOutExtended.parse_raw(result.json()), Project)
