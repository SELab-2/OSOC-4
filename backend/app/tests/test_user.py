import pytest
from app.api import app
from asgi_lifespan import LifespanManager
from httpx import AsyncClient


@pytest.fixture()
async def client():
    async with AsyncClient(app=app, base_url="http://test") as client, LifespanManager(app):
        yield client


@pytest.mark.asyncio
async def test_read_main(client):
    response = await client.get("/users/")
    assert response.status_code == 403
