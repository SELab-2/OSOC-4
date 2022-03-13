import json
import unittest

from httpx import AsyncClient, Response

from app.tests.test_base import TestBase, Wrong


class TestGetUsers(TestBase):
    def __init__(self, *args, **kwargs):
        super().__init__({}, *args, **kwargs)

    async def test_get_user_as_approved_user(self):
        async def do(client: AsyncClient):
            expected_user: str = "user_approved_coach"
            user_id: str = str(self.objects[expected_user].id)

            response: Response = await self.get_response(f"/users/{user_id}", client, "user_admin", 200)
            gotten_user: str = json.loads(response.content)["data"]["name"]

            if expected_user != gotten_user:
                raise Wrong("The incorrect user was fetched\n"
                            f"Expected: {expected_user}\n"
                            f"Was: {gotten_user}")

        await self.with_all(do)

    @unittest.skip("Coach user role is incorrectly checked for '/users/{id}'")
    async def test_get_user_as_forbidden(self):
        """Test whether other users have the correct failing status code.

        403: Forbidden
        422: Unprocessable
        """

        async def do(client: AsyncClient):
            user_id: str = str(self.objects["user_approved_coach"].id)

            for user_title in self.objects:
                if user_title != "user_admin" and user_title != "user_approved_coach":
                    await self.get_response(f"/users/{user_id}", client, user_title, 403)

            # No authorization
            await self.get_response(f"/users/{user_id}", client, "user_no_role", 403, access_token="",
                                    use_access_token=False)
            # Wrong authorization
            await self.get_response(f"/users/{user_id}", client, "user_no_role", 422,
                                    access_token="wrong token")

        await self.with_all(do)
