import json

from httpx import AsyncClient

from app.database import db
from app.models.user import User
from app.tests.test_base import Wrong, TestBase


class TestCreateUsers(TestBase):
    def __init__(self, *args, **kwargs):
        super().__init__({}, *args, **kwargs)

    async def test_create_users_as_admin(self):
        async def do(client: AsyncClient):
            body: dict[str, str] = {"email": "added_user_as_admin@test.com"}
            response = await self.post_response("/users/create", body, client, "user_admin", 200)

            user = await db.engine.find(User, {"email": json.loads(response.content)["data"]["email"]})

            if not user:
                raise Wrong(f"{body['email']} was not found in the database")
            else:
                await self.add_external_object("added_user_as_admin", user[0])

        await self.with_all(do)

    async def test_create_user_as_forbidden(self):
        """Test whether other users have the correct failing status code.

        401: Unauthorized
        403: Forbidden
        422: Unprocessable
        """

        body: dict[str, str] = {"email": "added_as_unauthorized@test.com"}

        async def do(client: AsyncClient):
            for user_title in self.objects:
                if user_title != "user_admin":
                    await self.post_response("/users/create", body, client, user_title, 403)

            body["email"] = "added_as_no_access_token@test.com"
            # No authorization
            await self.post_response("/users/create", body, client, "user_no_role", 401,
                                     access_token="", use_access_token=False)

            body["email"] = "added_as_wrong_access_token@test.com"
            # Wrong authorization
            await self.post_response("/users/create", body, client, "user_no_role", 422,
                                     access_token="wrong token")

            # check that no users were added to the database
            users: list[User] = await db.engine.find(User)
            for user in users:
                if user.email in ["added_as_unauthorized@test.com", "added_as_no_access_token@test.com",
                                  "added_as_wrong_access_token@test.com"]:
                    await db.engine.delete(user)
                    raise Wrong(f"{user} was incorrectly added to the database")

        await self.with_all(do)
