import json
import unittest
from typing import Dict

from app.database import db
from app.models.user import User, UserRole
from app.tests.test_base import Status, TestBase


class TestUsers(TestBase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

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

    """
    POST /create
    """

    async def test_create_user_as_admin(self):
        body: Dict[str, str] = {"email": "added_user_as_admin@test.com"}
        response = await self.post_response("/users/create", body, "user_admin", Status.SUCCES)
        user = await db.engine.find_one(User, {"email": json.loads(response.content)["data"]["email"]})
        self.assertIsNotNone(user, f"{body['email']} was not found in the database")
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
    POST /users/{id}/invite
    """

    @unittest.skip("Prevent email spam")
    async def test_invite_user_as_approved_user(self):
        to_invite = self.objects["user_unactivated_coach"]
        to_invite.email = "Stef.VandenHaute@UGent.be"  # Todo: set in env variable
        bad_user_id = "00000a00a00aa00aa000aaaa"

        for name, user in self.objects.items():
            if user.approved and user.role == UserRole.ADMIN:
                await self.post_response(f"/users/{to_invite.id}/invite", {}, name, Status.SUCCES)
                await self.post_response(f"/users/{bad_user_id}/invite", {}, name, Status.NOT_FOUND)

    async def test_invite_user_as_forbidden(self):
        to_invite = self.objects["user_unactivated_coach"]
        to_invite.email = "Stef.VandenHaute@UGent.be"  # Todo: set in env variable
        bad_user_id = "00000a00a00aa00aa000aaaa"

        for name, user in self.objects.items():
            if user.active and user.role != UserRole.ADMIN:
                await self.post_response(f"/users/{to_invite.id}/invite", {}, name, Status.FORBIDDEN)
                await self.post_response(f"/users/{bad_user_id}/invite", {}, name, Status.FORBIDDEN)

    """
    POST /users/invites
    """

    @unittest.skip("Prevent email spam")
    async def test_invite_users_as_approved_user(self):
        to_invite = [self.objects["user_unactivated_coach"]]
        test_mail = "Stef.VandenHaute@UGent.be"  # Todo: set in env variable
        bad_user_id = "00000a00a00aa00aa000aaaa"

        def set_email(user: User, email: str) -> str:
            user.email = email
            return str(user.id)

        to_invite = list(map(lambda user: set_email(user, test_mail), to_invite))

        for name, user in self.objects.items():
            if user.approved and user.role == UserRole.ADMIN:
                await self.post_response("/users/invites", to_invite, name, Status.SUCCES)
                await self.post_response("/users/invites", [bad_user_id], name, Status.NOT_FOUND)

    async def test_invite_users_as_forbidden(self):
        to_invite = [self.objects["user_unactivated_coach"]]
        test_mail = "Stef.VandenHaute@UGent.be"  # Todo: set in env variable
        bad_user_id = "00000a00a00aa00aa000aaaa"

        def set_email(user: User, email: str) -> str:
            user.email = email
            return str(user.id)

        to_invite = list(map(lambda user: set_email(user, test_mail), to_invite))

        for name, user in self.objects.items():
            if user.active and user.role != UserRole.ADMIN:
                await self.post_response("/users/invites", to_invite, name, Status.FORBIDDEN)
                await self.post_response("/users/invites", [bad_user_id], name, Status.FORBIDDEN)

    """
    GET /users/{id}
    """

    async def test_get_user_as_approved_user(self):  # todo: get non-existing users
        expected = self.objects["user_admin"]
        bad_user_id = "00000a00a00aa00aa000aaaa"
        for name, user in self.objects.items():
            if user.approved:
                response = await self.get_response(f"/users/{expected.id}", name, Status.SUCCES)
                gotten_user = json.loads(response.content)["data"]
                self.assertTrue(expected.email == gotten_user["email"],
                                f"""The incorrect user was fetched
                                Expected: {expected}
                                Was: {gotten_user}
                                """)
                await self.get_response(f"/users/{bad_user_id}", name, Status.NOT_FOUND)

    async def test_get_user_as_forbidden(self):
        user_id: str = str(self.objects["user_approved_coach"].id)
        bad_user_id = "00000a00a00aa00aa000aaaa"

        for user_title in self.objects:
            if user_title != "user_admin" and user_title != "user_approved_coach":
                await self.get_response(f"/users/{user_id}", user_title, Status.FORBIDDEN)
                await self.get_response(f"/users/{bad_user_id}", user_title, Status.FORBIDDEN)

        # No authorization
        await self.get_response(f"/users/{user_id}", "user_no_role", Status.FORBIDDEN, use_access_token=False)
        # Wrong authorization
        await self.get_response(f"/users/{user_id}", "user_no_role", Status.FORBIDDEN, access_token="wrong token")
