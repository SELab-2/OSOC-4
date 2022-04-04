import json
import unittest
from typing import Dict

from odmantic import ObjectId

from app.crud import read_where
from app.database import db
from app.models.user import User
from app.tests.test_base import Status, TestBase
from app.utils.keygenerators import generate_new_reset_password_key


class TestUsers(TestBase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    async def test_get_users(self):
        path = "/users"
        allowed_users = {"user_admin"}

        # Test authorization & access-control
        await self.auth_access_get_test(path, allowed_users)

        # Test response
        response = await self.get_response(path, "user_admin", Status.SUCCES)

        ep_users = json.loads(response.content)["data"]  # collected from EndPoint
        ep_users = sorted([user["id"].split("/")[-1] for user in ep_users])

        db_users = await db.engine.find(User)  # collected from DataBase itself
        db_users = sorted([str(user.id) for user in db_users])

        self.assertTrue(db_users == ep_users,
                        f"""Users in the database were not the same as the returned users.
                        Expected: {db_users}
                        Was: {ep_users}""")

    async def test_get_users_me(self):
        path = "/users/me"
        allowed_users = {"user_admin", "user_approved_coach"}

        # Test authorization & access-control
        await self.auth_access_get_test(path, allowed_users)

        # Test response
        user = self.objects["user_admin"]
        response = await self.get_response(path, "user_admin", Status.SUCCES)
        response = json.loads(response.content)["data"]["id"].split("/")[-1]
        self.assertEqual(str(user.id), response)

    async def test_post_users_create(self):
        path = "/users/create"
        allowed_users = {"user_admin"}
        body = {"email": "added_user@test.com"}

        # Test authorization & access-control
        await self.auth_access_post_test(path, allowed_users, body)

        # Test response
        user = await db.engine.find_one(User, User.email == body["email"])
        self.assertIsNotNone(user, f"{body['email']} was not found in the database")

    async def test_post_forgot(self):
        allowed_users = {"user_admin", "user_approved_coach"}
        new_pass = "ValidPass?!123"
        body = {
            "password": new_pass,
            "validate_password": new_pass
        }
        bad_body = {
            "password": new_pass,
            "validate_password": new_pass + "oeps"
        }

        for user_title in allowed_users:
            user = self.objects[user_title]
            key = generate_new_reset_password_key()
            db.redis.setex(key[0], key[1], str(user.id))

            # Request using different validate_password
            await self.post_response(f"/users/forgot/{key[0]}", bad_body, user_title, Status.BAD_REQUEST)
            self.assertEqual(user.password, self.saved_objects[user_title].password,
                             f"The password of {user_title} was {user.password}. "
                             f"Expected: {self.saved_objects[user_title].password}")

            # Now the password is encrypted in self.objects
            key = generate_new_reset_password_key()
            db.redis.setex(key[0], key[1], str(user.id))

            await self.post_response(f"/users/forgot/{key[0]}", body, user_title, Status.SUCCES)
            # Since password is encrypted, we assert using a simple get with the new password
            self.saved_objects["passwords"][user_title] = new_pass
            await self.get_response("/users/me", user_title, Status.SUCCES)

        # Request using invalid reset keys
        await self.post_response("/users/forgot/Rohnonotsogood", body, "user_admin", Status.BAD_REQUEST)
        await self.post_response("/users/forgot/Iohnoevenworse", body, "user_admin", Status.BAD_REQUEST)

        key = generate_new_reset_password_key()
        db.redis.setex(key[0], key[1], str(self.objects["user_approved_coach"].id))

        await self.post_response(f"/users/forgot/{key[0]}", body, "user_admin", Status.FORBIDDEN)

    async def test_get_users_id(self):
        expected_user = self.users["user_admin"]
        path = "/users/" + str(expected_user.id)
        bad_path = "/users/00000a00a00aa00aa000aaaa"
        allowed_users = {"user_admin", "user_approved_coach"}

        # Test authorization & access-control
        await self.auth_access_get_test(path, allowed_users)

        # Test response
        response = await self.get_response(path, "user_admin", Status.SUCCES)
        gotten_user = json.loads(response.content)["data"]
        self.assertTrue(expected_user.email == gotten_user["email"],
                        f"""The incorrect user was fetched
                             Expected: {expected_user}
                             Was: {gotten_user}""")
        await self.get_response(bad_path, "user_admin", Status.NOT_FOUND)

    async def test_post_users_id(self):
        user_to_edit = self.objects["user_no_role"]
        path = "/users/" + str(user_to_edit.id)
        bad_path = "/users/00000a00a00aa00aa000aaaa"
        body: Dict[str, str] = {"email": user_to_edit.email, "name": "Rocky"}
        bad_body: Dict[str, str] = {"email": self.objects["user_admin"].email, "name": "Rocky"}
        allowed_users = {"user_admin"}

        # Test authorization & access-control
        await self.auth_access_post_test(path, allowed_users, body)

        # Test response
        user = await db.engine.find_one(User, User.id == user_to_edit.id and User.name == body["name"])
        self.assertIsNotNone(user, f"""
                             {body} was not found in the database,
                             the user was not modified correctly.""")

        await self.post_response(path, bad_body, "user_admin", Status.BAD_REQUEST)
        await self.post_response(bad_path, body, "user_admin", Status.NOT_FOUND)

    @unittest.skip("Prevent email spam")
    async def test_post_users_id_invite(self):
        to_invite = self.objects["user_unactivated_coach"].id
        active_user = self.objects["user_activated_coach"].id
        bad_user = "00000a00a00aa00aa000aaaa"
        to_invite.email = "Stef.VandenHaute@UGent.be"  # Todo: set in env variable
        path = f"/users/{to_invite}/invite"
        allowed_users = {"user_admin"}
        body = {}

        # Test authorization & access-control
        await self.auth_access_post_test(path, allowed_users, body)

        # Test response
        await self.post_response(path, {}, "user_admin", Status.SUCCES)
        await self.post_response(f"/users/{active_user}/invite", {}, "user_admin", Status.BAD_REQUEST)
        await self.post_response(f"/users/{bad_user}/invite", {}, "user_admin", Status.NOT_FOUND)

        await self.post_response(f"/users/{active_user}/invite", {}, "user_approved_coach", Status.FORBIDDEN)
        await self.post_response(f"/users/{bad_user}/invite", {}, "user_approved_coach", Status.FORBIDDEN)

    async def test_post_users_id_approve(self):
        activated_user = self.objects["user_activated_coach"].id
        approved_user = self.objects["user_approved_coach"].id
        unactivated_user = self.objects["user_unactivated_coach"].id
        bad_user = "00000a00a00aa00aa000aaaa"

        await self.post_response(f"/users/{approved_user}/approve", {}, "user_admin", Status.BAD_REQUEST)
        user = await read_where(User, User.id == ObjectId(approved_user))
        self.assertTrue(user.approved)

        await self.post_response(f"/users/{unactivated_user}/approve", {}, "user_admin", Status.BAD_REQUEST)
        user = await read_where(User, User.id == ObjectId(unactivated_user))
        self.assertFalse(user.approved)
        self.assertFalse(user.active)

        await self.post_response(f"/users/{bad_user}/approve", {}, "user_admin", Status.NOT_FOUND)

        for user_title in self.saved_objects[User.__module__]:
            if user_title != "user_admin":
                await self.post_response(f"/users/{activated_user}/approve", {}, user_title, Status.FORBIDDEN)
                await self.post_response(f"/users/{approved_user}/approve", {}, user_title, Status.FORBIDDEN)
                await self.post_response(f"/users/{unactivated_user}/approve", {}, user_title, Status.FORBIDDEN)
                await self.post_response(f"/users/{bad_user}/approve", {}, user_title, Status.FORBIDDEN)

        # check that the user was not changed in the database
        user = await read_where(User, User.id == ObjectId(activated_user))
        self.assertFalse(user.approved)
        self.assertTrue(user.active)
        user = await read_where(User, User.id == ObjectId(approved_user))
        self.assertTrue(user.approved)
        self.assertTrue(user.active)
        user = await read_where(User, User.id == ObjectId(unactivated_user))
        self.assertFalse(user.approved)
        self.assertFalse(user.active)

        # Test correct
        await self.post_response(f"/users/{activated_user}/approve", {}, "user_admin", Status.SUCCES)
        user = await read_where(User, User.id == ObjectId(activated_user))
        self.assertTrue(user.approved)
