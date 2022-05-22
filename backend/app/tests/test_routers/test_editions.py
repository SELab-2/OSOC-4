import json
from typing import Dict, Set, List
import uuid
from httpx import Response
from app.config import config
from app.crud import read_where, update
from app.models.project import Project
from app.models.user import UserRole
from app.tests.test_base import TestBase, Request, Status
from app.tests.utils_for_tests.EditionGenerator import EditionGenerator
from app.tests.utils_for_tests.SkillGenerator import SkillGenerator
from app.models.edition import Edition
from app.tests.utils_for_tests.StudentGenerator import StudentGenerator
from app.tests.utils_for_tests.ProjectGenerator import ProjectGenerator
from app.models.participation import Participation
from app.models.student import Student


class TestEditions(TestBase):
    edition_data = {
        "year": 2022,
        "name": "Test edition",
        "description": "Some description",
        "form_id": str(uuid.uuid1()),
        "read_only": False,
    }

    async def asyncSetUp(self):
        await super().asyncSetUp()
        edition_generator = EditionGenerator(self.session)
        self.edition = edition_generator.generate_edition(2022)
        await update(self.edition, self.session)
        self.edition_data

    async def _create_students_in_db(self, edition: Edition, count: int = 1) -> List[Student]:
        """Helper function to add students to database"""
        skill_generator = SkillGenerator(self.session)
        skill_generator.generate_skills()
        student_generator = StudentGenerator(self.session, edition=edition, skills=skill_generator.data)
        student_generator.generate_students(count)
        student_generator.add_to_db()
        await self.session.commit()
        return student_generator.data

    async def _create_projects_in_db(self, edition: Edition, count: int = 1) -> List[Project]:
        """Helper function to add projects to database"""
        project_generator = ProjectGenerator(self.session)
        project_generator.generate_projects(edition.year, count)
        project_generator.add_to_db()
        await self.session.commit()
        return project_generator.data

    def _assert_edition_equal(self, test_data: dict[str, any], edition: Edition):
        """Assert that the data in the given edition matches the test data

        :param test_data: dictionary containing the test data
        :type test_data: dict[str, any]
        :param edition: the edition to compare
        :type edition: Edition
        """
        edition_name = test_data["name"]

        if "name" in edition:
            edition_dict = edition
        else:
            edition_dict = edition.dict()

        # compare data
        for key, value in test_data.items():
            self.assertEqual(edition_dict[key], value,
                             (f"{key} of edition '{edition_name}' did not match.\n"
                              f"Expected: {value}\n"
                              f"Got: {edition_dict[key]}"))

    async def test_get_editions(self):
        """Test GET /editions"""
        path = "/editions"
        allowed_users: Set[str] = await self.get_users_by([UserRole.ADMIN, UserRole.COACH])
        # Send GET requests
        responses: Dict[str, Response] = await self.auth_access_request_test(Request.GET, path, allowed_users)

        # Edition year from the response url in each response should be same as edition_year
        edition_year_from_response_url = ""
        for user_title in allowed_users:
            edition_year_from_response_url = json.loads(responses.get(user_title).content)[0].split("/")[-1]
            self.assertEqual(edition_year_from_response_url, str(self.edition.year), f"Returned editions of {self.edition.year} don't match expected value")

    async def test_get_current_edition(self):
        """Test GET /editions/current_edition"""
        path = "/editions/current_edition"
        allowed_users: Set[str] = await self.get_users_by([UserRole.ADMIN, UserRole.COACH])
        # Send GET requests
        responses: Dict[str, Response] = await self.auth_access_request_test(Request.GET, path, allowed_users)

        # Compare response edition data with expected edition data
        for response_edition in responses.values():
            self.assertEqual(json.loads(response_edition.content)["year"], self.edition.year)

    async def test_post_create_edition(self):
        """Test POST /editions/create"""
        # Prepare new edition data
        new_edition = {
            **self.edition_data,
            "year": 2023
        }
        edition_name = new_edition["name"]

        # Send post create edition request
        path = "/editions/create"
        allowed_users: Set[str] = await self.get_users_by([UserRole.ADMIN])
        responses: Dict[str, Response] = await self.auth_access_request_test(Request.POST, path, allowed_users, new_edition)
        # Get edition id from the response url
        edition_year_in_response_url = 0
        for user_title in allowed_users:
            edition_year_in_response_url = int(json.loads(responses.get(user_title).content).split("/")[-1])

        # Check edition year in the response url
        self.assertEqual(edition_year_in_response_url, new_edition["year"], f"Response url doesn't have the right edition year {new_edition['year']}")

        # Test whether created edition is in the database
        edition_in_db = await read_where(Edition, Edition.name == edition_name, session=self.session)
        self.assertIsNotNone(edition_in_db, f"'{edition_name}' was not found in the database.")

        # Compare every field in the database with the test value
        self._assert_edition_equal(new_edition, edition_in_db)

    async def test_post_create_edition_invalid(self):
        """Test POST /editions/create with invalid arguments"""

        # Prepare edition data
        new_edition = {
            **self.edition_data,
            "year": 1999
        }

        path = "/editions/create"
        await self.do_request(Request.POST, path, "user_admin", expected_status=Status.CONFLICT, access_token=await self.get_access_token("user_admin"), json_body=new_edition)

    async def test_post_create_edition_existing(self):
        """Test POST /editions/create with existing year"""

        # Prepare edition data
        new_edition = {
            **self.edition_data,
            "year": self.edition.year
        }

        path = "/editions/create"
        await self.do_request(Request.POST, path, "user_admin", expected_status=Status.CONFLICT, access_token=await self.get_access_token("user_admin"), json_body=new_edition)

    async def test_get_editions_by_year(self):
        """Test GET /editions/{year}"""
        # Send Get request
        path = f'/editions/{self.edition.year}'
        allowed_users: Set[str] = await self.get_users_by([UserRole.ADMIN])
        responses: Dict[str, Response] = await self.auth_access_request_test(Request.GET, path, allowed_users)

        # Compare response edition data with expected edition data
        expected_edition_data = {
            "uri": f"{config.api_url}editions/{self.edition.year}",
            "year": self.edition.year,
            "name": self.edition.name,
            "description": self.edition.description,
            "students": f"{config.api_url}editions/{self.edition.year}/students",
            "projects": f"{config.api_url}editions/{self.edition.year}/projects",
            "questiontags": f"{config.api_url}editions/{self.edition.year}/questiontags"
        }
        for user_title in allowed_users:
            edition_data_from_response = json.loads(responses.get(user_title).content)
            self._assert_edition_equal(expected_edition_data, edition_data_from_response)

    async def test_patch_update_edition(self):
        """Test PATCH /editions/{year}"""
        # Prepare edition data to be updated
        updated_edition = {
            "year": self.edition.year,
            "name": str(uuid.uuid1()),
            "description": str(uuid.uuid1()),
            "form_id": str(uuid.uuid1()),
            "read_only": not self.edition.read_only
        }
        updated_edition_name = updated_edition["name"]

        # Send patch request
        path = f"/editions/{self.edition.year}"
        allowed_users: Set[str] = await self.get_users_by([UserRole.ADMIN])
        responses: Dict[str, Response] = await self.auth_access_request_test(Request.PATCH, path, allowed_users, updated_edition)
        # Get edition id from the response url
        edition_year_in_response_url = 0
        for user_title in allowed_users:
            edition_year_in_response_url = int(json.loads(responses.get(user_title).content).split("/")[-1])

        # Check edition year in the response url
        self.assertEqual(edition_year_in_response_url, updated_edition["year"], f"Response url doesn't have the right edition year {updated_edition['year']}")

        # Test whether updated edition is in the database
        edition_in_db = await read_where(Edition, Edition.name == updated_edition_name, session=self.session)
        self.assertIsNotNone(edition_in_db, f"'{updated_edition_name}' was not found in the database.")

        # Compare every field in the database with the test value
        self._assert_edition_equal(updated_edition, edition_in_db)

    async def test_patch_update_edition_invalid_year(self):
        """Test PATCH /editions/{year} with invalid year"""
        # Prepare edition data
        new_edition = {
            **self.edition_data,
            "year": self.edition.year + 1
        }

        # Do PATCH request
        path = f"/editions/{self.edition.year}"
        await self.do_request(Request.PATCH, path, "user_admin", expected_status=Status.BAD_REQUEST, access_token=await self.get_access_token("user_admin"), json_body=new_edition)

    async def test_patch_update_edition_nonexistent(self):
        """Test PATCH /editions/{year} where the edition doesn't exist"""
        # Prepare edition data
        new_edition = {
            **self.edition_data,
            "year": self.edition.year + 1
        }

        # Do PATCH request
        path = f"/editions/{self.edition.year + 1}"
        await self.do_request(Request.PATCH, path, "user_admin", expected_status=Status.NOT_FOUND, access_token=await self.get_access_token("user_admin"), json_body=new_edition)

    async def test_get_edition_students(self):
        """Test GET /editions/{year}/students"""
        students = await self._create_students_in_db(edition=self.edition, count=10)

        # Send request
        path = f'/editions/{self.edition.year}/students'
        allowed_users: Set[str] = await self.get_users_by([UserRole.ADMIN, UserRole.COACH])
        responses: Dict[str, Response] = await self.auth_access_request_test(Request.GET, path, allowed_users)

        test_students_ids = [student.id for student in students]
        test_students_ids.sort()

        # Compare response edition data with expected edition data
        for user_title in allowed_users:
            edition_students_from_response = json.loads(responses.get(user_title).content)
            response_ids = [int(student_url.split('/')[-1]) for student_url in edition_students_from_response]
            response_ids.sort()
            self.assertEqual(test_students_ids, response_ids, f"Returned students don't match expected students for edition {self.edition.year}")

    async def test_get_edition_projects(self):
        """Test GET /editions/{year}/projects with user_coach should get no projects if he is not coach for any projects"""

        projects = await self._create_projects_in_db(edition=self.edition, count=10)

        allowed_users: Set[str] = await self.get_users_by([UserRole.ADMIN, UserRole.COACH])
        # Send request
        path = f'/editions/{self.edition.year}/projects'

        responses: Dict[str, Response] = await self.auth_access_request_test(Request.GET, path, allowed_users)

        # Check response data
        test_projects_ids = [project.id for project in projects]
        test_projects_ids.sort()

        project_ids = [project.id for project in projects]
        project_ids.sort()

        for response in responses.values():
            response_ids = [int(project_url.split('/')[-1]) for project_url in json.loads(response.content)]
            response_ids.sort()
            self.assertEqual(response_ids, test_projects_ids, f"Returned project ids did not match.\nExpected:{project_ids}\nGot: {response_ids} ")

    async def test_get_edition_resolving_conflict(self):
        """Test GET /editions/{year}/resolving_conflicts"""
        projects = await self._create_projects_in_db(edition=self.edition, count=10)
        students = await self._create_students_in_db(edition=self.edition, count=10)

        conflict_student_Id_1 = students[0].id
        participation = Participation(project_id=projects[0].id, student_id=conflict_student_Id_1)
        await update(participation, session=self.session)
        participation = Participation(project_id=projects[1].id, student_id=conflict_student_Id_1)
        await update(participation, session=self.session)

        conflict_student_Id_2 = students[1].id
        participation = Participation(project_id=projects[0].id, student_id=conflict_student_Id_2)
        await update(participation, session=self.session)
        participation = Participation(project_id=projects[1].id, student_id=conflict_student_Id_2)
        await update(participation, session=self.session)

        # send request
        path = f'/editions/{self.edition.year}/resolving_conflicts'
        response = await self.do_request(Request.GET, path, "coach", access_token=await self.get_access_token("coach"))
        conflict_students_from_response = json.loads(response.content)

        # check response data
        response_ids = [int(student_url.split('/')[-1]) for student_url in conflict_students_from_response]
        response_ids.sort()

        conflict_student_Ids = [conflict_student_Id_1, conflict_student_Id_2]
        conflict_student_Ids.sort()

        self.assertEqual(conflict_student_Ids, response_ids, "Conflict students in the response url is not correct")
