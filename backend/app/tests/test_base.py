import asyncio
import unittest
from enum import IntEnum, Enum, auto
from typing import Set, Dict, Any, Tuple, Optional, Type, List

from asgi_lifespan import LifespanManager
from httpx import AsyncClient, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import app
from app.crud import read_where, clear_data, read_all_where
from app.database import engine
from app.models.user import User, UserRole
from app.tests.utils_for_tests.UserGenerator import UserGenerator
from sqlalchemy.orm import sessionmaker


class Request(Enum):
    DELETE = auto()
    GET = auto()
    POST = auto()
    PATCH = auto()
    PUT = auto()

    async def do_request(self, client: AsyncClient, path: str, headers: Dict[str, str], body: Any = None) -> Response:
        if self.name == "DELETE":
            return await client.delete(path, headers=headers)
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
        self.sessionmaker = sessionmaker(
            engine, expire_on_commit=False, class_=AsyncSession
        )

        self.bad_id = 0
        self.users: Dict[str, User] = {}
        self.saved_objects = {
            "passwords": {},  # passwords will be saved as {"passwords": {"user_admin": "user_admin_password"}}
        }

    async def asyncSetUp(self) -> None:
        asyncio.get_running_loop().set_debug(False)  # silent mode
        self.client: AsyncClient = AsyncClient(app=app, base_url="http://test")
        self.lf = LifespanManager(app)
        await self.lf.__aenter__()
        self.session: AsyncSession = self.sessionmaker()
        await clear_data(self.session)

        user_generator = UserGenerator(self.session)
        user_generator.generate_default_users()
        self.users = {user.name: user for user in user_generator.data}
        self.saved_objects["passwords"] = user_generator.passwords

        user_generator.add_to_db()
        await self.session.commit()

        self.user_coach = self.users["coach"]
        self.user_admin = self.users["user_admin"]

    async def asyncTearDown(self) -> None:
        await self.lf.__aexit__()
        await self.client.aclose()
        await self.session.close()

    async def get_users_by(self, roles: List[UserRole], active=True, approved=True, disabled=False) -> Set[str]:
        users = await read_all_where(User, session=self.session)
        return {user.name for user in users
                if user.role in roles
                and user.active == active
                and user.approved == approved
                and user.disabled == disabled}

    async def get_user_by_name(self, user_name: str) -> Optional[Type[User]]:
        return await read_where(User, User.name == user_name, session=self.session)

    async def get_access_token(self, user_name: str):
        user: User = await self.get_user_by_name(user_name)
        email: str = user.email
        password: str = self.saved_objects["passwords"][user_name]
        login = await self.client.post("/login", json={"email": email, "password": password})
        return login.json()["data"]["accessToken"]

    async def do_request(self, request_type: Request, path: str, user: str = "",
                         expected_status: int = 200, access_token: str = None,
                         json_body: Any = None) -> Response:
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

        :return: The response of the request
        :rtype: Response
        """
        headers: Dict[str, str] = {}

        if user != "":
            if access_token is None:
                access_token = await self.get_access_token(user)
            headers["Authorization"] = "Bearer " + access_token

        response = await request_type.do_request(self.client, path, headers, json_body)
        self.assertTrue(response.status_code == expected_status,
                        f"""While doing {request_type.name} request with body =
                        '{json_body}'
                        to '{path}':
                        Unexpected status for '{user}',
                        status code was {response.status_code},
                        expected {expected_status}
                        """)

        if request_type != Request.GET:
            await self.session.invalidate()

        return response

    async def _auth_test_request(self, request_type: Request, path: str, body: Dict):
        await self.do_request(request_type, path, expected_status=Status.UNAUTHORIZED, json_body=body)
        await self.do_request(request_type, path, "user_admin", expected_status=Status.UNPROCESSABLE,
                              json_body=body, access_token="wrong token")

    async def _access_test_request(
            self, request_type: Request, path, allowed_users: Set[str], body: Dict = None
    ) -> Dict[str, Response]:
        responses: Dict[str, Response] = {}
        # Allowed users
        for user_name in allowed_users:
            responses[user_name] = await self.do_request(request_type, path, user_name, Status.SUCCESS, json_body=body)
        # Disallowed users
        for user_name in set(self.users.keys()).difference(allowed_users):
            user = await self.get_user_by_name(user_name)
            if user.active and user.approved and not user.disabled:
                await self.do_request(request_type, path, user_name, Status.FORBIDDEN, json_body=body)

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

        for user_name, (path, body) in allowed_users_path_and_body.items():
            await self._auth_test_request(request_type, path, body)
            responses[user_name] = await self.do_request(request_type, path, user_name, Status.SUCCESS, json_body=body)

        for user_name, (path, body) in blocked_users_path_and_body.items():
            user = await self.get_user_by_name(user_name)
            if user.active and user.approved and not user.disabled:
                await self.do_request(request_type, path, user_name, Status.FORBIDDEN, json_body=body)

        return responses
