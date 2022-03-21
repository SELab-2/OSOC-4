import json
from typing import Dict

from app.database import db
from app.models.user import User
from app.tests.test_base import Status, TestBase


class TestUsers(TestBase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    """
    POST /create
    """
    async def test_create_user_as_admin(self):
        body: Dict[str, str] = {"email": "added_user_as_admin@test.com"}
        response = await self.post_response("/users/create", body, "user_admin", Status.SUCCES)
        user = await db.engine.find_one(User, {"id": json.loads(response.content)["data"]["id"]})
        self.assertIsNotNone(user, f"{body['id']} was not found in the database")
        await db.engine.delete(user)

    async def test_create_user_as_forbidden(self):
        body: Dict[str, str] = {"email": "added_as_unauthorized@test.com"}
        for user_title in self.objects:
            if user_title != "user_admin":
                await self.post_response("/users/create", body, user_title, Status.FORBIDDEN)

        # check that the user was not added to the database
        user = await db.engine.find(User, User.email == body["email"])
        self.assertIsNotNone(user, f"{user} was incorrectly added to the database")

    """
    GET /user/{id}
    """

    async def test_get_user_as_approved_user(self):
        expected = self.objects["user_admin"]
        for name, user in self.objects.items():
            if user.approved:
                response = await self.get_response(f"/users/{expected.id}", name, Status.SUCCES)
                gotten_user = json.loads(response.content)["data"]
                self.assertTrue(expected.email == gotten_user["email"],
                                f"""The incorrect user was fetched
                                Expected: {expected}
                                Was: {gotten_user}
                                """)

    async def test_get_user_as_forbidden(self):
        user_id: str = str(self.objects["user_approved_coach"].id)

        for user_title in self.objects:
            if user_title != "user_admin" and user_title != "user_approved_coach":
                await self.get_response(f"/users/{user_id}", user_title, Status.FORBIDDEN)

        # No authorization
        await self.get_response(f"/users/{user_id}", "user_no_role", Status.FORBIDDEN, use_access_token=False)
        # Wrong authorization
        await self.get_response(f"/users/{user_id}", "user_no_role", Status.FORBIDDEN, access_token="wrong token")

    """
    GET /users
    """
    async def test_get_users_roles(self):
        # Test correct role (admin)
        response = await self.get_response("/users", "user_admin", Status.SUCCES)

        ep_users = json.loads(response.content)["data"]  # collected from EndPoint
        ep_users = sorted([user["id"].split("/")[-1] for user in ep_users])  # collected from db itself

        db_users = await db.engine.find(User)
        db_users = sorted([str(user.id) for user in db_users])

        self.assertTrue(db_users == ep_users,
                        f"""Users in the database were not the same as the returned users.
                        Expected: {db_users}
                        Was: {ep_users}""")

        # Test wrong roles
        for user_title in self.objects:
            if user_title != "user_admin":
                await self.get_response("/users", user_title, Status.FORBIDDEN)
