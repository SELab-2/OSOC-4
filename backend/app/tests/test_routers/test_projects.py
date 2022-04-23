import json
from typing import Dict, Set
import uuid
from httpx import Response
from app.crud import read_where, update, update_all
from app.models.project import Project
from app.tests.test_base import Status, TestBase, Request
from app.models.user import User, UserRole
from app.tests.utils_for_tests.EditionGenerator import EditionGenerator
from app.config import config


class TestProjects(TestBase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    async def test_post_add_project_data(self):

        edition_generator = EditionGenerator(self.session)
        edition = edition_generator.generate_edition(2022)
        await update(edition, self.session)

        path = "/projects/create"
        allowed_users: Set[str] = await self.get_users_by([UserRole.ADMIN])
        projectName = str(uuid.uuid1())
        body = {
            "name": projectName,
            "description": "an added project",
            "goals": "doing a test",
            "partner_name": "Testing inc.",
            "partner_description": "Testing inc. is focused on being dummy data.",
            "edition": edition.year,
        }

        # Post create project request
        responses1: Dict[str, Response] = await self.auth_access_request_test(Request.POST, path, allowed_users, body)

        # Get project id from the response url
        projectId = ""
        for user_title in allowed_users:
            projectId = json.loads(responses1.get(user_title).content)["data"]["id"].split("/")[-1]

        # Test whether created project is in the database
        projectInDb = await read_where(Project, Project.name == projectName, session=self.session)
        self.assertIsNotNone(projectInDb, f"'{projectName}' was not found in the database.")

        # Project id in the database should be same as it in the response url
        self.assertEqual(str(projectInDb.id), projectId, f"Project id of '{projectName}' in the response url is not same as it in the database.")

        # compare every field in the database with the test value
        db_project_dict = projectInDb.dict()
        for key, value in body.items():
            self.assertEqual(db_project_dict[key], value,
                             (f"{key} of project '{projectName}' did not match.\n"
                              f"Expected: {value}\n"
                              f"Got: {db_project_dict[key]}"))

    async def test_get_projects_id_with_admin_user(self):
        url = f"{config.api_url}projects/"
        edition_generator = EditionGenerator(self.session)
        edition = edition_generator.generate_edition(2022)
        project = Project(
            name="Student Volunteer Project",
            goals="Free\nReal\nEstate",
            description="Free real estate",
            partner_name="UGent",
            partner_description="De C in UGent staat voor communicatie",
            coaches=[],
            edition=edition.year)
        await update_all([edition, project], self.session)

        path = "/projects/" + str(project.id)
        allowed_users: Set[str] = await self.get_users_by([UserRole.ADMIN])

        # Test authorization & access-control
        responses: Dict[str, Response] = await self.auth_access_request_test(Request.GET, path, allowed_users, unauthorized_status=Status.BAD_REQUEST)

        # Test responses
        for user_title, response in responses.items():
            gotten_project = json.loads(response.content)
            self.assertEqual(f"{url}{project.id}", gotten_project["id"],
                             f"The project gotten by {user_title} did not match the expected project.")

    async def test_get_projects_id_with_coach_user(self):
        url = f"{config.api_url}projects/"
        coach = await read_where(User, User.role == UserRole.COACH, session=self.session)

        edition_generator = EditionGenerator(self.session)
        edition = edition_generator.generate_edition(2022)
        project = Project(
            name="Student Volunteer Project",
            goals="Free\nReal\nEstate",
            description="Free real estate",
            partner_name="UGent",
            partner_description="De C in UGent staat voor communicatie",
            coaches=[coach],
            edition=edition.year)
        await update_all([edition, project], self.session)

        path = "/projects/" + str(project.id)
        allowed_users: Set[str] = await self.get_users_by([UserRole.ADMIN])
        allowed_users.add(coach.name)

        # Test authorization & access-control
        responses: Dict[str, Response] = await self.auth_access_request_test(Request.GET, path, allowed_users, unauthorized_status=Status.BAD_REQUEST)

        # Test responses
        for user_title, response in responses.items():
            gotten_project = json.loads(response.content)
            self.assertEqual(f"{url}{project.id}", gotten_project["id"],
                             f"The project gotten by {user_title} did not match the expected project.")
