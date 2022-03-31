import json
import unittest
from typing import Dict, Set, Tuple

from httpx import Response
from odmantic import ObjectId

from app.crud import read_where
from app.database import db
from app.models.user import User, UserRole
from app.tests.test_base import Status, TestBase, Request
from app.utils.cryptography import verify_password
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
        path: str = "/users/forgot/"
        allowed_users: Set[str] = {"user_admin", "user_approved_coach"}
        allowed_users_path_and_body: Dict[str, Tuple[str, Dict[str, str]]] = {}
        blocked_users_path_and_body: Dict[str, Tuple[str, Dict[str, str]]] = {}

        new_pass: str = "ValidPass?!123"

        key = generate_new_reset_password_key()
        db.redis.setex(key[0], key[1], str(self.objects["user_approved_coach"].id))

        # Test using a wrong validate password
        await self.do_request(Request.POST, path + key[0], "user_admin",
                              json_body={"password": new_pass, "validate_password": new_pass + "1"},
                              expected_status=Status.BAD_REQUEST)

        # Request using invalid reset keys
        await self.do_request(Request.POST, "/users/forgot/" + "Rohnonotsogood", "user_admin",
                              json_body={"password": new_pass, "validate_password": new_pass},
                              expected_status=Status.BAD_REQUEST)
        await self.do_request(Request.POST, "/users/forgot/" + "Iohnoevenworse", "user_admin",
                              json_body={"password": new_pass, "validate_password": new_pass},
                              expected_status=Status.BAD_REQUEST)

        # Request using key from other user
        key = generate_new_reset_password_key()
        db.redis.setex(key[0], key[1], str(self.objects["user_approved_coach"].id))

        await self.do_request(Request.POST, f"/users/forgot/{key[0]}", "user_admin",
                              json_body={"password": new_pass, "validate_password": new_pass},
                              expected_status=Status.FORBIDDEN)

        ##################################
        # Check passwords aren't changed #
        ##################################
        for user_title in allowed_users:
            lcl_user: User = self.users[user_title]
            db_user: User = await read_where(User, User.id == ObjectId(lcl_user.id))

            self.assertEqual(lcl_user.password, db_user.password, "The password was changed after bad requests")

        #######################################
        # Test authorization & access-control #
        #######################################
        for user_title in self.users.keys():
            key = generate_new_reset_password_key()
            db.redis.setex(key[0], key[1], str(self.users[user_title].id))

            if user_title in allowed_users:
                allowed_users_path_and_body[user_title] = path + key[0], {"password": new_pass,
                                                                          "validate_password": new_pass}
            else:
                blocked_users_path_and_body[user_title] = path + key[0], {"password": new_pass,
                                                                          "validate_password": new_pass}
        await self.auth_access_request_test_per_user(Request.POST,
                                                     allowed_users_path_and_body,
                                                     blocked_users_path_and_body)
        ###########################
        # Check current passwords #
        ###########################
        for user_title in allowed_users:  # Check password was changed
            lcl_user: User = self.users[user_title]
            db_user: User = await read_where(User, User.id == ObjectId(lcl_user.id))

            self.assertTrue(verify_password(new_pass, db_user.password),
                            "The password wasn't changed after successful requests")

        for user_title in set(self.users.keys()).difference(allowed_users):  # Check password wasn't changed
            lcl_user: User = self.users[user_title]
            db_user: User = await read_where(User, User.id == ObjectId(lcl_user.id))

            self.assertEqual(lcl_user.password, db_user.password, "The password was changed after bad requests")

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

    async def test_post_update_user(self):
        path: str = "/users/"
        allowed_users: Set[str] = {"user_admin"}
        allowed_users_path_and_body: Dict[str, Tuple[str, Dict[str, str]]] = {}
        blocked_users_path_and_body: Dict[str, Tuple[str, Dict[str, str]]] = {}

        for user_title in self.users.keys():
            # Make sure everyone has a unique user to edit
            editable_user = User(
                email=f"to_be_edited_by_{user_title}@test.be",
                name=f"to_be_edited_by_{user_title}",
                password="Test123!user_no_role",
                role=UserRole.NO_ROLE,
                active=False,
                approved=False,
                disabled=False)
            await db.engine.save(editable_user)
            body = {"email": f"edited_by_{user_title}@test.test",
                    "name": f"edited_by_{user_title}"}
            if user_title in allowed_users:
                allowed_users_path_and_body[user_title] = path + str(editable_user.id), body
            else:
                blocked_users_path_and_body[user_title] = path + str(editable_user.id), body

        # Test authorization & access-control with successful edits
        await self.auth_access_request_test_per_user(Request.POST,
                                                     allowed_users_path_and_body,
                                                     blocked_users_path_and_body)

        # Test failed requests
        bad_path = "/users/00000a00a00aa00aa000aaaa"
        bad_body: Dict[str, str] = {"email": self.objects["user_admin"].email, "name": "Rocky"}
        await self.do_request(Request.POST, allowed_users_path_and_body.get("user_admin")[0], "user_admin",
                              json_body=bad_body, expected_status=Status.BAD_REQUEST)
        await self.do_request(Request.POST, bad_path, "user_admin",
                              json_body={"email": "bad_edited_by_user_admin@test.test",
                                         "name": "bad_edited_by_user_admin"}, expected_status=Status.NOT_FOUND)

        # assert edits
        for user_title in self.users.keys():
            if user_title in allowed_users:
                user = await db.engine.find_one(User, User.name == f"edited_by_{user_title}")
                self.assertIsNotNone(user, f"""
                                     edited_by_{user_title} was not found in the database,
                                     the user was not modified correctly.""")
            else:
                user = await db.engine.find_one(User, User.name == f"edited_by_{user_title}")
                self.assertIsNone(user, f"""
                                     edited_by_{user_title} was found in the database,
                                     the user was wrongly modified.""")

    @unittest.skip("Prevent email spam")
    async def test_post_invite_user(self):
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
        activated_user: str = str(self.objects['user_activated_coach'].id)
        path: str = f"/users/{activated_user}/approve"
        allowed_users: Set[str] = {"user_admin"}
        body: Dict[str, str] = {}

        approved_user: str = str(self.objects["user_approved_coach"].id)
        unactivated_user: str = self.objects["user_unactivated_coach"].id
        bad_user: str = "00000a00a00aa00aa000aaaa"

        # Do failed requests
        await self.do_request(Request.POST, f"/users/{approved_user}/approve", "user_admin",
                              json_body=body, expected_status=Status.BAD_REQUEST)
        user = await read_where(User, User.id == ObjectId(approved_user))
        self.assertTrue(user.approved)

        await self.do_request(Request.POST, f"/users/{unactivated_user}/approve", "user_admin",
                              json_body=body, expected_status=Status.BAD_REQUEST)
        user = await read_where(User, User.id == ObjectId(unactivated_user))
        self.assertFalse(user.approved)
        self.assertFalse(user.active)

        await self.do_request(Request.POST, f"/users/{bad_user}/approve", "user_admin",
                              json_body=body, expected_status=Status.NOT_FOUND)

        await self.auth_access_request_test(Request.POST, path, allowed_users, body)

        # Test correct
        user = await read_where(User, User.id == ObjectId(activated_user))
        self.assertTrue(user.approved)
