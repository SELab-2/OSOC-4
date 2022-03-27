import json

from bson import ObjectId

from app.crud import read_where
from app.models.project import Project
from app.tests.test_base import TestBase, Status


class TestProjects(TestBase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    """
    GET /projects
    """

    async def project_parser(self, url: str) -> Project:
        url = url.split("/")[-1]
        return await read_where(Project, Project.id == ObjectId(url))

    async def test_get_projects(self):
        # Should use access token but is not yet implemented
        response = await self.get_response("/projects", "user_admin", Status.SUCCES)
        projects = []

        for p in json.loads(response.content)["data"]:
            project_url = p["id"]
            project = await self.project_parser(project_url)
            projects.append(str(project.id))

        expected_projects = [str(project.id) for project in
                             map(lambda p: self.objects[p], self.saved_objects[Project.__module__])]

        self.assertEqual(expected_projects, projects)

    """
    GET /projects/{id}
    """

    async def test_get_project_with_id(self):
        # Should use access token but is not yet implemented
        project_id = self.objects["project_test"].id
        response = await self.get_response(f"/projects/{str(project_id)}", "user_admin", Status.SUCCES)

        gotten_project = json.loads(response.content)["data"]

        self.assertEqual(str(project_id), gotten_project["id"].split("/")[-1])
