import unittest

from asgi_lifespan import LifespanManager
from httpx import AsyncClient, Response

from app.api import app
from app.database import db
from app.models.user import User, UserRole
from app.utils.cryptography import get_password_hash


class Wrong(Exception):
    msg: str

    def __init__(self, msg=None):
        self.msg = msg

    def __str__(self):
        return self.msg


class TestBase(unittest.IsolatedAsyncioTestCase):
    def __init__(self, objects, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.objects = {
            "user_admin": User(
                email="user_admin@test.be",
                name="user_admin",
                password="Test123!user_admin",
                role=UserRole.ADMIN,
                active=True, approved=True),
            "user_approved_coach": User(
                email="user_approved_coach@test.be",
                name="user_approved_coach",
                password="Test123!user_approved_coach",
                role=UserRole.COACH,
                active=True, approved=True),
            "user_activated_coach": User(
                email="user_activated_coach@test.be",
                name="user_activated_coach",
                password="Test123!user_activated_coach",
                role=UserRole.COACH,
                active=True, approved=False),
            "user_unactivated_coach": User(
                email="user_unactivated_coach@test.be",
                name="user_unactivated_coach",
                password="Test123!user_unactivated_coach",
                role=UserRole.COACH,
                active=False,
                approved=False),
            "user_no_role": User(
                email="user_no_role@test.be",
                name="user_no_role",
                password="Test123!user_no_role",
                role=UserRole.NO_ROLE,
                active=False,
                approved=False)
        }
        self.objects.update(objects)
        self.saved_objects = {"passwords": {}}

    async def get_access_token(self, client, user: str):
        print("get_acces_token")
        email: str = self.saved_objects[user].email
        password: str = self.saved_objects["passwords"][user]
        login = await client.post("/login", json={"email": email, "password": password},
                                  headers={"Content-Type": "application/json"})
        return login.cookies["csrf_access_token"]

    async def get_response(self, path: str, client: AsyncClient, user: str, expected_status: int = 200,
                           access_token: str = None, use_access_token: bool = True) -> Response:
        """GET request test template

        Tests whether a request with the given data matches the expected status and returns the response.

        Args:
        :param path: The path of the GET request
        :type path: str
        :param client: The AsyncClient
        :type client: AsyncClient
        :param user: The requesting user
        :type user: str
        :param expected_status: The expected status of the request, defaults to 200
        :type expected_status: int
        :param access_token: The access token of the request, defaults to token of user
        :type access_token: str
        :param use_access_token: Toggle whether an access token is used in the request
        :type use_access_token: bool

        :return: The response of the GET request
        :rtype: Response
        """
        if access_token is None:
            access_token = await self.get_access_token(client, user)

        if use_access_token:
            response = await client.get(path, headers={"X-CSRF-TOKEN": access_token})
        else:
            response = await client.get(path)

        if response.status_code != expected_status:
            raise Wrong(
                f"While doing GET to '{path}': "
                f"Unexpected status for {user}, "
                f"status code was {response.status_code}, "
                f"expected {expected_status}"
            )

        return response

    async def post_response(self, path: str, json_body: dict, client: AsyncClient, user: str,
                            expected_status: int = 200, access_token: str = None,
                            use_access_token: bool = True) -> Response:
        """POST request test template

        Tests whether a request with the given data matches the expected status and returns the response.

        :param path: The path of the POST request
        :type path: str
        :param json_body: The POST body
        :type json_body: dict
        :param client: The AsyncClient
        :type client: AsyncClient
        :param user: The requesting user
        :type user: str
        :param expected_status: The expected status of the POST request, defaults to 200
        :type expected_status: int
        :param access_token: The access token of the request, defaults to token of user
        :type access_token: str
        :param use_access_token: Toggle whether an access token is used in the request
        :type use_access_token: bool

        :return: The response of the POST request
        :rtype: Response
        """
        if access_token is None:
            access_token = await self.get_access_token(client, user)

        if use_access_token:
            response = await client.post(path, json=json_body, headers={"X-CSRF-TOKEN": access_token,
                                                                        "Content-Type": "application/json"})
        else:
            response = await client.post(path, json=json_body, headers={"Content-Type": "application/json"})

        if response.status_code != expected_status:
            raise Wrong(
                f"While doing POST of\n"
                f"{json_body}\n"
                f"to '{path}': "
                f"Unexpected status for {user}, "
                f"status code was {response.status_code}, "
                f"expected {expected_status}"
            )

        return response

    async def add_external_object(self, key, obj, save_obj=False):
        if isinstance(obj, User):
            plain_password = obj.password
            obj.password = get_password_hash(obj.password)
            self.saved_objects["passwords"][key] = plain_password

        if save_obj:
            self.saved_objects[key] = await db.engine.save(obj)
        else:
            self.saved_objects[key] = obj

    async def with_all(self, func):
        async with AsyncClient(app=app, base_url="http://test") as client, LifespanManager(app):

            for k, obj in self.objects.items():
                await self.add_external_object(k, obj, True)

            async def delete():
                for object in self.saved_objects.values():
                    if not isinstance(object, dict):
                        await db.engine.delete(object)

            try:
                await func(client=client)
                await delete()
            except Wrong as wrong:
                await delete()
                self.assertTrue(False, wrong.msg)
            except Exception as e:
                await delete()
                raise e
