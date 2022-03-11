from app.models.partner import Partner
from app.models.user import User, UserRole
from app.tests.test_base import TestBase


class TestPartnerBase(TestBase):
    def __init__(self, *args, **kwargs):

        objects = {
            "user_unactivated": User(
                email="user_unactivated@test.be",
                name="user_unactivated",
                password="Test123!user_unactivated",
                role=UserRole.COACH,
                active=False,
                approved=False),
            "user_activated": User(
                email="user_activated@test.be",
                name="user_activated",
                password="Test123!user_activated",
                role=UserRole.COACH,
                active=True, approved=False),
            "user_approved": User(
                email="user_approved@test.be",
                name="user_approved",
                password="Test123!user_approved",
                role=UserRole.COACH,
                active=True, approved=True),
            "user_admin": User(
                email="user_admin@test.be",
                name="user_admin",
                password="Test123!user_admin",
                role=UserRole.ADMIN,
                active=True, approved=True),
            "user_coach": User(
                email="user_coach@test.be",
                name="user_coach",
                password="Test123!user_coach",
                role=UserRole.COACH,
                active=True, approved=True),
            "user_no_role": User(
                email="user_no_role@test.be",
                name="user_no_role",
                password="Test123!user_no_role",
                role=UserRole.NO_ROLE,
                active=True, approved=True),
            "partner": Partner(
                name="Dummy partner",
                about="Dummy partner about")
        }
        super().__init__(objects, *args, **kwargs)
