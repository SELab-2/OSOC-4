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
    def __init__(self, objects, *args, **kwargs):
        super().__init__(*args, **kwargs)
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
                    if not isinstance(object, dict):
                        await db.engine.delete(object)

            try:
                await func(client=client)
            except Wrong as wrong:
                await delete()
                self.assertTrue(False, wrong.msg)

            except Exception as e:
                await delete()
                raise e
