import asyncio
import unittest

from app.api import app

from fastapi.testclient import TestClient


class TestUsers(unittest.IsolatedAsyncioTestCase):
    test_client = TestClient(app)

    async def test_get_users(self):
        response = await self.test_client.get("/users/")
        assert response.status_code == 200
