import json

from httpx import AsyncClient

from app.database import db
from app.models.user import User
from app.tests.test_base import TestBase, Wrong


class TestGetUsers(TestBase):
    def __init__(self, *args, **kwargs):
        super().__init__({}, *args, **kwargs)

    async def test_get_users_as_admin(self):
        async def do(client: AsyncClient):
            response = await self.get_response("/users/", client, "user_admin", 200)
            gotten_users = json.loads(response.content)["data"]
            users = await db.engine.find(User)

            user_emails: list[str] = sorted([user.email for user in users])
            gotten_user_emails: list[str] = sorted([user["email"] for user in gotten_users])

            if user_emails != gotten_user_emails:
                raise Wrong("Users in the database were not the same as the returned users.\n"
                            f"Expected: {user_emails}\n"
                            f"Was: {gotten_user_emails}")

        await self.with_all(do)

    async def test_get_users_as_forbidden(self):
        """Test whether other users have the correct failing status code.

        403: Forbidden
        422: Unprocessable
        """

        async def do(client: AsyncClient):
            for user_title in self.objects:
                if user_title != "user_admin":
                    await self.get_response("/users/", client, user_title, 403)

            # No authorization
            await self.get_response("/users/", client, "user_no_role", 403, access_token="",
                                    use_access_token=False)
            # Wrong authorization
            await self.get_response("/users/", client, "user_no_role", 403,
                                    access_token="wrong token")

        await self.with_all(do)
