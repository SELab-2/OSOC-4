import json
from multiprocessing import set_forkserver_preload
from typing import Dict, Set
from typing_extensions import Self
import uuid
from httpx import Response
from app.crud import read_all_where, read_where, update, update_all
from app.models.project import Project, ProjectCoach, ProjectRequiredSkill
from app.tests.test_base import Status, TestBase, Request
from app.models.user import User, UserRole
from app.tests.utils_for_tests.EditionGenerator import EditionGenerator
from app.config import config
from backend.app.tests.utils_for_tests.SkillGenerator import SkillGenerator


class TestProjects(TestBase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    async def test_post_add_project_data(self):

        edition_generator = EditionGenerator(self.session)
        edition = edition_generator.generate_edition(2022)
        await update(edition, self.session)

        path = "/projects/create"
        allowed_users: Set[str] = await self.get_users_by([UserRole.ADMIN])
        project_name = str(uuid.uuid1())
        body = {
            "name": project_name,
            "description": "an added project",
            "goals": "doing a test",
            "partner_name": "Testing inc.",
            "partner_description": "Testing inc. is focused on being dummy data.",
            "required_skills":[],
            "users":[],
            "edition": edition.year,
        }

        # Post create project request
        responses1: Dict[str, Response] = await self.auth_access_request_test(Request.POST, path, allowed_users, body)

        # Get project id from the response url
        project_id = ""
        for user_title in allowed_users:
            project_id = json.loads(responses1.get(user_title).content)["data"]["id"].split("/")[-1]

        # Test whether created project is in the database
        project_in_db = await read_where(Project, Project.name == project_name, session=self.session)
        self.assertIsNotNone(project_in_db, f"'{project_name}' was not found in the database.")

        # Project id in the database should be same as it in the response url
        self.assertEqual(str(project_in_db.id), project_id, f"Project id of '{project_name}' in the response url is not same as it in the database.")

        # compare every field in the database with the test value
        db_project_dict = project_in_db.dict()
        body.pop("required_skills")
        body.pop("users")
        for key, value in body.items():
            self.assertEqual(db_project_dict[key], value,
                             (f"{key} of project '{project_name}' did not match.\n"
                              f"Expected: {value}\n"
                              f"Got: {db_project_dict[key]}"))

    async def test_post_add_project_data_with_skills_and_users(self):

        edition_generator = EditionGenerator(self.session)
        edition = edition_generator.generate_edition(2022)
        await update(edition, self.session)
        # TODO: after skill_generator.add_to_db() is called, edition becomes none.
        edition_year = edition.year

        skill_generator = SkillGenerator(self.session)
        skills = skill_generator.generate_skills()
        await skill_generator.add_to_db()

        project_skills = [{"skill_name": skill.name, "number": 3} for skill in skills]

        project_coach = await read_where(User, User.role == UserRole.COACH, session=self.session)

        path = "/projects/create"
        allowed_users: Set[str] = await self.get_users_by([UserRole.ADMIN])
        project_name = str(uuid.uuid1())
        body = {
            "name": project_name,
            "description": "an added project",
            "goals": "doing a test",
            "partner_name": "Testing inc.",
            "partner_description": "Testing inc. is focused on being dummy data.",
            "required_skills":project_skills,
            "users":[project_coach.id],
            "edition": edition_year,
        }

        # Post create project request
        responses1: Dict[str, Response] = await self.auth_access_request_test(Request.POST, path, allowed_users, body)

        # Get project id from the response url
        project_id = ""
        for user_title in allowed_users:
            project_id = json.loads(responses1.get(user_title).content)["data"]["id"].split("/")[-1]

        # Test whether created project is in the database
        project_in_db = await read_where(Project, Project.name == project_name, session=self.session)
        self.assertIsNotNone(project_in_db, f"'{project_name}' was not found in the database.")

        # Project id in the database should be same as it in the response url
        self.assertEqual(str(project_in_db.id), project_id, f"Project id of '{project_name}' in the response url is not same as it in the database.")

        # compare every field in the database with the test value
        db_project_dict = project_in_db.dict()
        body.pop("required_skills")
        body.pop("users")
        for key, value in body.items():
            self.assertEqual(db_project_dict[key], value,
                             (f"{key} of project '{project_name}' did not match.\n"
                              f"Expected: {value}\n"
                              f"Got: {db_project_dict[key]}"))

        project_coaches_in_db = await read_all_where(ProjectCoach, ProjectCoach.project_id == int(project_id), session=self.session)
        self.assertIsNotNone(project_coaches_in_db, f"User has not been added for project {project_name} ")

        # test project user
        project_skills_in_db = await read_all_where(ProjectRequiredSkill, ProjectRequiredSkill.project_id == int(project_id), session=self.session)
        self.assertGreater(len(project_coaches_in_db), 0, f"Skill has not been added for project {project_name}")

        # test project required skills
        self.assertEqual(len(project_skills_in_db), len(skills), f"Not all skills have not been added for project {project_name}")
        project_skill_names = [skill.skill_name for skill in project_skills_in_db]
        for skill in skills:
            self.assertTrue(skill.name in project_skill_names, f"Skill {skill.name} not found for project {project_name}")


    async def test_get_projects_id_with_admin_user(self):
        url = f"{config.api_url}projects/"

        # Set up edition and project object
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

        # Send get project by id request
        responses: Dict[str, Response] = await self.auth_access_request_test(Request.GET, path, allowed_users, unauthorized_status=Status.BAD_REQUEST)

        # Test response message
        # Project url in the response message should be same as the expected value.
        for user_title, response in responses.items():
            gotten_project = json.loads(response.content)
            self.assertEqual(f"{url}{project.id}", gotten_project["id"],
                             f"The project gotten by {user_title} did not match the expected project.")

    async def test_get_projects_id_with_coach_user(self):
        url = f"{config.api_url}projects/"

        # Set up coach, edition and project object
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

        # Add coach to allowed users
        allowed_users.add(coach.name)

        # Send get project by id request
        responses: Dict[str, Response] = await self.auth_access_request_test(Request.GET, path, allowed_users, unauthorized_status=Status.BAD_REQUEST)

        # Test response message
        # Project url in the response message should be same as the expected value.
        for user_title, response in responses.items():
            gotten_project = json.loads(response.content)
            self.assertEqual(f"{url}{project.id}", gotten_project["id"],
                             f"The project gotten by {user_title} did not match the expected project.")
