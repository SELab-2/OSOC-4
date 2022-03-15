import datetime
from asyncore import read

from app.crud import read_all, read_where, update
from app.exceptions.edition_exceptions import (AlreadyEditionWithYearException,
                                               YearAlreadyOverException)
from app.models.edition import Edition
from app.models.user import UserRole
from app.utils.checkers import RoleChecker
from app.utils.response import errorresponse, list_modeltype_response, response
from fastapi import APIRouter, Body, Depends

router = APIRouter(prefix="/editions")


@router.get("/", dependencies=[Depends(RoleChecker(UserRole.ADMIN))], response_description="Editions retrieved")
async def get_editions():
    """get_editions get all the Edition instances from the database

    :return: list of editions
    :rtype: dict
    """
    results = await read_all(Edition)
    return list_modeltype_response(results, Edition)


@router.post("/create", dependencies=[Depends(RoleChecker(UserRole.ADMIN))], response_description="Created a new edition")
async def create_edition(edition: Edition = Body(...)):
    """create_edition creates a new edition in the database

    :param edition: defaults to Body(...)
    :type edition: Edition, optional
    :return: data of newly created edition
    :rtype: dict
    """
    if edition.year is None or edition.year == "" or int(edition.year) < datetime.date.today().year:
        raise YearAlreadyOverException()
    # check if an edition with the same year is already present
    if await read_where(Edition, Edition.year == edition.year):
        raise AlreadyEditionWithYearException(edition.year)

    new_edition = await update(Edition.parse_obj(edition))
    return response(new_edition, "Edition added successfully.")


# todo: only coaches from same edition may view the edition
@router.get("/{year}", dependencies=[Depends(RoleChecker(UserRole.COACH))], response_description="Editions retrieved")
async def get_edition(year):
    """get_edition get the Edition instance with given year

    :return: list of editions
    :rtype: dict
    """
    edition = await read_where(Edition, Edition.year == int(year))
    if not edition:
        return errorresponse(None, 400, "Edition not found")
    return response(edition, "Edition successfully retrieved")


@router.post("/{year}", dependencies=[Depends(RoleChecker(UserRole.COACH))], response_description="Editions retrieved")
async def update_edition(year, edition: Edition = Body(...)):
    """update_edition update the Edition instance with given year

    :return: the updated edition
    :rtype: dict
    """
    if not year == edition.year:
        return errorresponse(None, 400, "Edition can't change it's year")

    results = await read_where(Edition, Edition.id == edition.id)
    if not results:
        return errorresponse(None, 400, "Edition not found")
    return response(results, "Edition successfully retrieved")
