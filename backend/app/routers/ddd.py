from app.database import db
from app.models.user import User, UserRole
from app.utils.cryptography import get_password_hash
from app.utils.response import response
from fastapi import APIRouter

router = APIRouter(prefix="/ddd")


@router.get("/", response_description="Users retrieved")
async def ddd():
    user_unactivated = User(
        email="user_unactivated@test.be",
        name="user_unactivated",
        password=get_password_hash("Test123!user_unactivated"),
        role=UserRole.COACH,
        active=False,
        approved=False,
        disabled=False)

    user_activated = User(
        email="user_activated@test.be",
        name="user_activated",
        password=get_password_hash("Test123!user_activated"),
        role=UserRole.COACH,
        active=True, approved=False)

    user_approved = User(
        email="user_approved@test.be",
        name="user_approved",
        password=get_password_hash("Test123!user_approved"),
        role=UserRole.COACH,
        active=True, approved=True)

    user_admin = User(
        email="user_admin@test.be",
        name="user_admin",
        password=get_password_hash("Test123!user_admin"),
        role=UserRole.ADMIN,
        active=True, approved=True)

    await db.engine.save(user_unactivated)
    await db.engine.save(user_activated)
    await db.engine.save(user_approved)
    await db.engine.save(user_admin)

    return response(None, "Dummy data inserted")
