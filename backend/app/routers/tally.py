from app.utils.response import response
from app.utils.tallyhandler import process_tally
from fastapi import APIRouter

router = APIRouter(prefix="/tally")


@router.post("/add", response_description="Form submitted")
async def add_new_form(data: dict):
    await process_tally(data)
    return response(None, "Form added successfully.")
