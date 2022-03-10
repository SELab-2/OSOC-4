import unittest

from asgi_lifespan import LifespanManager
from httpx import AsyncClient
from app.api import app


class TestUsers(unittest.IsolatedAsyncioTestCase):
    async def test_get_users_non_admin(self):
        async with AsyncClient(app=app, base_url="http://test") as client, LifespanManager(app):
            response = await client.get("/users/")
        assert response.status_code == 401
