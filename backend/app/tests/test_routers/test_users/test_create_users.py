import json
from httpx import AsyncClient

from app.database import db
from app.models.user import User
from app.tests.test_base import Wrong, TestBase, DefaultTestUsers


class TestCreateUsers(TestBase):
    def __init__(self, *args, **kwargs):
        super().__init__(DefaultTestUsers, *args, **kwargs)

    async def test_create_users_as_admin(self):
        async def do(client: AsyncClient):
            body: dict[str, str] = {"email": "added_user_as_admin@test.com"}
            response = await self.post_response("/users/create", body, client, "user_admin", 200)
            await self.add_external_object("added_user_as_admin", json.loads(response.content))

            # Todo: check based on user in response. How to read binary response as User?
            users: list[User] = await db.engine.find(User)
            in_db: bool = False

            for user in users:
                if user.email == "added_user_as_admin@test.com":
                    in_db = True
                    break

            if not in_db:
                raise Wrong("Admin was unable to add user to the database.")

        await self.with_all(do)

    async def test_create_user_as_forbidden(self):
        """Test whether other users have the correct failing status code.

        307: Redirect
        403: Forbidden
        """

        body: dict[str, str] = {"email": "added_as_unauthorized@test.com"}

        async def do(client: AsyncClient):
            for user_title in DefaultTestUsers:
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
                                  "added_as_wrong_access_token@test.com", "testing@bla.com"]:
                    await db.engine.delete(user)
                    raise Wrong(f"{user} was incorrectly added to the database")

        await self.with_all(do)
