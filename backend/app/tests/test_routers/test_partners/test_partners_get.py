import json
import unittest

from app.exceptions.permissions import NotPermittedException
from app.tests.test_base import Wrong
from app.tests.test_routers.test_partners.test_partner_base import \
    TestPartnerBase
from httpx import AsyncClient


@unittest.skip("deprecated")
class TestPartnersGet(TestPartnerBase):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    async def get_access_token(self, client, user, password):
        login = await client.post("/login", json={"email": user.email, "password": password}, headers={"Content-Type": "application/json"})
        return json.loads(login.content)["access_token"]

    @unittest.skip("deprecated")
    async def test_get_partners_as_admin(self):
        async def do(client: AsyncClient):
            access_token = await self.get_access_token(client, self.saved_objects["user_admin"], self.saved_objects["passwords"]["user_admin"])
            response = await client.get("/partners/", headers={"Authorization": f"Bearer {access_token}"})
            if response.status_code != 200:
                raise Wrong("wrong status code")
        await self.with_all(do)

    @unittest.skip("deprecated")
    async def test_get_partners_as_coach(self):
        async def do(client: AsyncClient):
            access_token = await self.get_access_token(client, self.saved_objects["user_coach"], self.saved_objects["passwords"]["user_coach"])
            response = await client.get("/partners/", headers={"Authorization": f"Bearer {access_token}"})
            if not NotPermittedException().checkResponse(response):
                raise Wrong("wrong status code")
        await self.with_all(do)

    @unittest.skip("deprecated")
    async def test_get_partners_as_no_role(self):
        async def do(client: AsyncClient):
            access_token = await self.get_access_token(client, self.saved_objects["user_no_role"], self.saved_objects["passwords"]["user_no_role"])
            response = await client.get("/partners/", headers={"Authorization": f"Bearer {access_token}"})
            if not NotPermittedException().checkResponse(response):
                raise Wrong("wrong status code")
        await self.with_all(do)

    @unittest.skip("deprecated")
    async def test_get_partners_no_authorization(self):
        async def do(client: AsyncClient):
            response = await client.get("/partners/")
            if response.status_code != 401:
                raise Wrong("wrong status code")
        await self.with_all(do)

    @unittest.skip("deprecated")
    async def test_get_partners_wrong_authorization(self):
        async def do(client: AsyncClient):
            response = await client.get("/partners/", headers={"Authorization": "Bearer abc"})
            if response.status_code != 422:
                raise Wrong("wrong status code")
        await self.with_all(do)

    @unittest.skip("deprecated")
    async def test_get_partner_as_admin(self):
        async def do(client: AsyncClient):
            access_token = await self.get_access_token(client, self.saved_objects["user_admin"], self.saved_objects["passwords"]["user_admin"])
            response = await client.get(f"/partners/{str(self.saved_objects['partner'].id)}", headers={"Authorization": f"Bearer {access_token}"})
            if response.status_code != 200:
                raise Wrong("wrong status code")
        await self.with_all(do)
