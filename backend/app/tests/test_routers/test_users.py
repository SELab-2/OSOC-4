import json
import os
from typing import Dict, Set, Tuple

from httpx import Response

from app.crud import read_where, read_all_where, update
from app.models.user import User, UserRole
from app.tests.test_base import Status, TestBase, Request
from app.tests.utils_for_tests.EditionGenerator import EditionGenerator


class TestUsers(TestBase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    async def assert_name_edits(self, allowed_users):
        """
        This function can be used to check whether all allowed users were able to successfully edit a name

        :param allowed_users:
        :return:
        """
        for user_title in self.users.keys():
            if user_title in allowed_users:
                user = await read_where(User, User.name == f"edited_by_{user_title}", session=self.session)
                self.assertIsNotNone(user, f"""'edited_by_{user_title}' was not found in the database,
                                               the user was not modified correctly.""")
            else:
                user = await read_where(User, User.name == f"edited_by_{user_title}", session=self.session)
                self.assertIsNone(user, f"""'edited_by_{user_title}' was found in the database,
                                            the user was wrongly modified.""")

    async def test_get_users(self):
        path = "/users"
        allowed_users: Set[str] = await self.get_users_by([UserRole.ADMIN])

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

    async def test_get_user_me(self):
        path = "/users/me"
        allowed_users: Set[str] = await self.get_users_by([UserRole.ADMIN, UserRole.COACH])

        # Test authorization & access-control
        responses: Dict[str, Response] = await self.auth_access_request_test(Request.GET, path, allowed_users)

        # Test result
        for user_title, response in responses.items():
            user = await self.get_user_by_name(user_title)  # collected from test_base
            ep_user = json.loads(response.content)["data"]  # collected from endpoint
            self.assertSequenceEqual({"name": user.name, "email": user.email, "role": user.role}, ep_user)

    async def test_patch_user_me(self):
        path = "/users/me"
        allowed_users: Set[str] = await self.get_users_by([UserRole.ADMIN, UserRole.COACH])
        allowed_users_path_and_body = {}
        blocked_users_path_and_body = {}

        for user_title in self.users.keys():
            body = {"name": f"edited_by_{user_title}"}
            if user_title in allowed_users:
                allowed_users_path_and_body[user_title] = path, body
            else:
                blocked_users_path_and_body[user_title] = path, body

        await self.auth_access_request_test_per_user(Request.PATCH,
                                                     allowed_users_path_and_body,
                                                     blocked_users_path_and_body)

        await self.assert_name_edits(allowed_users)

    async def test_post_add_user_data(self):
        # This test needs to be reworked when multiple users are allowed,
        # otherwise the same user will be created multiple times thus not every user will create a new user

        path = "/users/create"
        allowed_users: Set[str] = await self.get_users_by([UserRole.ADMIN])
        body = {"email": "added_user@test.com"}

        # Test authorization & access-control
        responses1: Dict[str, Response] = await self.auth_access_request_test(Request.POST, path, allowed_users, body)
        # Test again to create a duplicate user
        responses2: Dict[str, Response] = await self.auth_access_request_test(Request.POST, path, allowed_users, body)

        for user_title in allowed_users:
            self.assertEqual(json.loads(responses1.get(user_title).content)["data"],
                             json.loads(responses2.get(user_title).content)["data"],
                             "The returned user was different for it's creation and it's duplicate creation")

        # Test whether created user is in the database
        user = await read_where(User, User.email == body["email"], session=self.session)
        self.assertIsNotNone(user, f"'{body['email']}' was not found in the database.")

    async def test_get_users_id(self):
        expected_user = await self.get_user_by_name("user_admin")
        path = "/users/" + str(expected_user.id)
        allowed_users: Set[str] = await self.get_users_by([UserRole.ADMIN, UserRole.COACH])

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

    async def test_patch_update_user(self):
        path: str = "/users/"
        allowed_users: Set[str] = await self.get_users_by([UserRole.ADMIN])
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
                "name": f"edited_by_{user_title}",
                "role": int(UserRole.NO_ROLE),
                "active": True,
                "approved": True,
                "disabled": False
            }
            if user_title in allowed_users:
                allowed_users_path_and_body[user_title] = path + str(editable_user.id), body
            else:
                blocked_users_path_and_body[user_title] = path + str(editable_user.id), body

        # Test authorization & access-control with successful edits
        await self.auth_access_request_test_per_user(Request.PATCH,
                                                     allowed_users_path_and_body,
                                                     blocked_users_path_and_body)

        # Test failed requests
        bad_path = f"/users/{self.bad_id}"
        bad_body: Dict[str, str] = {"name": ""}
        await self.do_request(Request.PATCH, allowed_users_path_and_body.get("user_admin")[0], "user_admin",
                              json_body=bad_body, expected_status=Status.BAD_REQUEST)
        await self.do_request(Request.PATCH, bad_path, "user_admin",
                              json_body={"email": "bad_edited_by_user_admin@test.test",
                                         "name": "bad_edited_by_user_admin",
                                         "role": int(UserRole.NO_ROLE),
                                         "active": True, "approved": True, "disabled": False},
                              expected_status=Status.NOT_FOUND)

        await self.assert_name_edits(allowed_users)

    async def test_post_invite_user(self):
        unactivated_user = await self.get_user_by_name("user_unactivated_coach")

        path = f"/users/{unactivated_user.id}/invite"
        allowed_users: Set[str] = await self.get_users_by([UserRole.ADMIN])

        unactivated_user.email = os.getenv("TEST_EMAIL")
        await update(unactivated_user, session=self.session)

        active_user = await self.get_user_by_name("user_activated_coach")
        bad_user = self.bad_id

        # Test authorization & access-control
        await self.auth_access_request_test(Request.POST, path, allowed_users, {})

        # Test other cases
        await self.do_request(Request.POST, f"/users/{active_user.id}/invite", "user_admin",
                              json_body={}, expected_status=Status.BAD_REQUEST)
        await self.do_request(Request.POST, f"/users/{bad_user}/invite", "user_admin",
                              json_body={}, expected_status=Status.NOT_FOUND)

        await self.do_request(Request.POST, f"/users/{active_user.id}/invite", "user_approved_coach",
                              json_body={}, expected_status=Status.FORBIDDEN)
        await self.do_request(Request.POST, f"/users/{bad_user}/invite", "user_approved_coach",
                              json_body={}, expected_status=Status.FORBIDDEN)

    async def test_delete_user(self):
        user_to_del: User = await self.get_user_by_name("user_no_role")
        path = f"/users/{user_to_del.id}"

        # check coach access
        await self.do_request(Request.DELETE, path, "user_approved_coach", expected_status=Status.FORBIDDEN)
        db_user = await read_where(User, User.id == user_to_del.id, session=self.session)
        self.assertNotEquals((db_user.disabled, db_user.active, db_user.approved, db_user.password),
                             (True, False, False, ""),
                             "The user was deleted by a coach.")

        # correct request with admin
        await self.do_request(Request.DELETE, path, "user_admin", expected_status=Status.SUCCESS)
        db_user = await read_where(User, User.id == user_to_del.id, session=self.session)
        self.assertEqual((db_user.disabled, db_user.active, db_user.approved, db_user.password),
                         (True, False, False, ""),
                         "The user wasn't deleted by the admin.")

        # Try to delete imaginary user
        await self.do_request(Request.DELETE, f"/users/{self.bad_id}", "user_admin", expected_status=Status.NOT_FOUND)

    async def test_post_invite_disabled_user(self):
        eg = EditionGenerator(self.session)
        eg.generate_edition()
        eg.add_to_db()
        await self.session.commit()

        disabled_user = await self.get_user_by_name("user_disabled_coach")
        disabled_user.active = False
        disabled_user.email = os.getenv("TEST_EMAIL")
        await update(disabled_user, session=self.session)

        await self.do_request(Request.POST, f"/users/{disabled_user.id}/invite", "user_admin",
                              json_body={}, expected_status=Status.SUCCESS)

    async def test_post_approve_user(self):
        activated_user: User = await self.get_user_by_name("user_activated_coach")
        path: str = f"/users/{str(activated_user.id)}/approve"
        allowed_users: Set[str] = await self.get_users_by([UserRole.ADMIN])
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
