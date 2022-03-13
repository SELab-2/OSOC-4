from httpx import AsyncClient

from app.tests.test_base import TestBase


class TestGetUsers(TestBase):
    def __init__(self, *args, **kwargs):
        super().__init__({}, *args, **kwargs)

    async def test_get_users_as_admin(self):
        async def do(client: AsyncClient):
            # TODO check response.content
            await self.get_response("/users/", client, "user_admin", 200)

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
            await self.get_response("/users/", client, "user_no_role", 422,
                                    access_token="wrong token")

        await self.with_all(do)
