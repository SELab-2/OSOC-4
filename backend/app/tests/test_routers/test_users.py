import json
import unittest
from typing import Dict

from odmantic import ObjectId

from app.crud import read_where
from app.database import db
from app.models.user import User, UserRole
from app.tests.test_base import Status, TestBase
from app.utils.keygenerators import generate_new_reset_password_key


class TestUsers(TestBase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    """
    GET /users/me
    """
    async def test_get_user_me(self):
        # Correct GET
        for user_title, user in self.objects.items():
            response = await self.get_response("/users/me", user_title, Status.SUCCES)
            response = json.loads(response.content)["data"]["id"].split("/")[-1]

            self.assertEqual(str(user.id), response)

    """
    GET /users
    """
    async def test_get_users_roles(self):
        # Test correct role (admin)
        response = await self.get_response("/users", "user_admin", Status.SUCCES)

        ep_users = json.loads(response.content)["data"]
        ep_users = sorted([user["id"].split("/")[-1] for user in ep_users])  # collected from EndPoint

        db_users = await db.engine.find(User)
        db_users = sorted([str(user.id) for user in db_users])  # collected from db itself

        self.assertTrue(db_users == ep_users,
                        f"""Users in the database were not the same as the returned users.
                        Expected: {db_users}
                        Was: {ep_users}""")

        # Test wrong roles
        for user_title in self.objects:
            if user_title != "user_admin":
                await self.get_response("/users", user_title, Status.FORBIDDEN)
