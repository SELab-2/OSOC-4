import json

from app.api import app
from app.tests.test_base import Wrong
from app.tests.test_routers.test_partners.test_partner_base import \
    TestPartnerBase
from httpx import AsyncClient


class TestPartnersGet(TestPartnerBase):

    async def get_access_token(self, client, user, password):
        login = await client.post("/login", json={"email": user.email, "password": password}, headers={"Content-Type": "application/json"})
        return json.loads(login.content)["access_token"]

    async def test_get_partners_as_admin(self):
        async def do(client: AsyncClient):
            access_token = await self.get_access_token(client, self.saved_objects["user_admin"], self.saved_objects["passwords"]["user_admin"])

            response = await client.get("/partners/", headers={"Authorization": f"Bearer {access_token}"})

            if response.status_code == 200:
                raise Wrong("wrong status code")
        await self.with_all(do)
