import json
import unittest
from typing import Dict

from httpx import Response

from app.crud import read_all_where
from app.models.skill import Skill
from app.tests.test_base import TestBase, Request


class TestSkills(TestBase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    @unittest.skip("Router no longer included")
    async def test_get_skills(self):
        path = "/skills"
        allowed_users = {"user_admin"}

        # Test authorization & access-control
        responses: Dict[str, Response] = await self.auth_access_request_test(Request.GET, path, allowed_users)

        # Check responses
        expected_skills = {str(role.id) for role in await read_all_where(Skill)}

        for user_title, response in responses.items():
            skills = set()
            for skill in json.loads(response.content)["data"]:
                skills.add(skill["id"])

            self.assertEqual(expected_skills, skills,
                             f"The request from {user_title} did not match the expected skills.")
