import json
import unittest
from typing import Dict

from httpx import Response
from odmantic import ObjectId

from app.crud import read_where
from app.database import db
from app.models.user import User
from app.tests.test_base import Status, TestBase, Request
from app.utils.keygenerators import generate_new_reset_password_key


class TestUsers(TestBase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    async def test_get_users(self):
        path = "/users"
        allowed_users = {"user_admin"}

        # Test authorization & access-control
        responses: Dict[str, Response] = await self.auth_access_request_test(Request.GET, path, allowed_users)

        # Test result
        db_users = await db.engine.find(User)  # collected from DataBase itself
        db_users = sorted([str(user.id) for user in db_users])

        for response in responses.values():
            ep_users = json.loads(response.content)["data"]  # collected from EndPoint
            ep_users = sorted([user["id"].split("/")[-1] for user in ep_users])

            self.assertTrue(db_users == ep_users,
                            f"""Users in the database were not the same as the returned users.
                            Expected: {db_users}
                            Was: {ep_users}""")

    async def test_get_users_me(self):
        path = "/users/me"
        allowed_users = {"user_admin", "user_approved_coach"}

        # Test authorization & access-control
        responses: Dict[str, Response] = await self.auth_access_request_test(Request.GET, path, allowed_users)

        # Test result
        for user_title, response in responses.items():
            user = self.objects[user_title]  # collected from test_base
            ep_user = json.loads(response.content)["data"]["id"].split("/")[-1]  # collected from endpoint
            self.assertEqual(str(user.id), ep_user)

    async def test_post_add_user_data(self):
        # This test needs to be reworked when multiple users are allowed,
        # otherwise the same user will be created multiple times thus not every user will create a new user

        path = "/users/create"
        allowed_users = {"user_admin"}
        body = {"email": "added_user@test.com"}

        # Test authorization & access-control
        responses1: Dict[str, Response] = await self.auth_access_request_test(Request.POST, path, allowed_users, body)
        # Test again to create a duplicate user
        responses2: Dict[str, Response] = await self.auth_access_request_test(Request.POST, path, allowed_users, body)

        for user_title in allowed_users:
            self.assertEquals(json.loads(responses1.get(user_title).content)["data"],
                              json.loads(responses2.get(user_title).content)["data"],
                              "The returned user was different for it's creation and it's duplicate creation")

        # Test whether created user is in the database
        user = await db.engine.find_one(User, User.email == body["email"])
        self.assertIsNotNone(user, f"'{body['email']}' was not found in the database.")

    async def test_post_forgot(self):
        path = "/users/forgot/"
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
            await self.do_request(Request.POST, f"{path}{key[0]}", user_title,
                                  json_body=bad_body, expected_status=Status.BAD_REQUEST)
            self.assertEqual(user.password, self.saved_objects[user_title].password,
                             f"The password of {user_title} was {user.password}. "
                             f"Expected: {self.saved_objects[user_title].password}")

            # Now the password is encrypted in self.objects
            key = generate_new_reset_password_key()
            db.redis.setex(key[0], key[1], str(user.id))

            await self.do_request(Request.POST, f"{path}{key[0]}", user_title,
                                  json_body=body, expected_status=Status.SUCCESS)
            # Since password is encrypted, we assert using a simple get with the new password
            self.saved_objects["passwords"][user_title] = new_pass
            await self.do_request(Request.GET, "/users/me", user_title, Status.SUCCESS)

        # Request using invalid reset keys
        await self.do_request(Request.POST, f"{path}Rohnonotsogood", "user_admin",
                              json_body=body, expected_status=Status.BAD_REQUEST)
        await self.do_request(Request.POST, f"{path}Iohnoevenworse", "user_admin",
                              json_body=body, expected_status=Status.BAD_REQUEST)

        key = generate_new_reset_password_key()
        db.redis.setex(key[0], key[1], str(self.objects["user_approved_coach"].id))

        await self.do_request(Request.POST, f"/users/forgot/{key[0]}", "user_admin",
                              json_body=body, expected_status=Status.FORBIDDEN)

    async def test_get_users_id(self):
        expected_user = self.users["user_admin"]
        path = "/users/" + str(expected_user.id)
        allowed_users = {"user_admin", "user_approved_coach"}

        bad_path = "/users/00000a00a00aa00aa000aaaa"

        # Test authorization & access-control
        responses: Dict[str, Response] = await self.auth_access_request_test(Request.GET, path, allowed_users)
        # Test get user that doesn't exist
        await self.do_request(Request.GET, bad_path, "user_admin", Status.NOT_FOUND)

        # Test responses
        for user_title, response in responses.items():
            gotten_user = json.loads(response.content)["data"]
            self.assertTrue(expected_user.email == gotten_user["email"],
                            f"""The incorrect user was fetched by {user_title}
                                 Expected: {expected_user}
                                 Was: {gotten_user}""")

    async def test_post_users_id(self):
        # This test needs to be reworked when multiple users are allowed,
        # otherwise the same user will be edited multiple times thus not every user will have modified the user

        user_to_edit = self.objects["user_no_role"]
        path = "/users/" + str(user_to_edit.id)
        allowed_users = {"user_admin"}
        body: Dict[str, str] = {"email": user_to_edit.email, "name": "Rocky"}

        bad_path = "/users/00000a00a00aa00aa000aaaa"
        bad_body: Dict[str, str] = {"email": self.objects["user_admin"].email, "name": "Rocky"}

        # Test authorization & access-control
        await self.auth_access_request_test(Request.POST, path, allowed_users, body)

        # Test response
        user = await db.engine.find_one(User, User.id == user_to_edit.id and User.name == body["name"])
        self.assertIsNotNone(user, f"""
                             {body} was not found in the database,
                             the user was not modified correctly.""")

        await self.do_request(Request.POST, path, "user_admin",
                              json_body=bad_body, expected_status=Status.BAD_REQUEST)
        await self.do_request(Request.POST, bad_path, "user_admin",
                              json_body=body, expected_status=Status.NOT_FOUND)

    @unittest.skip("Prevent email spam")
    async def test_post_users_id_invite(self):
        unactivated_user = self.objects["user_unactivated_coach"].id

        path = f"/users/{unactivated_user}/invite"
        allowed_users = {"user_admin"}
        body = {}

        unactivated_user.email = "Stef.VandenHaute@UGent.be"  # Todo: set in env variable
        active_user = self.objects["user_activated_coach"].id
        bad_user = "00000a00a00aa00aa000aaaa"

        # Test authorization & access-control
        await self.auth_access_request_test(Request.POST, path, allowed_users, body)

        # Test other cases
        await self.do_request(Request.POST, f"/users/{active_user}/invite", "user_admin",
                              json_body={}, expected_status=Status.BAD_REQUEST)
        await self.do_request(Request.POST, f"/users/{bad_user}/invite", "user_admin",
                              json_body={}, expected_status=Status.NOT_FOUND)

        await self.do_request(Request.POST, f"/users/{active_user}/invite", "user_approved_coach",
                              json_body={}, expected_status=Status.FORBIDDEN)
        await self.do_request(Request.POST, f"/users/{bad_user}/invite", "user_approved_coach",
                              json_body={}, expected_status=Status.FORBIDDEN)

    async def test_post_approve_user(self):
        activated_user = self.objects["user_activated_coach"].id
        approved_user = self.objects["user_approved_coach"].id
        unactivated_user = self.objects["user_unactivated_coach"].id
        bad_user = "00000a00a00aa00aa000aaaa"

        await self.do_request(Request.POST, f"/users/{approved_user}/approve", "user_admin",
                              json_body={}, expected_status=Status.BAD_REQUEST)
        user = await read_where(User, User.id == ObjectId(approved_user))
        self.assertTrue(user.approved)

        await self.do_request(Request.POST, f"/users/{unactivated_user}/approve", "user_admin",
                              json_body={}, expected_status=Status.BAD_REQUEST)
        user = await read_where(User, User.id == ObjectId(unactivated_user))
        self.assertFalse(user.approved)
        self.assertFalse(user.active)

        await self.do_request(Request.POST, f"/users/{bad_user}/approve", "user_admin",
                              json_body={}, expected_status=Status.NOT_FOUND)

        for user_title in self.saved_objects["User"]:
            if user_title != "user_admin":
                await self.do_request(Request.POST, f"/users/{activated_user}/approve", user_title,
                                      json_body={}, expected_status=Status.FORBIDDEN)
                await self.do_request(Request.POST, f"/users/{approved_user}/approve", user_title,
                                      json_body={}, expected_status=Status.FORBIDDEN)
                await self.do_request(Request.POST, f"/users/{unactivated_user}/approve", user_title,
                                      json_body={}, expected_status=Status.FORBIDDEN)
                await self.do_request(Request.POST, f"/users/{bad_user}/approve", user_title,
                                      json_body={}, expected_status=Status.FORBIDDEN)

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
        await self.do_request(Request.POST, f"/users/{activated_user}/approve", "user_admin",
                              json_body={}, expected_status=Status.SUCCESS)
        user = await read_where(User, User.id == ObjectId(activated_user))
        self.assertTrue(user.approved)
