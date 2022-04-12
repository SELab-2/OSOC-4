import json
import unittest
from typing import Dict, Set, Tuple

from httpx import Response

from app.crud import read_where, read_all_where, update
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
        db_users = await read_all_where(User, session=self.session)  # collected from DataBase itself
        db_users = sorted([str(user.id) for user in db_users])

        for response in responses.values():
            ep_users = json.loads(response.content)  # collected from EndPoint
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
            user = await self.get_user_by_name(user_title)  # collected from test_base
            ep_user = json.loads(response.content)["data"]  # collected from endpoint
            self.assertSequenceEqual({"name": user.name, "email": user.email, "role": user.role}, ep_user)

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
        user = await read_where(User, User.email == body["email"], session=self.session)
        self.assertIsNotNone(user, f"'{body['email']}' was not found in the database.")

    async def test_post_forgot(self):
        path: str = "/users/forgot/"
        allowed_users: Set[str] = {"user_admin", "user_approved_coach"}
        allowed_users_path_and_body: Dict[str, Tuple[str, Dict[str, str]]] = {}
        blocked_users_path_and_body: Dict[str, Tuple[str, Dict[str, str]]] = {}

        new_pass: str = "ValidPass?!123"

        key = generate_new_reset_password_key()
        forgotten_user = await self.get_user_by_name("user_approved_coach")
        db.redis.setex(key[0], key[1], int(forgotten_user.id))

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
        db.redis.setex(key[0], key[1], int(forgotten_user.id))

        await self.do_request(Request.POST, f"/users/forgot/{key[0]}", "user_admin",
                              json_body={"password": new_pass, "validate_password": new_pass},
                              expected_status=Status.FORBIDDEN)

        ##################################
        # Check passwords aren't changed #
        ##################################
        for user_title in allowed_users:
            user: User = await self.get_user_by_name(user_title)

            self.assertTrue(verify_password(f"Test123!{user_title}", user.password),
                            "The password was changed after bad requests")

        #######################################
        # Test authorization & access-control #
        #######################################
        for user_title in self.users.keys():
            key = generate_new_reset_password_key()
            forgotten_user = await self.get_user_by_name(user_title)
            db.redis.setex(key[0], key[1], int(forgotten_user.id))

            if user_title in allowed_users:
                allowed_users_path_and_body[user_title] = path + key[0], {"password": new_pass,
                                                                          "validate_password": new_pass}
            else:
                blocked_users_path_and_body[user_title] = path + key[0], {"password": new_pass,
                                                                          "validate_password": new_pass}
        # change to new passwords where allowed
        await self.auth_access_request_test_per_user(Request.POST,
                                                     allowed_users_path_and_body,
                                                     blocked_users_path_and_body)
        ###########################
        # Check current passwords #
        ###########################
        for user_title in allowed_users:  # Check password was changed
            user: User = await self.get_user_by_name(user_title)
            self.assertTrue(verify_password(new_pass, user.password),
                            "The password wasn't changed after successful requests")

        for user_title in set(self.users.keys()).difference(allowed_users):  # Check password wasn't changed
            user: User = await self.get_user_by_name(user_title)
            self.assertFalse(verify_password(new_pass, user.password), "The password was changed after bad requests")

    async def test_get_users_id(self):
        expected_user = await self.get_user_by_name("user_admin")
        path = "/users/" + str(expected_user.id)
        allowed_users = {"user_admin", "user_approved_coach"}

        bad_path = "/users/" + str(self.bad_id)

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

    @unittest.skip("Emails can't be updated?")
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
            await update(editable_user, session=self.session)
            body = {
                "email": f"edited_by_{user_title}@test.test",
                "name": f"edited_by_{user_title}",
                "active": True,
                "approved": True,
                "disabled": False
            }
            if user_title in allowed_users:
                allowed_users_path_and_body[user_title] = path + str(editable_user.id), body
            else:
                blocked_users_path_and_body[user_title] = path + str(editable_user.id), body

        # Test authorization & access-control with successful edits
        await self.auth_access_request_test_per_user(Request.POST,
                                                     allowed_users_path_and_body,
                                                     blocked_users_path_and_body)

        # Test failed requests
        bad_path = f"/users/{self.bad_id}"
        admin = await self.get_user_by_name("user_admin")
        bad_body: Dict[str, str] = {
            "email": admin.email, "name": "Rocky", "active": True, "approved": True, "disabled": False
        }
        await self.do_request(Request.POST, allowed_users_path_and_body.get("user_admin")[0], "user_admin",
                              json_body=bad_body, expected_status=Status.BAD_REQUEST)
        await self.do_request(Request.POST, bad_path, "user_admin",
                              json_body={"email": "bad_edited_by_user_admin@test.test",
                                         "name": "bad_edited_by_user_admin",
                                         "active": True, "approved": True, "disabled": False},
                              expected_status=Status.NOT_FOUND)

        # assert edits
        for user_title in self.users.keys():
            if user_title in allowed_users:
                user = await read_where(User, User.name == f"edited_by_{user_title}", session=self.session)
                self.assertIsNotNone(user, f"""
                                     edited_by_{user_title} was not found in the database,
                                     the user was not modified correctly.""")
            else:
                user = await read_where(User, User.name == f"edited_by_{user_title}", session=self.session)
                self.assertIsNone(user, f"""
                                     edited_by_{user_title} was found in the database,
                                     the user was wrongly modified.""")

    @unittest.skip("Prevent email spam.")
    async def test_post_invite_user(self):
        unactivated_user = await self.get_user_by_name("user_unactivated_coach")

        path = f"/users/{unactivated_user.id}/invite"
        allowed_users = {"user_admin"}
        body = {}

        unactivated_user.email = "Stef.VandenHaute+SEL2TEST@UGent.be"  # TODO: set in env
        await update(unactivated_user, session=self.session)

        active_user = await self.get_user_by_name("user_activated_coach")
        bad_user = self.bad_id

        # Test authorization & access-control
        await self.auth_access_request_test(Request.POST, path, allowed_users, body)

        # Test other cases
        await self.do_request(Request.POST, f"/users/{active_user.id}/invite", "user_admin",
                              json_body={}, expected_status=Status.BAD_REQUEST)
        await self.do_request(Request.POST, f"/users/{bad_user}/invite", "user_admin",
                              json_body={}, expected_status=Status.NOT_FOUND)

        await self.do_request(Request.POST, f"/users/{active_user.id}/invite", "user_approved_coach",
                              json_body={}, expected_status=Status.FORBIDDEN)
        await self.do_request(Request.POST, f"/users/{bad_user}/invite", "user_approved_coach",
                              json_body={}, expected_status=Status.FORBIDDEN)

    async def test_post_approve_user(self):
        activated_user: User = await self.get_user_by_name("user_activated_coach")
        path: str = f"/users/{str(activated_user.id)}/approve"
        allowed_users: Set[str] = {"user_admin"}
        body: Dict[str, str] = {}

        approved_user: User = await self.get_user_by_name("user_approved_coach")
        unactivated_user: User = await self.get_user_by_name("user_unactivated_coach")
        bad_user: str = str(self.bad_id)

        # Do failed requests
        await self.do_request(Request.POST, f"/users/{str(approved_user.id)}/approve", "user_admin",
                              json_body=body, expected_status=Status.BAD_REQUEST)
        user = await read_where(User, User.id == approved_user.id, session=self.session)
        self.assertTrue(user.approved)

        await self.do_request(Request.POST, f"/users/{str(unactivated_user.id)}/approve", "user_admin",
                              json_body=body, expected_status=Status.BAD_REQUEST)
        user = await read_where(User, User.id == unactivated_user.id, session=self.session)
        self.assertFalse(user.approved)
        self.assertFalse(user.active)

        await self.do_request(Request.POST, f"/users/{bad_user}/approve", "user_admin",
                              json_body=body, expected_status=Status.NOT_FOUND)

        await self.auth_access_request_test(Request.POST, path, allowed_users, body)

        # Test correct
        user = await read_where(User, User.id == activated_user.id, session=self.session)
        self.assertTrue(user.approved)
