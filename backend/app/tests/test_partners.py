import json
import unittest

from app.api import app
from app.crud import read_by_key_value
from app.database import db
from app.exceptions.partner_exceptions import NameAlreadyUsedException
from app.exceptions.permissions import NotPermittedException
from app.models.partner import Partner
from app.models.user import User, UserRole
from app.utils.cryptography import get_password_hash
from asgi_lifespan import LifespanManager
from httpx import AsyncClient
from odmantic import ObjectId


class TestPartners(unittest.IsolatedAsyncioTestCase):

    async def create_user_with_role(self, role: UserRole):
        self.userpassword = "Testpassword123!"
        user = User(name="user", email="admin@test.be", password=get_password_hash(self.userpassword), role=role, active=True, approved=True)
        self.user = await db.engine.save(user)

    async def delete_user(self):
        await db.engine.delete(self.user)

    async def get_access_token(self, client):
        login = await client.post("/login", json={"email": self.user.email, "password": self.userpassword}, headers={"Content-Type": "application/json"})
        return json.loads(login.content)["access_token"]

    async def test_get_partners_as_admin(self):
        async with AsyncClient(app=app, base_url="http://test") as client, LifespanManager(app):

            await self.create_user_with_role(UserRole.ADMIN)
            access_token = await self.get_access_token(client)
            response = await client.get("/partners/", headers={"Authorization": f"Bearer {access_token}"})
            await self.delete_user()
            assert response.status_code == 200

    async def test_get_partners_as_coach(self):
        async with AsyncClient(app=app, base_url="http://test") as client, LifespanManager(app):

            await self.create_user_with_role(UserRole.COACH)
            access_token = await self.get_access_token(client)
            response = await client.get("/partners/", headers={"Authorization": f"Bearer {access_token}"})
            await self.delete_user()

            # must throw NotPermittedException
            assert NotPermittedException().checkResponse(response)

    async def test_get_partners_as_no_role(self):
        async with AsyncClient(app=app, base_url="http://test") as client, LifespanManager(app):

            await self.create_user_with_role(UserRole.NO_ROLE)
            access_token = await self.get_access_token(client)
            response = await client.get("/partners/", headers={"Authorization": f"Bearer {access_token}"})
            await self.delete_user()

            # must throw NotPermittedException
            assert NotPermittedException().checkResponse(response)

    async def test_get_partners_no_authorization(self):
        async with AsyncClient(app=app, base_url="http://test") as client, LifespanManager(app):

            response = await client.get("/partners/")
            assert response.status_code == 401

    async def test_get_partners_wrong_authorization(self):
        async with AsyncClient(app=app, base_url="http://test") as client, LifespanManager(app):
            response = await client.get("/partners/", headers={"Authorization": "Bearer abc"})
            assert response.status_code == 422

    async def test_create_partner_as_admin(self):
        async with AsyncClient(app=app, base_url="http://test") as client, LifespanManager(app):

            await self.create_user_with_role(UserRole.ADMIN)
            access_token = await self.get_access_token(client)
            response = await client.post("/partners/create", headers={"Authorization": f"Bearer {access_token}"}, json={"name": "test", "about": "test"})

            # delete the partner if it was created successfully
            if response.status_code == 200:
                id = json.loads(response.content)["data"]["id"]
                partner = await read_by_key_value(Partner, Partner.id, ObjectId(id))
                await db.engine.delete(partner)

            await self.delete_user()
            assert response.status_code == 200

    async def test_create_partner_as_coach(self):
        async with AsyncClient(app=app, base_url="http://test") as client, LifespanManager(app):

            await self.create_user_with_role(UserRole.COACH)
            access_token = await self.get_access_token(client)
            response = await client.post("/partners/create", headers={"Authorization": f"Bearer {access_token}"}, json={"name": "test", "about": "test"})

            # delete the partner if it was created successfully
            if response.status_code == 200:
                id = json.loads(response.content)["data"]["id"]
                partner = await read_by_key_value(Partner, Partner.id, ObjectId(id))
                await db.engine.delete(partner)
            await self.delete_user()

            # must throw NotPermittedException
            assert NotPermittedException().checkResponse(response)

    async def test_create_partner_as_no_role(self):
        async with AsyncClient(app=app, base_url="http://test") as client, LifespanManager(app):

            await self.create_user_with_role(UserRole.NO_ROLE)
            access_token = await self.get_access_token(client)
            response = await client.post("/partners/create", headers={"Authorization": f"Bearer {access_token}"}, json={"name": "test", "about": "test"})

            # delete the partner if it was created successfully
            if response.status_code == 200:
                id = json.loads(response.content)["data"]["id"]
                partner = await read_by_key_value(Partner, Partner.id, ObjectId(id))
                await db.engine.delete(partner)
            await self.delete_user()

            # must throw NotPermittedException
            assert NotPermittedException().checkResponse(response)

    async def test_create_partner_no_authorization(self):
        async with AsyncClient(app=app, base_url="http://test") as client, LifespanManager(app):

            response = await client.post("/partners/create")
            assert response.status_code == 401

    async def test_create_partner_wrong_authorization(self):
        async with AsyncClient(app=app, base_url="http://test") as client, LifespanManager(app):
            response = await client.post("/partners/create", headers={"Authorization": "Bearer abc"})
            assert response.status_code == 422

    async def test_create_partners_same_name(self):
        async with AsyncClient(app=app, base_url="http://test") as client, LifespanManager(app):

            await self.create_user_with_role(UserRole.ADMIN)
            access_token = await self.get_access_token(client)
            response_create_partner = await client.post("/partners/create", headers={"Authorization": f"Bearer {access_token}"}, json={"name": "test", "about": "test"})

            response = None

            if response_create_partner.status_code == 200:
                id = json.loads(response_create_partner.content)["data"]["id"]
                partner = await read_by_key_value(Partner, Partner.id, ObjectId(id))

                response = await client.post("/partners/create", headers={"Authorization": f"Bearer {access_token}"}, json={"name": "test", "about": "test"})

                await db.engine.delete(partner)

            await self.delete_user()

            assert response
            assert NameAlreadyUsedException().checkResponse(response)

    async def test_update_partner_as_admin(self):
        async with AsyncClient(app=app, base_url="http://test") as client, LifespanManager(app):

            await self.create_user_with_role(UserRole.ADMIN)
            access_token = await self.get_access_token(client)
            created_partner_response = await client.post("/partners/create", headers={"Authorization": f"Bearer {access_token}"}, json={"name": "test", "about": "test"})

            response = None

            # delete the partner if it was created successfully
            if created_partner_response.status_code == 200:
                id = json.loads(created_partner_response.content)["data"]["id"]

                response = await client.post(f"/partners/{id}", headers={"Authorization": f"Bearer {access_token}"}, json={"name": "test", "about": "test2"})

                partner = await read_by_key_value(Partner, Partner.id, ObjectId(id))
                await db.engine.delete(partner)

            await self.delete_user()

            assert response
            assert response.status_code == 200

    async def test_get_partner_as_admin(self):
        async with AsyncClient(app=app, base_url="http://test") as client, LifespanManager(app):

            await self.create_user_with_role(UserRole.ADMIN)
            access_token = await self.get_access_token(client)
            created_partner_response = await client.post("/partners/create", headers={"Authorization": f"Bearer {access_token}"}, json={"name": "test", "about": "test"})

            response = None

            # delete the partner if it was created successfully
            if created_partner_response.status_code == 200:
                id = json.loads(created_partner_response.content)["data"]["id"]

                response = await client.get(f"/partners/{id}", headers={"Authorization": f"Bearer {access_token}"})

                partner = await read_by_key_value(Partner, Partner.id, ObjectId(id))
                await db.engine.delete(partner)

            await self.delete_user()

            assert response
            assert response.status_code == 200

    async def test_get_partner_as_coach(self):
        async with AsyncClient(app=app, base_url="http://test") as client, LifespanManager(app):

            await self.create_user_with_role(UserRole.ADMIN)
            access_token = await self.get_access_token(client)
            created_partner_response = await client.post("/partners/create", headers={"Authorization": f"Bearer {access_token}"}, json={"name": "test", "about": "test"})

            await self.delete_user()

            response = None

            # delete the partner if it was created successfully
            if created_partner_response.status_code == 200:
                id = json.loads(created_partner_response.content)["data"]["id"]

                await self.create_user_with_role(UserRole.COACH)
                access_token = await self.get_access_token(client)

                response = await client.get(f"/partners/{id}", headers={"Authorization": f"Bearer {access_token}"})

                partner = await read_by_key_value(Partner, Partner.id, ObjectId(id))
                await db.engine.delete(partner)

            await self.delete_user()

            assert response
            assert response.status_code == 200

    async def test_get_partner_as_no_role(self):
        async with AsyncClient(app=app, base_url="http://test") as client, LifespanManager(app):

            await self.create_user_with_role(UserRole.ADMIN)
            access_token = await self.get_access_token(client)
            created_partner_response = await client.post("/partners/create", headers={"Authorization": f"Bearer {access_token}"}, json={"name": "test", "about": "test"})

            await self.delete_user()

            response = None

            # delete the partner if it was created successfully
            if created_partner_response.status_code == 200:
                id = json.loads(created_partner_response.content)["data"]["id"]

                await self.create_user_with_role(UserRole.NO_ROLE)
                access_token = await self.get_access_token(client)

                response = await client.get(f"/partners/{id}", headers={"Authorization": f"Bearer {access_token}"})

                partner = await read_by_key_value(Partner, Partner.id, ObjectId(id))
                await db.engine.delete(partner)

            await self.delete_user()

            assert response
            assert NotPermittedException().checkResponse(response)
