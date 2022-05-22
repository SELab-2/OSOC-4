import asyncio
import unittest

from asgi_lifespan import LifespanManager
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker

from app.api import app
from app.database import engine


class Testddd(unittest.IsolatedAsyncioTestCase):
    """
    This TestCase was made in order to test that ddd does actually work.
    While not necessary for production, ddd is usefull while development and has broken multiple times.
    Thus, this TestCase was made.
    """

    def __init__(self, *args, **kwargs):
        """
        Initializes the TestCase

        :param args:
        :param kwargs:
        """
        super().__init__(*args, **kwargs)
        self.sessionmaker = sessionmaker(
            engine, expire_on_commit=False, class_=AsyncSession
        )

    async def asyncSetUp(self) -> None:
        """
        Overrides the asyncSetUp of TestBase to start with an empty db

        :return: None
        """
        asyncio.get_running_loop().set_debug(False)  # silent mode
        self.client: AsyncClient = AsyncClient(app=app, base_url="http://test")
        self.lf = LifespanManager(app)
        await self.lf.__aenter__()
        self.session: AsyncSession = self.sessionmaker()

    async def asyncTearDown(self) -> None:
        """
        Resets the test environment to undo any changes done.

        :return: None
        """
        await self.lf.__aexit__()
        await self.client.aclose()
        await self.session.close()

    async def test_ddd(self):
        await self.client.get("/ddd/")
        await self.client.get("/ddd/")
        await self.client.delete("/ddd/")
