from app.crud import read_all
from app.models.project import Project
from app.utils.response import list_modeltype_response
from fastapi import APIRouter

router = APIRouter(prefix="/projects")


@router.get("/", response_description="Projects retrieved")
async def get_projects():
    """get_projects get all the Project instances from the database

    :return: list of projects
    :rtype: dict
    """
    results = await read_all(Project)
    return list_modeltype_response(results, Project)
