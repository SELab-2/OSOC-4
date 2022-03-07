from operator import ge
from fastapi import APIRouter
from app.utils.response import response, errorresponse
from app.crud.studentroles import get_all_roles

router = APIRouter(prefix="/studentroles")


@router.get("/")
async def get_studentroles():
    roles = await get_all_roles()
    return response(roles, "Fetched all forms successfully")
