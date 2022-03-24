import json

from app.crud import read_all_where
from app.models.skill import Skill
from app.tests.test_base import TestBase, Status


class TestRoles(TestBase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    """
    GET /roles
    """

    async def test_get_roles(self):
        # Should use access token but is not yet implemented
        response = await self.get_response("/roles", "", Status.SUCCES, use_access_token=False)
        roles = set()

        for role in json.loads(response.content)["data"]:
            roles.add(role["id"])

        expected_roles = {str(role.id) for role in await read_all_where(Skill)}

        self.assertEqual(expected_roles, roles)
