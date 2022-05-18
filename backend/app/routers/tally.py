""" This module includes the tally endpoints """

from app.database import get_session
from app.utils.response import response
from app.utils.tallyhandler import process_tally
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/tally")


@router.post("/add", response_description="Form submitted")
async def add_new_form(year: int, data: dict, session: AsyncSession = Depends(get_session)) -> dict:
    """add_new_form adds processes a submitted form
        this endpoint will by called by the tally webhook
        the data send will be processed here

    :param year: the edition year
    :type year: int
    :param data: the data
    :type data: dict
    :param session: the session object, defaults to Depends(get_session)
    :type session: AsyncSession, optional
    :return: response message
    :rtype: dict
    """
    await process_tally(data, year, session)
    return response(None, "Form added successfully.")
