from app.database import get_session
from app.utils.response import response
from app.utils.tallyhandler import process_tally
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/tally")


@router.post("/add", response_description="Form submitted")
async def add_new_form(year: int, data: dict, session: AsyncSession = Depends(get_session)):
    await process_tally(data, year, session)
    return response(None, "Form added successfully.")
