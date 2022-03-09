from fastapi import APIRouter, Body
from odmantic import ObjectId

from app.crud.base_crud import read_all, update, read_by_key_value
from app.models.partner import Partner
from app.utils.response import response, errorresponse, list_modeltype_response
router = APIRouter(prefix="/partners")


@router.get("/", response_description="Partners retrieved")
async def get_partners():
    """get_partners get all the Partner instances from the database

    :return: list of partners
    :rtype: dict
    """
    results = await read_all(Partner)
    return list_modeltype_response(results, Partner)


@router.post("/create", response_description="Partner data added into the database")
async def add_partner_data(partner: Partner = Body(...)):
    """add_partner_data add a new partner

    :param partner: defaults to Body(...)
    :type partner: Partner, optional
    :return: data of new created partner
    :rtype: dict
    """
    # check if a partner with the same name is already present
    if await read_by_key_value(Partner, Partner.name, partner.name):
        return errorresponse("Name already in use", 409, "")

    new_partner = await update(Partner.parse_obj(partner))
    return response(new_partner, "Partner added successfully.")


@router.get("/{id}")
async def get_partner_by_id(id):
    partner = await read_by_key_value(Partner, Partner.id, ObjectId(id))
    if not partner:
        return errorresponse(None, 400, "Partner not found")
    return response(partner, "Returned the partner successfully")
