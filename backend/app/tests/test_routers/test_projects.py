import json

from bson import ObjectId

from app.crud import read_where
from app.models.project import Project
from app.tests.test_base import TestBase, Status


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
        await self.auth_access_get_test(path, allowed_users)

        # Should use access token but is not yet implemented
        response = await self.get_response(path, "user_admin", Status.SUCCES)
        projects = []

        for p in json.loads(response.content)["data"]:
            project_url = p["id"]
            project = await self.project_parser(project_url)
            projects.append(str(project.id))

        expected_projects = [str(project.id) for project in
                             map(lambda p: self.objects[p], self.saved_objects[Project.__module__])]

        self.assertEqual(expected_projects, projects)

    async def test_get_projects_id(self):
        project_id = str(self.objects["project_test"].id)
        path = "/projects/" + project_id
        allowed_users = {"user_admin", "user_approved_coach"}

        # Test authorization & access-control
        await self.auth_access_get_test(path, allowed_users)

        response = await self.get_response(path, "user_admin", Status.SUCCES)

        gotten_project = json.loads(response.content)["data"]

        self.assertEqual(project_id, gotten_project["id"].split("/")[-1])
