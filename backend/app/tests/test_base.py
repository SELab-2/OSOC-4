import unittest

from app.api import app
from app.database import db
from app.models.user import User
from app.utils.cryptography import get_password_hash
from asgi_lifespan import LifespanManager
from httpx import AsyncClient


class Wrong(Exception):
    msg: str

    def __init__(self, msg=None):
        self.msg = msg

    def __str__(self):
        return self.msg


class TestBase(unittest.IsolatedAsyncioTestCase):
    def __init__(self, objects):
        super().__init__()

        self.objects = objects
        self.saved_objects = {}

    async def with_all(self, func):
        async with AsyncClient(app=app, base_url="http://test") as client, LifespanManager(app):

            for k, v in self.objects.items():
                if isinstance(v, User):
                    plain_password = v.password
                    v.password = get_password_hash(v.password)
                    if "passwords" not in self.saved_objects:
                        self.saved_objects["passwords"] = {}
                    self.saved_objects["passwords"][k] = plain_password
                self.saved_objects[k] = await db.engine.save(v)

            async def delete():
                for object in self.saved_objects.values():
                    await db.engine.delete(object)

            try:
                await func(client=client)
            except Wrong as wrong:
                await delete()
                self.assertTrue(True, wrong.msg)
            except Exception as e:
                await delete()
                raise e


"""
an example of how to use this class once you inhereted it
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
"""
