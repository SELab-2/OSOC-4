from fastapi import APIRouter
from ..utils.response import response, errorresponse
from ..utils.tallyhandler import process_tally

router = APIRouter(prefix="/tally")


@router.post("/add", response_description="Form submitted")
async def add_new_form(data: dict):
    await process_tally(data)
    return response(None, "Form added successfully.")
