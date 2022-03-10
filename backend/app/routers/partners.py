from app.crud import read_all, read_by_key_value, update
from app.models.partner import Partner
from app.models.user import UserRole
from app.utils.response import errorresponse, list_modeltype_response, response
from fastapi import APIRouter, Body, Depends
from odmantic import ObjectId

from app.utils.rolechecker import RoleChecker

router = APIRouter(prefix="/partners")


@router.get("/", dependencies=[Depends(RoleChecker([UserRole.ADMIN]))], response_description="Partners retrieved")
async def get_partners():
    """get_partners get all the Partner instances from the database

    :return: list of partners
    :rtype: dict
    """
    results = await read_all(Partner)
    return list_modeltype_response(results, Partner)


@router.post("/create", dependencies=[Depends(RoleChecker([UserRole.ADMIN]))], response_description="Partner data added into the database")
async def add_partner_data(partner: Partner = Body(...)):
    """add_partner_data add a new partner

    :param partner: defaults to Body(...)
    :type partner: Partner, optional
    :return: data of newly created partner
    :rtype: dict
    """
    # check if a partner with the same name is already present
    if await read_by_key_value(Partner, Partner.name, partner.name):
        return errorresponse("Name already in use", 409, "")

    new_partner = await update(Partner.parse_obj(partner))
    return response(new_partner, "Partner added successfully.")


@router.post("/{id}", dependencies=[Depends(RoleChecker([UserRole.ADMIN]))], response_description="Partner data updated in the database")
async def update_partner_data(partner: Partner = Body(...)):
    """update_partner_data update the data of a partner

    :param partner: defaults to Body(...)
    :type partner: Partner, optional
    :return: data of updated partner
    :rtype: dict
    """
    # check if a partner with the same name is already present
    if await read_by_key_value(Partner, Partner.id, partner.id):
        new_partner = await update(Partner.parse_obj(partner))
        return response(new_partner, "Partner updated successfully.")
    return errorresponse("Partner doesn't exist", 409, "")


@router.get("/{id}", dependencies=[Depends(RoleChecker([UserRole.COACH]))], response_description="User retrieved")
async def get_partner(id):
    """get_partner get the Partner instance with the given id from the database

    :return: the partner if found, else None
    :rtype: dict
    """
    partner = await read_by_key_value(Partner, Partner.id, ObjectId(id))
    if not partner:
        return errorresponse(None, 400, "Partner not found")
    return response(partner, "Returned the partner successfully")
