from app.crud import read_all
from app.database import db

from app.models.partner import Partner
from app.models.user import User, UserOut, UserRole
from app.utils.response import list_modeltype_response, response
from fastapi import APIRouter

router = APIRouter(prefix="/ddd")


@router.get("/", response_description="Users retrieved")
async def ddd():
    user_unactivated = User(
        email="user_unactivated@test.be",
        name="user_unactivated",
        password="Test123!user_unactivated",
        role=UserRole.COACH,
        active=False,
        approved=False)

    user_activated = User(
        email="user_activated@test.be",
        name="user_activated",
        password="Test123!user_activated",
        role=UserRole.COACH,
        active=True, approved=False)

    user_approved = User(
        email="user_approved@test.be",
        name="user_approved",
        password="Test123!user_approved",
        role=UserRole.COACH,
        active=True, approved=True)

    user_admin = User(
        email="user_admin@test.be",
        name="user_admin",
        password="Test123!user_admin",
        role=UserRole.ADMIN,
        active=True, approved=True)

    partner = Partner(
        name="Dummy partner",
        about="Dummy partner about")

    await db.engine.save(user_unactivated)
    await db.engine.save(user_activated)
    await db.engine.save(user_approved)
    await db.engine.save(user_admin)
    await db.engine.save(partner)

    return response(None, "Dummy data inserted")
