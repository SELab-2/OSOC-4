import json
from typing import Dict, Set, List
import uuid
from httpx import Response
from app.config import config
from app.crud import read_where, update
from app.models.project import Project
from app.models.user import UserRole
from app.tests.test_base import TestBase, Request
from app.tests.utils_for_tests.EditionGenerator import EditionGenerator
from app.tests.utils_for_tests.SkillGenerator import SkillGenerator
from app.models.edition import Edition
from app.tests.utils_for_tests.StudentGenerator import StudentGenerator
from app.tests.utils_for_tests.ProjectGenerator import ProjectGenerator
from app.models.participation import Participation
from app.tests.utils_for_tests.QuestionTagGenerator import QuestionTagGenerator
from app.models.question import Question
from app.models.question_tag import QuestionTag
from app.models.student import Student


class TestEditions(TestBase):
    async def asyncSetUp(self):
        await super().asyncSetUp()
        edition_generator = EditionGenerator(self.session)
        self.edition = edition_generator.generate_edition(2022)
        await update(self.edition, self.session)

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

    async def _create_question_tags_in_db(self, edition: Edition) -> List[QuestionTag]:
        """Helper function to add question tags to database"""
        question_tag_generator = QuestionTagGenerator(self.session)
        question_tag_generator.generate_question_tags(self.edition.year, n=5)
        question_tag_generator.add_to_db()
        await self.session.commit()
        return question_tag_generator.data

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
        # Send Get request
        path = "/editions"
        allowed_users: Set[str] = await self.get_users_by([UserRole.ADMIN, UserRole.COACH])
        responses: Dict[str, Response] = await self.auth_access_request_test(Request.GET, path, allowed_users)

        # Edition year from the response url in each response should be same as edition_year
        edition_year_from_response_url = ""
        for user_title in allowed_users:
            edition_year_from_response_url = json.loads(responses.get(user_title).content)[0].split("/")[-1]
            self.assertEqual(edition_year_from_response_url, str(self.edition.year), f"Returned editions of {self.edition.year} don't match expected value")

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

    async def test_get_edition_question_tags(self):
        """Test GET /editions/{year}/questiontags"""
        question_tags = await self._create_question_tags_in_db(self.edition)

        # send request
        path = f'/editions/{self.edition.year}/questiontags'
        response = await self.do_request(Request.GET, path, "user_admin", access_token=await self.get_access_token("user_admin"))
        question_tags_from_response = json.loads(response.content)

        # check response data
        response_tags = [question_tag.split('/')[-1] for question_tag in question_tags_from_response]
        response_tags.sort()

        question_tags = [question_tag.tag for question_tag in question_tags]
        question_tags.sort()

        self.assertEqual(question_tags, response_tags, "Question tags in the response is not correct")

    async def test_get_edition_question_tags_tag(self):
        """Test GET /editions/{year}/questiontags/{tag}"""
        question_tags = await self._create_question_tags_in_db(self.edition)

        question = Question(question="Just a question?", edition=self.edition.year)
        await update(question, self.session)

        question_tag = question_tags[0]
        question_tag.question_id = question.id
        question_tag.show_in_list = True
        question_tag.mandatory = True
        await update(question_tag, self.session)

        # send request
        path = f'/editions/{self.edition.year}/questiontags/{question_tag.tag}'
        response = await self.do_request(Request.GET, path, "user_admin", access_token=await self.get_access_token("user_admin"))
        question_tag_detail_from_response = json.loads(response.content)

        # check response data
        self.assertEqual(question_tag_detail_from_response["tag"], question_tag.tag)
        self.assertEqual(question_tag_detail_from_response["question"], "Just a question?")
        self.assertEqual(question_tag_detail_from_response["mandatory"], True)
        self.assertEqual(question_tag_detail_from_response["show_in_list"], True)

    async def test_post_create_edition(self):
        """Test POST /editions/create"""
        # Prepare new edition data
        new_edition = {
            "year": 2023,
            "name": str(uuid.uuid1()),
            "description": str(uuid.uuid1()),
            "form_id": str(uuid.uuid1()),
            "read_only": False,
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

    async def test_post_create_editions_year_question_tag(self):
        """Test POST /editions/{year}/questiontags should create a new QuestionTag for edition"""
        # Create an edition in db
        edition = Edition(year=2023, name='edition')
        await update(edition, self.session)

        # Prepare a new question tag
        new_question_tag_name = str(uuid.uuid1())
        post_body = {
            "tag": new_question_tag_name
        }

        # Send post new tag request
        path = f"/editions/{self.edition.year}/questiontags"
        allowed_users: Set[str] = await self.get_users_by([UserRole.ADMIN])
        responses: Dict[str, Response] = await self.auth_access_request_test(Request.POST, path, allowed_users, post_body)

        # Get tag name from the response url
        tag_name_in_response_url = ""
        for user_title in allowed_users:
            tag_name_in_response_url = json.loads(responses.get(user_title).content).split("/")[-1]

        # Check question tag in the response url
        self.assertEqual(tag_name_in_response_url, new_question_tag_name, f"Response url doesn't have the right tag name {new_question_tag_name}")

        # Test whether question tag is created in the database
        question_tag_in_db = await read_where(QuestionTag, QuestionTag.tag == new_question_tag_name, session=self.session)
        self.assertIsNotNone(question_tag_in_db, f"'{new_question_tag_name}' was not found in the database.")
        self.assertEqual(question_tag_in_db.edition, self.edition.year, f"'{self.edition.year}' was not found in the database.")
        self.assertEqual(question_tag_in_db.tag, new_question_tag_name, f"'{new_question_tag_name}' was not found in the database.")

    async def test_delete_editions_year_question_tag(self):
        """Test DELETE /editions/{year}/questiontags/{tag}"""
        # Create an edition in db
        edition = Edition(year=2023, name='edition')
        await update(edition, self.session)

        # Create a question tag
        question_tag = QuestionTag(
            edition=self.edition.year,
            tag=str(uuid.uuid1())
        )
        await update(question_tag, self.session)

        # Send delete new tag request
        path = f"/editions/{self.edition.year}/questiontags/{question_tag.tag}"
        allowed_users: Set[str] = await self.get_users_by([UserRole.ADMIN])
        await self.auth_access_request_test(Request.DELETE, path, allowed_users)

        # Test whether question tag is deleted in the database
        question_tag_in_db = await read_where(QuestionTag, QuestionTag.tag == question_tag.tag, session=self.session)
        self.assertIsNone(question_tag_in_db, f"'{question_tag.tag}' was not deleted in the database.")

    async def test_patch_editions_year_question_tag(self):
        """Test PATCH /editions/{year}/questiontags/{tag}"""
        # Create an edition in db
        edition = Edition(year=2023, name='edition')
        await update(edition, self.session)

        # Create a question tag
        question_tag = QuestionTag(
            edition=self.edition.year,
            tag=str(uuid.uuid1()),
            mandatory=False
        )
        await update(question_tag, self.session)

        # Create a question
        question_text = str(uuid.uuid1())
        question = Question(edition=self.edition.year, question=question_text)
        await update(question, self.session)

        # Prepare a question tag for update
        new_question_tag = str(uuid.uuid1())
        updated_question_tag_request_body = {
            # tag can only be changed if mandatory is false
            "tag": str(uuid.uuid1()),
            "question": question_text,
            "show_in_list": not question_tag.show_in_list,
            # mandatory field can't be changed
            "mandatory": question_tag.mandatory
        }

        updated_question_tag_request_body["tag"] = new_question_tag

        # Send patch question tag request
        path = f"/editions/{self.edition.year}/questiontags/{question_tag.tag}"
        allowed_users: Set[str] = await self.get_users_by([UserRole.ADMIN])
        responses = await self.auth_access_request_test(Request.PATCH, path, allowed_users, updated_question_tag_request_body)

        # Get tag name from the response url
        tag_name_in_response_url = ""
        for user_title in allowed_users:
            tag_name_in_response_url = json.loads(responses.get(user_title).content).split("/")[-1]
            self.assertEqual(tag_name_in_response_url, new_question_tag, f"Can't find question tag {new_question_tag} in respond url")

        # Check questin tag field values in the database
        question_tag_in_db = await read_where(QuestionTag, QuestionTag.tag == new_question_tag, session=self.session)
        self.assertEqual(question_tag_in_db.tag, new_question_tag, "Question tag was not updated in database.")
        self.assertEqual(question_tag_in_db.show_in_list, updated_question_tag_request_body["show_in_list"], "show_in_list was not updated in database.")
        self.assertEqual(question_tag_in_db.question_id, question.id, "Question id was not updated in database.")
