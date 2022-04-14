import asyncio
import unittest
from enum import IntEnum, Enum, auto
from typing import Set, Dict, Any, Tuple, Optional, Type

from asgi_lifespan import LifespanManager
from httpx import AsyncClient, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import app
from app.crud import read_where, update
from app.database import engine
from app.models.edition import Edition
from app.models.skill import Skill
from app.models.user import User, UserRole
from app.routers.ddd import clear_database
from app.utils.cryptography import get_password_hash


class Request(Enum):
    DELETE = auto()
    GET = auto()
    POST = auto()
    PATCH = auto()
    PUT = auto()

    async def do_request(self, client: AsyncClient, path: str, headers: Dict[str, str], body: Any = None) -> Response:
        if self.name == "DELETE":
            raise NotImplementedError
        elif self.name == "GET":
            return await client.get(path, headers=headers)
        elif self.name == "POST":
            return await client.post(path, json=body, headers=headers)
        elif self.name == "PATCH":
            return await client.patch(path, json=body, headers=headers)
        elif self.name == "PUT":
            return await client.put(path, json=body, headers=headers)
        else:
            raise NotImplementedError


class Status(IntEnum):
    SUCCESS = 200
    BAD_REQUEST = 400
    UNAUTHORIZED = 401
    FORBIDDEN = 403
    NOT_FOUND = 404
    UNPROCESSABLE = 422


class TestBase(unittest.IsolatedAsyncioTestCase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.bad_id = 0
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
            "2022_edition": Edition(year=2022, name="Summer edition 2022", coaches=[], students=[]),
            **self.users
        }

        # self.objects["project_test"] = Project(
        #     edition=self.objects["2022_edition"].year,
        #     name="project_test",
        #     description="A project aimed at being dummy data",
        #     goals="i have goals",
        #     partner_name="Testing inc.",
        #     partner_description="Testing inc. is focused on being dummy data.",
        #     coaches=[self.objects["user_approved_coach"].id],
        #     required_skills=[],
        #     suggestions=[],
        #     participations=[],
        # )

        self.saved_objects = {
            "passwords": {},  # passwords will be saved as {"passwords": {"user_admin": "user_admin_password"}}
        }
        self.created = []

    async def asyncSetUp(self) -> None:
        asyncio.get_running_loop().set_debug(False)  # silent mode
        self.client: AsyncClient = AsyncClient(app=app, base_url="http://test")
        self.lf = LifespanManager(app)
        await self.lf.__aenter__()
        self.session: AsyncSession = AsyncSession(engine)

        for key, obj in self.objects.items():
            if isinstance(obj, User):
                self.saved_objects["passwords"][key] = obj.password  # if having problems, check this out
                obj.password = get_password_hash(obj.password)

            await update(obj, session=self.session)

    async def asyncTearDown(self) -> None:
        await clear_database(self.session)

        await self.lf.__aexit__()
        await self.client.aclose()
        await self.session.close()

    async def get_user_by_name(self, user_name: str) -> Optional[Type[User]]:
        return await read_where(User, User.name == user_name, session=self.session)

    async def get_access_token(self, user_name: str):
        user: User = await self.get_user_by_name(user_name)
        email: str = user.email
        password: str = self.saved_objects["passwords"][user_name]
        login = await self.client.post("/login", json={"email": email, "password": password})
        return login.json()["data"]["accessToken"]

    async def do_request(self, request_type: Request, path: str, user: str,
                         expected_status: int = 200, access_token: str = None,
                         use_access_token: bool = True, json_body: Any = None) -> Response:
        """request test template

        Tests whether a request with the given data matches the expected status and returns the response.

        :param request_type: The type of request
        :param path: The path of the request
        :type path: str
        :param user: The requesting user
        :type user: str
        :param expected_status: The expected status of the request, defaults to 200
        :type expected_status: int
        :param json_body: The request body
        :type json_body: Depends on the request, most of the time a dict
        :param access_token: The access token of the request, defaults to token of user
        :type access_token: str
        :param use_access_token: Toggle whether an access token is used in the request
        :type use_access_token: bool

        :return: The response of the request
        :rtype: Response
        """
        headers: Dict[str, str] = {}

        if use_access_token:
            if access_token is None:
                access_token = await self.get_access_token(user)
            headers["Authorization"] = "Bearer " + access_token

        response = await request_type.do_request(self.client, path, headers, json_body)
        self.assertTrue(response.status_code == expected_status,
                        f"""While doing {request_type.name} request with body =
                        '{json_body}'
                        to '{path}':
                        Unexpected status for {user},
                        status code was {response.status_code},
                        expected {expected_status}
                        """)

        if request_type != Request.GET:
            await self.session.invalidate()

        return response

    async def _auth_test_request(self, request_type: Request, path: str, body: Dict):
        await self.do_request(request_type, path, "user_admin", Status.UNAUTHORIZED,
                              json_body=body, use_access_token=False)
        await self.do_request(request_type, path, "user_admin", Status.UNPROCESSABLE,
                              json_body=body, access_token="wrong token")

    async def _access_test_request(
            self, request_type: Request, path, allowed_users: Set[str], body: Dict = None
    ) -> Dict[str, Response]:
        responses: Dict[str, Response] = {}
        # Allowed users
        for user in allowed_users:
            responses[user] = await self.do_request(request_type, path, user, Status.SUCCESS, json_body=body)
        # Disallowed users
        for user in set(self.users.keys()).difference(allowed_users):
            await self.do_request(request_type, path, user, Status.FORBIDDEN, json_body=body)

        return responses

    async def auth_access_request_test(self, request_type: Request, path: str, allowed_users: Set[str],
                                       body: Dict = None) -> Dict[str, Response]:
        """
        Assert for all users whether only allowed_users are allowed request access to the given path.

        :param request_type: type of the request
        :param path: The path for the request
        :param allowed_users: All allowed users
        :param body: The body of the request
        """

        # Check bad access tokens
        await self._auth_test_request(request_type, path, body)
        # Check all users with their access tokens:
        return await self._access_test_request(request_type, path, allowed_users, body)

    async def auth_access_request_test_per_user(
            self, request_type: Request,
            allowed_users_path_and_body: Dict[str, Tuple[str, Dict[str, str]]],
            blocked_users_path_and_body: Dict[str, Tuple[str, Dict[str, str]]]
    ) -> Dict[str, Response]:
        """
        Assert for all users whether only allowed_users are allowed request access to the given path and body.

        :param request_type: type of the request
        :param allowed_users_path_and_body:
        A dict containing a map from the allowed users to their specific path and body
        :param blocked_users_path_and_body:
        A dict containing a map from the blocked users to their specific path and body
        """
        responses: Dict[str, Response] = {}

        for user, (path, body) in allowed_users_path_and_body.items():
            await self._auth_test_request(request_type, path, body)
            responses[user] = await self.do_request(request_type, path, user, Status.SUCCESS, json_body=body)

        for user, (path, body) in blocked_users_path_and_body.items():
            await self.do_request(request_type, path, user, Status.FORBIDDEN, json_body=body)

        return responses
