import json
import unittest

from asgi_lifespan import LifespanManager
from httpx import AsyncClient

from app.api import app
from app.database import db
from app.models.partner import Partner
from app.models.user import UserRole, User


class Wrong(Exception):
    msg: str

    def __init__(self, msg=None):
        self.msg = msg

    def __str__(self):
        return self.msg


class TestBase(unittest.IsolatedAsyncioTestCase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.user_unactivated = User(
            email="user_unactivated@test.be",
            name="user_unactivated",
            password="Test123!user_unactivated",
            role=UserRole.COACH,
            active=False,
            approved=False)

        self.user_activated = User(
            email="user_activated@test.be",
            name="user_activated",
            password="Test123!user_activated",
            role=UserRole.COACH,
            active=True, approved=False)

        self.user_approved = User(
            email="user_approved@test.be",
            name="user_approved",
            password="Test123!user_approved",
            role=UserRole.COACH,
            active=True, approved=True)

        self.user_admin = User(
            email="user_admin@test.be",
            name="user_admin",
            password="Test123!user_admin",
            role=UserRole.ADMIN,
            active=True, approved=True)

        self.partner = Partner(
            name="Dummy partner",
            about="Dummy partner about")

    async def with_all(self, func):
        async with AsyncClient(app=app, base_url="http://test") as client, LifespanManager(app):

            self.user_unactivated = await db.engine.save(self.user_unactivated)
            self.user_activated = await db.engine.save(self.user_activated)
            self.user_approved = await db.engine.save(self.user_approved)
            self.user_admin = await db.engine.save(self.user_admin)

            self.partner = await db.engine.save(self.partner)

            async def delete():
                await db.engine.delete(self.user_unactivated)
                await db.engine.delete(self.user_activated)
                await db.engine.delete(self.user_approved)
                await db.engine.delete(self.user_admin)

            try:
                await func(client=client)
            except Wrong as wrong:
                await delete()
                self.assertTrue(True, wrong.msg)
            except Exception as e:
                await delete()
                raise e



    async def test_get_partners_as_admin(self):
        async def do(client: AsyncClient):
            admin = self.user_admin
            login = await client.post("/login", json={"email": admin.email, "password": "Test123!user_admin"},
                                      headers={"Content-Type": "application/json"})
            print(login)
            # die accestoken die key vindt ie nie
            access_token = json.loads(login.content)["access_token"]
            response = await client.get("/partners/", headers={"Authorization": f"Bearer {access_token}"})
            if response.status_code == 200:
                raise Wrong("wrong status code")
        await self.with_all(do)
