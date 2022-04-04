import json

from app.crud import read_all_where
from app.models.skill import Skill
from app.tests.test_base import TestBase, Status


class TestSkills(TestBase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    async def test_get_skills(self):
        path = "/skills"
        allowed_users = {"user_admin"}

        # Test authorization & access-control
        await self.auth_access_get_test(path, allowed_users)

        skills = set()
        response = await self.get_response(path, "user_admin", Status.SUCCES)
        for skill in json.loads(response.content)["data"]:
            skills.add(skill["id"])

        expected_roles = {str(role.id) for role in await read_all_where(Skill)}

        self.assertEqual(expected_roles, skills)
