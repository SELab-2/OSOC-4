from app.crud import read_all, read_where, update
from app.database import db
from app.exceptions.partner_exceptions import (NameAlreadyUsedException,
                                               PartnerNotFoundException)
from app.exceptions.permissions import NotPermittedException
from app.models.partner import Partner
from app.models.project import Project
from app.models.user import UserRole
from app.utils.checkers import RoleChecker
from app.utils.response import list_modeltype_response, response
from fastapi import APIRouter, Body, Depends
from fastapi_jwt_auth import AuthJWT
from odmantic import ObjectId

router = APIRouter(prefix="/partners")


@router.get("/", dependencies=[Depends(RoleChecker(UserRole.ADMIN))], response_description="Partners retrieved")
async def get_partners():
    """get_partners get all the Partner instances from the database

    :return: list of partners
    :rtype: dict
    """
    results = await read_all(Partner)
    return list_modeltype_response(results, Partner)


@router.post("/create", dependencies=[Depends(RoleChecker(UserRole.ADMIN))], response_description="Partner data added into the database")
async def add_partner_data(partner: Partner = Body(...)):
    """add_partner_data add a new partner

    :param partner: defaults to Body(...)
    :type partner: Partner, optional
    :return: data of newly created partner
    :rtype: dict
    """

    # check if a partner with the same name is already present
    if await read_where(Partner, Partner.name == partner.name):
        raise NameAlreadyUsedException()

    new_partner = await update(Partner.parse_obj(partner))
    return response(new_partner, "Partner added successfully.")


@router.post("/{id}", dependencies=[Depends(RoleChecker(UserRole.ADMIN))], response_description="Partner data updated in the database")
async def update_partner_data(id: str, partner: Partner = Body(...)):
    """update_partner_data update the data of a partner

    :param partner: defaults to Body(...)
    :type partner: Partner, optional
    :return: data of updated partner
    :rtype: dict
    """
    # check if a partner with the same name is already present
    old_partner = await read_where(Partner, Partner.id == ObjectId(id))
    if old_partner:

        if old_partner.name != partner.name and await read_where(Partner, Partner.name == partner.name):
            raise NameAlreadyUsedException()

        old_partner.name = partner.name
        old_partner.about = partner.about

        new_partner = await update(old_partner)
        return response(new_partner, "Partner updated successfully.")
    raise PartnerNotFoundException()


@router.get("/{id}", dependencies=[Depends(RoleChecker(UserRole.COACH))], response_description="User retrieved")
async def get_partner(id, Authorize: AuthJWT = Depends()):
    """get_partner get the Partner instance with the given id from the database

    :return: the partner if found, else None
    :rtype: dict
    """

    current_user_id = Authorize.get_jwt_subject()

    # if coach -> check if the coach is involved with partner
    projects = await db.engine.find(Project, {"user_ids": ObjectId(current_user_id), "partner_ids": ObjectId(id)})

    if not len(projects):
        raise NotPermittedException()

    partner = await read_where(Partner, Partner.id == ObjectId(id))
    if not partner:
        raise PartnerNotFoundException()
    return response(partner, "Returned the partner successfully")
