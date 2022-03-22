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
        for user_title in self.saved_objects["users"]:
            if user_title != "user_admin":
                await self.get_response("/users", user_title, Status.FORBIDDEN)

    """
    GET /users/me
    """

    async def test_get_user_me(self):
        # Correct GET
        for user_title in self.saved_objects["users"]:
            user = self.objects[user_title]
            response = await self.get_response("/users/me", user_title, Status.SUCCES)
            response = json.loads(response.content)["data"]["id"].split("/")[-1]

            self.assertEqual(str(user.id), response)

    """
    POST /create
    """

    async def test_create_user_as_admin(self):
        body: Dict[str, str] = {"email": "added_user_as_admin@test.com"}
        await self.post_response("/users/create", body, "user_admin", Status.SUCCES)
        user = await db.engine.find_one(User, User.email == body["email"])
        self.assertIsNotNone(user, f"{body['email']} was not found in the database")
        await db.engine.delete(user)

    async def test_create_user_as_forbidden(self):
        body: Dict[str, str] = {"email": "added_as_unauthorized@test.com"}
        for user_title in self.saved_objects["users"]:
            if user_title != "user_admin":
                await self.post_response("/users/create", body, user_title, Status.FORBIDDEN)

        # check that the user was not added to the database
        user = await db.engine.find(User, User.email == body["email"])
        self.assertIsNotNone(user, f"{user} was incorrectly added to the database")

    async def test_create_existing_user_as_admin(self):
        existing_user = self.objects["user_approved_coach"]
        body: Dict[str, str] = {"email": existing_user.email}
        response = await self.post_response("/users/create", body, "user_admin", Status.SUCCES)
        gotten_user_id = json.loads(response.content)["data"]["id"].split('/')[-1]
        self.assertEqual(str(existing_user.id), gotten_user_id)

    """
    POST /users/{id}/invite
    """

    @unittest.skip("Prevent email spam")
    async def test_invite_user_as_approved_user(self):
        to_invite = self.objects["user_unactivated_coach"]
        active_user = self.objects["user_activated_coach"]
        to_invite.email = "Stef.VandenHaute@UGent.be"  # Todo: set in env variable
        bad_user_id = "00000a00a00aa00aa000aaaa"

        for name in self.saved_objects["users"]:
            user = self.objects[name]
            if user.approved and user.role == UserRole.ADMIN:
                await self.post_response(f"/users/{to_invite.id}/invite", {}, name, Status.SUCCES)
                await self.post_response(f"/users/{active_user.id}/invite", {}, name, Status.BAD_REQUEST)
                await self.post_response(f"/users/{bad_user_id}/invite", {}, name, Status.NOT_FOUND)

    async def test_invite_user_as_forbidden(self):
        to_invite = self.objects["user_unactivated_coach"]
        active_user = self.objects["user_activated_coach"]
        to_invite.email = "Stef.VandenHaute@UGent.be"  # Todo: set in env variable
        bad_user_id = "00000a00a00aa00aa000aaaa"

        for name in self.saved_objects["users"]:
            user = self.objects[name]
            if user.active and user.role != UserRole.ADMIN:
                await self.post_response(f"/users/{to_invite.id}/invite", {}, name, Status.FORBIDDEN)
                await self.post_response(f"/users/{active_user.id}/invite", {}, name, Status.FORBIDDEN)
                await self.post_response(f"/users/{bad_user_id}/invite", {}, name, Status.FORBIDDEN)

    """
    POST /users/invites
    """

    @unittest.skip("Prevent email spam")
    async def test_invite_users_as_approved_user(self):
        to_invite = [self.objects["user_unactivated_coach"]]
        active_users = [self.objects["user_activated_coach"]]
        test_mail = "Stef.VandenHaute@UGent.be"  # Todo: set in env variable
        bad_user_id = "00000a00a00aa00aa000aaaa"

        def set_email(user: User, email: str) -> str:
            user.email = email
            return str(user.id)

        to_invite = list(map(lambda user: set_email(user, test_mail), to_invite))
        active_users = list(map(lambda user: set_email(user, test_mail), active_users))

        for name in self.saved_objects["users"]:
            user = self.objects[name]
            if user.approved and user.role == UserRole.ADMIN:
                await self.post_response("/users/invites", to_invite, name, Status.SUCCES)
                await self.post_response("/users/invites", active_users, name, Status.BAD_REQUEST)
                await self.post_response("/users/invites", [bad_user_id], name, Status.NOT_FOUND)

    async def test_invite_users_as_forbidden(self):
        to_invite = [self.objects["user_unactivated_coach"]]
        test_mail = "Stef.VandenHaute@UGent.be"  # Todo: set in env variable
        bad_user_id = "00000a00a00aa00aa000aaaa"

        def set_email(user: User, email: str) -> str:
            user.email = email
            return str(user.id)

        to_invite = list(map(lambda user: set_email(user, test_mail), to_invite))

        for name in self.saved_objects["users"]:
            user = self.objects[name]
            if user.active and user.role != UserRole.ADMIN:
                await self.post_response("/users/invites", to_invite, name, Status.FORBIDDEN)
                await self.post_response("/users/invites", [bad_user_id], name, Status.FORBIDDEN)

    """
    GET /users/{id}
    """

    async def test_get_user_as_approved_user(self):
        expected = self.objects["user_admin"]
        bad_user_id = "00000a00a00aa00aa000aaaa"
        for name in self.saved_objects["users"]:
            user = self.objects[name]
            if user.approved:
                response = await self.get_response(f"/users/{expected.id}", name, Status.SUCCES)
                gotten_user = json.loads(response.content)["data"]
                self.assertTrue(expected.email == gotten_user["email"],
                                f"""The incorrect user was fetched
                                Expected: {expected}
                                Was: {gotten_user}
                                """)
                await self.get_response(f"/users/{self.objects['user_activated_coach'].id}", name, Status.BAD_REQUEST)
                await self.get_response(f"/users/{bad_user_id}", name, Status.NOT_FOUND)

    async def test_get_user_as_forbidden(self):
        user_id: str = str(self.objects["user_approved_coach"].id)
        bad_user_id = "00000a00a00aa00aa000aaaa"

        for user_title in self.saved_objects["users"]:
            if user_title != "user_admin" and user_title != "user_approved_coach":
                await self.get_response(f"/users/{user_id}", user_title, Status.FORBIDDEN)
                await self.get_response(f"/users/{bad_user_id}", user_title, Status.FORBIDDEN)

        # No authorization
        await self.get_response(f"/users/{user_id}", "user_no_role", Status.FORBIDDEN, use_access_token=False)
        # Wrong authorization
        await self.get_response(f"/users/{user_id}", "user_no_role", Status.FORBIDDEN, access_token="wrong token")

    """
    POST /users/{id}
    """

    async def test_update_user_as_admin(self):
        user_to_edit = self.objects["user_no_role"]
        bad_user_id = "00000a00a00aa00aa000aaaa"
        body: Dict[str, str] = {"email": "new+email@new.me", "name": "Rocky"}
        bad_body: Dict[str, str] = {"email": self.objects["user_admin"].email, "name": "Rocky"}

        response = await self.post_response(f"/users/{user_to_edit.id}", body, "user_admin", Status.SUCCES)
        user = await db.engine.find_one(User, {"email": json.loads(response.content)["data"]["email"]})
        self.assertIsNotNone(user,
                             f"""
                             {body['email']} was not found in the database,
                             the mail of the user was not modified correctly.
                             """)
        user = await db.engine.find_one(User, {"name": json.loads(response.content)["data"]["name"]})
        self.assertIsNotNone(user,
                             f"""
                             {body['name']} was not found in the database,
                             the name of the user was not modified correctly.
                             """)

        await self.post_response(f"/users/{user_to_edit.id}", bad_body, "user_admin", Status.BAD_REQUEST)
        await self.post_response(f"/users/{bad_user_id}", body, "user_admin", Status.NOT_FOUND)

    async def test_update_user_as_forbidden(self):
        user_to_edit = self.objects["user_no_role"]
        bad_user_id = "00000a00a00aa00aa000aaaa"
        new_name = "Rocky"
        body: Dict[str, str] = {"email": "new+email@new.me", "name": new_name}
        bad_body: Dict[str, str] = {"email": self.objects["user_admin"].email, "name": "Rocky"}

        for user_title in self.saved_objects["users"]:
            if user_title != "user_admin":
                await self.post_response(f"/users/{user_to_edit.id}", body, user_title, Status.FORBIDDEN)
                await self.post_response(f"/users/{user_to_edit.id}", bad_body, user_title, Status.FORBIDDEN)
                await self.post_response(f"/users/{bad_user_id}", body, user_title, Status.FORBIDDEN)

        # check that the user was not changed in the database
        user = await read_where(User, User.id == ObjectId(user_to_edit.id))
        self.assertNotEqual(user.name, new_name, f"{user_to_edit.name} was modified in the database")

    """
    POST /users/{id}/approve
    """

    async def test_approve_user_as_admin(self):
        approved_user = self.objects["user_approved_coach"]
        activated_user = self.objects["user_activated_coach"]
        unactivated_user = self.objects["user_unactivated_coach"]
        bad_user_id = "00000a00a00aa00aa000aaaa"

        await self.post_response(f"/users/{activated_user.id}/approve", {}, "user_admin", Status.SUCCES)
        user = await read_where(User, User.id == ObjectId(activated_user.id))
        self.assertTrue(user.approved)

        await self.post_response(f"/users/{approved_user.id}/approve", {}, "user_admin", Status.BAD_REQUEST)
        user = await read_where(User, User.id == ObjectId(approved_user.id))
        self.assertTrue(user.approved)

        await self.post_response(f"/users/{unactivated_user.id}/approve", {}, "user_admin", Status.BAD_REQUEST)
        user = await read_where(User, User.id == ObjectId(unactivated_user.id))
        self.assertFalse(user.approved)
        self.assertFalse(user.active)

        await self.post_response(f"/users/{bad_user_id}/approve", {}, "user_admin", Status.NOT_FOUND)

    async def test_approve_user_as_forbidden(self):
        approved_user = self.objects["user_approved_coach"]
        activated_user = self.objects["user_activated_coach"]
        unactivated_user = self.objects["user_unactivated_coach"]
        bad_user_id = "00000a00a00aa00aa000aaaa"

        for user_title in self.saved_objects["users"]:
            if user_title != "user_admin":
                await self.post_response(f"/users/{activated_user.id}/approve", {}, user_title, Status.FORBIDDEN)
                await self.post_response(f"/users/{approved_user.id}/approve", {}, user_title, Status.FORBIDDEN)
                await self.post_response(f"/users/{unactivated_user.id}/approve", {}, user_title, Status.FORBIDDEN)
                await self.post_response(f"/users/{bad_user_id}/approve", {}, user_title, Status.FORBIDDEN)

        # check that the user was not changed in the database
        user = await read_where(User, User.id == ObjectId(activated_user.id))
        self.assertFalse(user.approved)
        self.assertTrue(user.active)
        user = await read_where(User, User.id == ObjectId(approved_user.id))
        self.assertTrue(user.approved)
        self.assertTrue(user.active)
        user = await read_where(User, User.id == ObjectId(unactivated_user.id))
        self.assertFalse(user.approved)
        self.assertFalse(user.active)

    """
    POST /users/forgot/{reset_key}
    """  # These tests need to be seperated to avoid issues with encrypted passwords

    async def test_change_password(self):
        new_pass = "ValidPass?!123"
        body = {
            "password": new_pass,
            "validate_password": new_pass
        }
        bad_body = {
            "password": new_pass,
            "validate_password": new_pass + "oeps"
        }

        for name in self.saved_objects["users"]:
            user = self.objects[name]
            key = generate_new_reset_password_key()
            db.redis.setex(key[0], key[1], str(user.id))

            # Request using different validate_password
            await self.post_response(f"/users/forgot/{key[0]}", bad_body, name, Status.BAD_REQUEST)
            self.assertEqual(user.password, self.saved_objects[name].password,
                             f"The password of {name} was {user.password}. "
                             f"Expected: {self.saved_objects[name].password}")

            # Now the password is encrypted in self.objects
            key = generate_new_reset_password_key()
            db.redis.setex(key[0], key[1], str(user.id))

            await self.post_response(f"/users/forgot/{key[0]}", body, name, Status.SUCCES)
            # Since password is encrypted, we assert using a simple get with the new password
            self.saved_objects["passwords"][name] = new_pass
            await self.get_response("/users/me", name, Status.SUCCES)

        # Request using invalid reset keys
        await self.post_response("/users/forgot/Rohnonotsogood", body, "user_admin", Status.BAD_REQUEST)
        await self.post_response("/users/forgot/Iohnoevenworse", body, "user_admin", Status.BAD_REQUEST)

        key = generate_new_reset_password_key()
        db.redis.setex(key[0], key[1], str(self.objects["user_approved_coach"].id))

        await self.post_response(f"/users/forgot/{key[0]}", body, "user_admin", Status.FORBIDDEN)
