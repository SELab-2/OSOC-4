import json
import unittest
from typing import Dict

from bson import ObjectId
from httpx import Response

from app.crud import read_where
from app.database import db
from app.models.project import Project, Partner
from app.tests.test_base import TestBase, Request


class TestProjects(TestBase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    @staticmethod
    async def project_parser(url: str) -> Project:
        url = url.split("/")[-1]
        return await read_where(Project, Project.id == ObjectId(url))

    async def test_get_projects(self):
        path = "/projects"
        allowed_users = {"user_admin"}

        # Test authorization & access-control
        responses: Dict[str, Response] = await self.auth_access_request_test(Request.GET, path, allowed_users)

        # Check responses
        expected_projects = [str(project.id) for project in
                             map(lambda p: self.objects[p], self.saved_objects["Project"])]

        for user_title, response in responses.items():
            projects = []

            for p in json.loads(response.content)["data"]:
                project_url = p["id"]
                project = await self.project_parser(project_url)
                projects.append(str(project.id))

            self.assertEqual(expected_projects, projects,
                             f"The projects gotten by {user_title} did not match the expected projects.")

    @unittest.skip("Fault in test data")
    async def test_post_add_project_data(self):
        # This test needs to be reworked when multiple users are allowed,
        # otherwise the same user will be created multiple times thus not every user will create a new user

        path = "/projects/create"
        allowed_users = {"user_admin"}
        body = {
            "name": "added project",
            "description": "an added project",
            "goals": "doing a test",
            "partner": Partner(name="Testing inc.", about="Testing inc. is focused on being dummy data."),
            "required_skills": [],
            "users": [],
            "edition": 2022,
        }

        # Test authorization & access-control
        responses1: Dict[str, Response] = await self.auth_access_request_test(Request.POST, path, allowed_users, body)
        # Test again to create a duplicate project
        responses2: Dict[str, Response] = await self.auth_access_request_test(Request.POST, path, allowed_users, body)

        for user_title in allowed_users:
            self.assertEquals(json.loads(responses1.get(user_title).content)["data"],
                              json.loads(responses2.get(user_title).content)["data"],
                              "The returned project was different for it's creation and it's duplicate creation")

        # Test whether created project is in the database
        project = await db.engine.find_one(Project, Project.name == body["name"])
        self.assertIsNotNone(project, f"'{body['name']}' was not found in the database.")

    async def test_get_projects_id(self):
        project_id = str(self.objects["project_test"].id)
        path = "/projects/" + project_id
        allowed_users = {"user_admin", "user_approved_coach"}

        # Test authorization & access-control
        responses: Dict[str, Response] = await self.auth_access_request_test(Request.GET, path, allowed_users)

        for user_title, response in responses.items():
            gotten_project = json.loads(response.content)["data"]
            self.assertEqual(project_id, gotten_project["id"].split("/")[-1],
                             f"The project gotten by {user_title} did not match the expected project.")
