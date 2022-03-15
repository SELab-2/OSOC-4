import json
import unittest

from app.crud import read_where
from app.exceptions.partner_exceptions import NameAlreadyUsedException
from app.exceptions.permissions import NotPermittedException
from app.models.partner import Partner
from app.tests.test_base import Wrong
from app.tests.test_routers.test_partners.test_partner_base import \
    TestPartnerBase
from httpx import AsyncClient
from odmantic import ObjectId


@unittest.skip("deprecated")
class TestPartnersCreate(TestPartnerBase):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    async def get_access_token(self, client, user, password):
        login = await client.post("/login", json={"email": user.email, "password": password}, headers={"Content-Type": "application/json"})
        return json.loads(login.content)["access_token"]

    @unittest.skip("deprecated")
    async def testcreatet_partners_as_admin(self):
        async def do(client: AsyncClient):
            access_token = await self.get_access_token(client, self.saved_objects["user_admin"], self.saved_objects["passwords"]["user_admin"])
            response = await client.post("/partners/create", headers={"Authorization": f"Bearer {access_token}"}, json={"name": "test", "about": "test"})
            if response.status_code == 200:
                id = json.loads(response.content)["data"]["id"]
                partner = await read_where(Partner, Partner.id == ObjectId(id))
                self.saved_objects["new_partner"] = partner

            if response.status_code != 200:
                raise Wrong("wrong status code")
        await self.with_all(do)

    @unittest.skip("deprecated")
    async def test_create_partners_as_coach(self):
        async def do(client: AsyncClient):
            access_token = await self.get_access_token(client, self.saved_objects["user_coach"], self.saved_objects["passwords"]["user_coach"])
            response = await client.post("/partners/create", headers={"Authorization": f"Bearer {access_token}"}, json={"name": "test", "about": "test"})
            if response.status_code == 200:
                id = json.loads(response.content)["data"]["id"]
                partner = await read_where(Partner, Partner.id == ObjectId(id))
                self.saved_objects["new_partner"] = partner

            if not NotPermittedException().checkResponse(response):
                raise Wrong("wrong status code")
        await self.with_all(do)

    @unittest.skip("deprecated")
    async def test_create_partners_as_no_role(self):
        async def do(client: AsyncClient):
            access_token = await self.get_access_token(client, self.saved_objects["user_no_role"], self.saved_objects["passwords"]["user_no_role"])
            response = await client.post("/partners/create", headers={"Authorization": f"Bearer {access_token}"}, json={"name": "test", "about": "test"})
            if response.status_code == 200:
                id = json.loads(response.content)["data"]["id"]
                partner = await read_where(Partner, Partner.id == ObjectId(id))
                self.saved_objects["new_partner"] = partner

            if not NotPermittedException().checkResponse(response):
                raise Wrong("wrong status code")
        await self.with_all(do)

    @unittest.skip("deprecated")
    async def test_create_partner_no_authorization(self):
        async def do(client: AsyncClient):
            response = await client.post("/partners/create", json={"name": "test", "about": "test"})
            if response.status_code != 401:
                raise Wrong("wrong status code")
        await self.with_all(do)

    @unittest.skip("deprecated")
    async def test_create_partner_wrong_authorization(self):
        async def do(client: AsyncClient):
            response = await client.post("/partners/create", headers={"Authorization": "Bearer abc"}, json={"name": "test", "about": "test"})
            if response.status_code != 422:
                raise Wrong("wrong status code")
        await self.with_all(do)

    @unittest.skip("deprecated")
    async def test_create_partners_same_name(self):
        async def do(client: AsyncClient):
            access_token = await self.get_access_token(client, self.saved_objects["user_admin"], self.saved_objects["passwords"]["user_admin"])
            response = await client.post("/partners/create", headers={"Authorization": f"Bearer {access_token}"}, json={"name": "Dummy partner", "about": "Dummy"})

            if response.status_code == 200:
                id = json.loads(response.content)["data"]["id"]
                partner = await read_where(Partner, Partner.id == ObjectId(id))
                self.saved_objects["new_partner"] = partner

            print(response.content)
            if not NameAlreadyUsedException().checkResponse(response):
                raise Wrong("wrong status code")
        await self.with_all(do)
