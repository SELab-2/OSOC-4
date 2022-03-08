from fastapi import APIRouter, Body
from app.models.partner import Partner
from fastapi.encoders import jsonable_encoder
from app.utils.response import response
from app.crud.partners import add_partner, retrieve_partners
router = APIRouter(prefix="/partners")


@router.post("/create", response_description="Partner data added into the database")
async def add_partner_data(partner: Partner = Body(...)):
    """add_partner_data add a new partner

    :param partner: defaults to Body(...)
    :type partner: Partner, optional
    :return: data of new created partner
    :rtype: dict
    """

    # check if partner already present

    new_partner = await add_partner(Partner.parse_obj(partner))
    return response(new_partner, "Partner added successfully.")


@router.get("/", response_description="Partners retrieved")
async def get_partners():
    """get_partners get all the partners from the database

    :return: list of partners
    :rtype: dict
    """
    partners = await retrieve_partners()
    if partners:
        return response(partners, "Partners retrieved successfully")
    return response(partners, "Empty list returned")

