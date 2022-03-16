import unittest

from httpx import AsyncClient
from typing import Dict, List

from app.database import db
from app.exceptions.permissions import NotPermittedException
from app.models.user import User
from app.tests.test_base import TestBase, Wrong
from app.utils.checkers import RoleChecker

testbase = TestBase()


class TestUsers(unittest.IsolatedAsyncioTestCase):
    @testbase(that=self)
    async def test_role(self, client: AsyncClient):
        print("in test create user")

        body: Dict[str, str] = {"email": "added_as_unauthorized@test.com"}

        for user_title in testbase.objects:
            if user_title != "user_admin":
                await testbase.post_response("/users/create", body, client, user_title, 403)

        body["email"] = "added_as_no_access_token@test.com"
        # No authorization
        await testbase.post_response("/users/create", body, client, "user_no_role", 401,
                                     access_token="", use_access_token=False)

        body["email"] = "added_as_wrong_access_token@test.com"
        # Wrong authorization
        await testbase.post_response("/users/create", body, client, "user_no_role", 401,
                                     access_token="wrong token")

        # check that no users were added to the database
        users: List[User] = await db.engine.find(User)
        for user in users:
            await db.engine.delete(user)
        for user in users:
            self.assertTrue(user.email in ["added_as_unauthorized@test.com", "added_as_no_access_token@test.com",
                                           "added_as_wrong_access_token@test.com"])
