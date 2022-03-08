from fastapi import APIRouter

from app.crud.base_crud import read_all
from app.models.project import Project
from app.utils.response import list_modeltype_response


router = APIRouter(prefix="/projects")


@router.get("/", response_description="Projects retrieved")
async def get_projects():
    """get_projects get all the Project instances from the database

    :return: list of projects
    :rtype: dict
    """
    results = await read_all(Project)
    list_modeltype_response(results, Project)
