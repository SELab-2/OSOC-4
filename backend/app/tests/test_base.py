import asyncio
import unittest
from enum import IntEnum
from typing import List, Set, Dict

from asgi_lifespan import LifespanManager
from httpx import AsyncClient, Response

from app.api import app
from app.database import db
from app.models.answer import Answer
from app.models.edition import Edition
from app.models.participation import Participation
from app.models.project import Project, Partner
from app.models.question import Question
from app.models.question_answer import QuestionAnswer
from app.models.skill import Skill
from app.models.student import Student
from app.models.suggestion import Suggestion
from app.models.user import User, UserRole
from app.utils.cryptography import get_password_hash


class Status(IntEnum):
    SUCCES = 200
    BAD_REQUEST = 400
    UNAUTHORIZED = 401
    FORBIDDEN = 403
    NOT_FOUND = 404
    UNPROCESSABLE = 422


class TestBase(unittest.IsolatedAsyncioTestCase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.users = {
            "user_admin": User(
                email="user_admin@test.be",
                name="user_admin",
                password="Test123!user_admin",
                role=UserRole.ADMIN,
                active=True,
                approved=True,
                disabled=False),
            "user_unactivated_coach": User(
                email="user_unactivated_coach@test.be",
                name="user_unactivated_coach",
                password="Test123!user_unactivated_coach",
                role=UserRole.COACH,
                active=False,
                approved=False,
                disabled=False),
            "user_activated_coach": User(
                email="user_activated_coach@test.be",
                name="user_activated_coach",
                password="Test123!user_activated_coach",
                role=UserRole.COACH,
                active=True,
                approved=False,
                disabled=False),
            "user_approved_coach": User(
                email="user_approved_coach@test.be",
                name="user_approved_coach",
                password="Test123!user_approved_coach",
                role=UserRole.COACH,
                active=True,
                approved=True,
                disabled=False),
            "user_disabled_coach": User(
                email="user_disabled_coach@test.be",
                name="user_disabled_coach",
                password="Test123!user_disabled_coach",
                role=UserRole.COACH,
                active=True,
                approved=True,
                disabled=True),
            "user_no_role": User(
                email="user_no_role@test.be",
                name="user_no_role",
                password="Test123!user_no_role",
                role=UserRole.NO_ROLE,
                active=False,
                approved=False,
                disabled=False)
        }

        self.objects = {
            "projectleider": Skill(name="projectleider"),
            "Systeembeheerder": Skill(name="Systeembeheerder"),
            "API-beheerder": Skill(name="API-beheerder"),
            "testverantwoordelijke": Skill(name="testverantwoordelijke"),
            "documentatie verantwoordelijke": Skill(name="documentatie verantwoordelijke"),
            "customer relations": Skill(name="customer relations"),
            "frontend": Skill(name="frontend"),
            "project_test": Project(
                name="project_test",
                description="A project aimed at being dummy data",
                goals=["Testing this application", "Being dummy data"],
                partner=Partner(name="Testing inc.", about="Testing inc. is focused on being dummy data."),
                required_skills=[],
                users=[],
                edition=2022
            ),
            **self.users
        }
        self.saved_objects = {
            "passwords": {},  # passwords will be saved as {"passwords": {"user_admin": "user_admin_password"}}
        }
        self.created = []

    async def asyncSetUp(self) -> None:
        asyncio.get_running_loop().set_debug(False)  # silent mode
        self.client = AsyncClient(app=app, base_url="http://test")
        self.lf = LifespanManager(app)
        await self.lf.__aenter__()
        for key, obj in self.objects.items():
            if isinstance(obj, User):
                plain_password = obj.password
                obj.password = get_password_hash(obj.password)
                self.saved_objects["passwords"][key] = plain_password

            # update the corresponding object list
            obj_list = self.saved_objects.get(str(type(obj))) or []
            obj_list.append(key)
            self.saved_objects[obj.__module__] = obj_list  # Key is the type of the obj (without extra)

            self.saved_objects[key] = await db.engine.save(obj)

    async def asyncTearDown(self) -> None:
        for model in [Answer, Edition, Participation, Project, Question,
                      QuestionAnswer, Skill, Student, Suggestion, User]:
            instances = await db.engine.find(model)
            for instance in instances:
                await db.engine.delete(instance)
        await self.lf.__aexit__()
        await self.client.aclose()

    async def get_access_token(self, user: str):
        email: str = self.saved_objects[user].email
        password: str = self.saved_objects["passwords"][user]
        login = await self.client.post("/login", json={"email": email, "password": password},
                                       headers={"Content-Type": "application/json"})
        return login.json()["data"]["accessToken"]

    async def get_response(self, path: str, user: str, expected_status: int = 200,
                           access_token: str = None, use_access_token: bool = True) -> Response:
        """GET request test template

        Tests whether a request with the given data matches the expected status and returns the response.

        Args:
        :param path: The path of the GET request
        :type path: str
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
        if use_access_token:
            if access_token is None:
                access_token = await self.get_access_token(user)
            response = await self.client.get(path, headers={"Authorization": "Bearer " + access_token})
        else:
            response = await self.client.get(path)

        self.assertTrue(response.status_code == expected_status,
                        f"""While doing GET to '{path}':
                        Unexpected status for {user},
                        status code was {response.status_code},
                        expected {expected_status}
                        """)
        return response

    async def post_response(self, path: str, json_body, user: str,
                            expected_status: int = 200, access_token: str = None,
                            use_access_token: bool = True) -> Response:
        """POST request test template

        Tests whether a request with the given data matches the expected status and returns the response.

        :param path: The path of the POST request
        :type path: str
        :param json_body: The POST body
        :type json_body: Depends on POST request, most of the time a dict
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
        if use_access_token:
            if access_token is None:
                access_token = await self.get_access_token(user)
            response = await self.client.post(path, json=json_body, headers={"Authorization": "Bearer " + access_token,
                                                                             "Content-Type": "application/json"})
        else:
            response = await self.client.post(path, json=json_body, headers={"Content-Type": "application/json"})

        self.assertTrue(response.status_code == expected_status,
                        f"""While doing POST of
                        {json_body}
                        to '{path}':
                        Unexpected status for {user},
                        status code was {response.status_code},
                        expected {expected_status}
                        """)
        return response

    async def _auth_test_get(self, path: str):
        await self.get_response(path, "user_admin", Status.UNAUTHORIZED, use_access_token=False)
        await self.get_response(path, "user_admin", Status.UNPROCESSABLE, access_token="wrong token")

    async def _auth_test_post(self, path: str, body: Dict):
        await self.post_response(path, body, "user_admin", Status.UNAUTHORIZED, use_access_token=False)
        await self.post_response(path, body, "user_admin", Status.UNPROCESSABLE, access_token="wrong token")

    async def _access_test_get(self, path, allowed_users: Set[str]):
        # Allowed users
        for user in allowed_users:
            await self.get_response(path, user, Status.SUCCES)
        # Disallowed users
        for user in set(self.users.keys()).difference(allowed_users):
            await self.get_response(path, user, Status.FORBIDDEN)

    async def _access_test_post(self, path, allowed_users: Set[str], body: Dict):
        # Allowed users
        for user in allowed_users:
            await self.post_response(path, body, user, Status.SUCCES)
        # Disallowed users
        for user in set(self.users.keys()).difference(allowed_users):
            await self.post_response(path, body, user, Status.FORBIDDEN)

    async def auth_access_get_test(self, path: str, allowed_users: Set[str]):
        await self._auth_test_get(path)
        await self._access_test_get(path, allowed_users)

    async def auth_access_post_test(self, path: str, allowed_users: Set[str], body: Dict):
        await self._auth_test_post(path, body)
        await self._access_test_post(path, allowed_users, body)
