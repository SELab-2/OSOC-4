import json
from typing import Dict, Set
import uuid
from httpx import Response
from app.config import config
from app.crud import read_all_where, read_where, update
from app.models.project import Project, ProjectCoach, ProjectRequiredSkill
from app.models.user import UserRole
from app.tests.test_base import TestBase, Request
from app.tests.utils_for_tests.EditionGenerator import EditionGenerator
from app.tests.utils_for_tests.SkillGenerator import SkillGenerator
from app.tests.utils_for_tests.UserGenerator import UserGenerator


class TestProjects(TestBase):
    project_data = {
        "name": "Student Volunteer Project",
        "description": "Free real estate",
        "partner_name": "UGent",
        "partner_description": "De C in UGent staat voor communicatie",
        "required_skills": [],
        "users": [],
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    async def asyncSetUp(self) -> None:
        await super().asyncSetUp()
        edition_generator = EditionGenerator(self.session)
        self.edition = edition_generator.generate_edition(2022)
        await update(self.edition, self.session)
        self.project_data["edition"] = self.edition.year

    async def assert_projects_equal(self, test_data: dict[str, any], project: Project):
        project_name = test_data["name"]

        project_dict = project.dict()
        skills = test_data.pop("required_skills")
        users = test_data.pop("users")

        # compare data
        for key, value in test_data.items():
            self.assertEqual(project_dict[key], value,
                             (f"{key} of project '{project_name}' did not match.\n"
                              f"Expected: {value}\n"
                              f"Got: {project_dict[key]}"))

        # compare project users
        db_users = await read_all_where(ProjectCoach, ProjectCoach.project_id == int(project.id), session=self.session)
        self.assertEqual(len(db_users), len(users), f"Number of users for project {project_name} does not match number of users in database")
        for db_user in db_users:
            self.assertTrue(db_user.coach_id in users, f"User with id {db_user.coach_id} not found for project {project_name}")

        # compare project required skills
        db_skills = await read_all_where(ProjectRequiredSkill, ProjectRequiredSkill.project_id == int(project.id), session=self.session)
        self.assertEqual(len(db_skills), len(skills), f"Number of required skills for project {project_name} does not match number of skills in database")
        db_skill_names = [skill.skill_name for skill in db_skills]
        for skill in skills:
            self.assertTrue(skill["skill_name"] in db_skill_names, f"Skill with name {skill['skill_name']} not found for project {project_name}")

    async def test_post_add_project_data(self):
        path = "/projects/create"
        allowed_users: Set[str] = await self.get_users_by([UserRole.ADMIN])
        project_name = self.project_data["name"]
        # Post create project request
        responses1: Dict[str, Response] = await self.auth_access_request_test(Request.POST, path, allowed_users,
                                                                              self.project_data)
        # Get project id from the response url
        project_id = ""
        for user_title in allowed_users:
            project_id = json.loads(responses1.get(user_title).content)["data"]["id"].split("/")[-1]

        # Test whether created project is in the database
        project_in_db = await read_where(Project, Project.name == project_name, session=self.session)
        self.assertIsNotNone(project_in_db, f"'{project_name}' was not found in the database.")

        # Project id in the database should be same as it in the response url
        self.assertEqual(str(project_in_db.id), project_id,
                         f"""Project id of '{project_name}'
                                 in the response URL is not equal to the id found in the database.""")
        # compare every field in the database with the test value
        await self.assert_projects_equal(self.project_data, project_in_db)

    async def test_post_add_project_data_with_skills_and_users(self):
        skill_generator = SkillGenerator(self.session)
        skills = skill_generator.generate_skills()
        skill_generator.add_to_db()
        await self.session.commit()

        project_coach = await self.get_user_by_name("user_approved_coach")
        self.project_data.update({
            "required_skills": [{"skill_name": skill.name, "number": 3} for skill in skills],
            "users": [project_coach.id],
        })

        await self.test_post_add_project_data()

    async def test_get_projects_id_with_admin_user(self):
        url = f"{config.api_url}projects/"

        # Set up project
        project = Project(
            coaches=[],
            **self.project_data)
        await update(project, self.session)

        path = "/projects/" + str(project.id)
        allowed_users: Set[str] = await self.get_users_by([UserRole.ADMIN, UserRole.COACH])

        # Send get project by id request
        responses: Dict[str, Response] = await self.auth_access_request_test(Request.GET, path, allowed_users)

        # Test response message
        # Project url in the response message should be same as the expected value.
        for user_title, response in responses.items():
            gotten_project = json.loads(response.content)
            self.assertEqual(f"{url}{project.id}", gotten_project["id"],
                             f"The project gotten by {user_title} did not match the expected project.")

    async def test_get_projects_id_with_coach_user(self):
        url = f"{config.api_url}projects/"

        # Set up coach and project
        coach = await self.get_user_by_name("user_approved_coach")

        project = Project(
            coaches=[coach],
            **self.project_data)
        await update(project, self.session)

        path = "/projects/" + str(project.id)
        allowed_users: Set[str] = await self.get_users_by([UserRole.ADMIN, UserRole.COACH])

        # Add coach to allowed users
        allowed_users.add(coach.name)

        # Send get project by id request
        responses: Dict[str, Response] = await self.auth_access_request_test(Request.GET, path, allowed_users)

        # Test response message
        # Project url in the response message should be same as the expected value.
        for user_title, response in responses.items():
            gotten_project = json.loads(response.content)
            self.assertEqual(f"{url}{project.id}", gotten_project["id"],
                             f"The project gotten by {user_title} did not match the expected project.")

    async def test_patch_projects_with_id(self):
        # Set up coaches and project
        user_generator = UserGenerator(self.session)
        coaches = user_generator.generate_users(4)
        user_generator.add_to_db()

        project = Project(
            coaches=[coaches[0]],
            **self.project_data)
        await update(project, self.session)

        project_id = project.id

        path = "/projects/" + str(project_id)
        allowed_users: Set[str] = await self.get_users_by([UserRole.ADMIN])

        # prepare data for update
        skill_generator = SkillGenerator(self.session)
        skills = skill_generator.generate_skills()
        skill_generator.add_to_db()
        await self.session.commit()

        project_skills = [{"skill_name": skill.name, "number": 3} for skill in skills]

        # updated data to be sent in a patch request
        body = {
            "name": str(uuid.uuid1()),
            "description": str(uuid.uuid1()),
            "partner_name": str(uuid.uuid1()),
            "partner_description": str(uuid.uuid1()),
            "users": [coach.id for coach in coaches],
            "required_skills": project_skills,
            "edition": self.edition.year
        }

        # Send patch project request
        responses: Dict[str, Response] = await self.auth_access_request_test(Request.PATCH, path, allowed_users, body)

        self.assertEqual(len(responses), 1)

        # check values in db after update
        project_in_db = await read_where(Project, Project.id == project.id, session=self.session)

        await self.assert_projects_equal(body, project_in_db)
