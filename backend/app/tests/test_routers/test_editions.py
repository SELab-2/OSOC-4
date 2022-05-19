import json
from typing import Dict, Set, List
import uuid
from httpx import Response
from app.config import config
from app.crud import read_all_where, read_where, update
from app.models.project import Project, ProjectCoach
from app.models.user import User, UserRole
from app.tests.test_base import TestBase, Request
from app.tests.utils_for_tests.EditionGenerator import EditionGenerator
from app.tests.utils_for_tests.SkillGenerator import SkillGenerator
from app.models.edition import Edition, EditionCoach
from app.tests.utils_for_tests.StudentGenerator import StudentGenerator
from app.tests.utils_for_tests.ProjectGenerator import ProjectGenerator
from app.models.participation import Participation
from app.tests.utils_for_tests.QuestionTagGenerator import QuestionTagGenerator
from app.models.question import Question
from app.models.question_tag import QuestionTag
from app.models.student import Student


class TestEditions(TestBase):
    async def create_edition_in_db(self, edition_year: int = 2022) -> Edition:
        edition_generator = EditionGenerator(self.session)
        edition = edition_generator.generate_edition(edition_year)
        await update(edition, self.session)
        return edition

    async def create_students_in_db(self, edition: Edition, count: int = 1) -> List[Student]:
        skill_generator = SkillGenerator(self.session)
        skill_generator.generate_skills()
        student_generator = StudentGenerator(self.session, edition=edition, skills=skill_generator.data)
        student_generator.generate_students(count)
        student_generator.add_to_db()
        await self.session.commit()
        return student_generator.data

    async def create_projects_in_db(self, edition: Edition, count: int = 1) -> List[Project]:
        project_generator = ProjectGenerator(self.session, edition_year=edition.year)
        project_generator.generate_projects(count)
        project_generator.add_to_db()
        await self.session.commit()
        return project_generator.data

    async def create_question_tags_in_db(self, edition: Edition) -> List[QuestionTag]:
        question_tag_generator = QuestionTagGenerator(self.session, edition)
        question_tag_generator.generate_question_tags()
        question_tag_generator.add_to_db()
        await self.session.commit()
        return question_tag_generator.data

    def assert_edition_equal(self, test_data: dict[str, any], edition: Edition):
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
        edition2022 = await self.create_edition_in_db(2022)

        # Send Get request
        path = "/editions"
        allowed_users: Set[str] = await self.get_users_by([UserRole.ADMIN, UserRole.COACH])
        responses1: Dict[str, Response] = await self.auth_access_request_test(Request.GET, path, allowed_users)

        # Check response data
        self.assertGreater(len(responses1), 0, "Expect at least one response from the endpoint")
        self.assertEqual(len(allowed_users), len(responses1), "Number of responses should be same as number of users")

        # Edition year from the response url in each response should be same as edition_year
        edition_year_from_response_url = ""
        for user_title in allowed_users:
            edition_year_from_response_url = json.loads(responses1.get(user_title).content)[0].split("/")[-1]
            self.assertEqual(edition_year_from_response_url, str(edition2022.year), f"Returned editions of {edition2022.year} don't match expected value")

    async def test_get_editions_by_year(self):
        edition = await self.create_edition_in_db()
        # Send Get request
        path = f'/editions/{edition.year}'
        allowed_users: Set[str] = await self.get_users_by([UserRole.ADMIN])
        responses1: Dict[str, Response] = await self.auth_access_request_test(Request.GET, path, allowed_users)

        # Check response data
        self.assertGreater(len(responses1), 0, "Expect at least one response from the endpoint")
        self.assertEqual(len(allowed_users), len(responses1), "Number of responses should be same as number of users")

        # Compare response edition data with expected edition data
        expected_edition_data = {
            "uri": f"{config.api_url}editions/{edition.year}",
            "year": edition.year,
            "name": edition.name,
            "description": edition.description,
            "users": f"{config.api_url}editions/{edition.year}/users",
            "students": f"{config.api_url}editions/{edition.year}/students",
            "projects": f"{config.api_url}editions/{edition.year}/projects",
            "questiontags": f"{config.api_url}editions/{edition.year}/questiontags"
        }
        for user_title in allowed_users:
            edition_data_from_response = json.loads(responses1.get(user_title).content)
            self.assert_edition_equal(expected_edition_data, edition_data_from_response)

    async def test_get_edition_users(self):
        edition = await self.create_edition_in_db()

        users = await read_all_where(User, User.active, User.approved, User.disabled == False, session=self.session)
        for user in users:
            editionCoach = EditionCoach(edition=edition.year, coach_id=user.id)
            await update(editionCoach, self.session)

        # Send request
        path = f'/editions/{edition.year}/users'
        allowed_users: Set[str] = await self.get_users_by([UserRole.ADMIN, UserRole.COACH])
        responses1: Dict[str, Response] = await self.auth_access_request_test(Request.GET, path, allowed_users)

        # Check response data
        self.assertGreater(len(responses1), 0, "Expect at least one response from the endpoint")
        self.assertEqual(len(allowed_users), len(responses1), "Number of responses should be same as number of users")

        test_users_ids = [user.id for user in users]
        test_users_ids.sort()

        # Compare response edition data with expected edition data
        for user_title in allowed_users:
            edition_data_from_response = json.loads(responses1.get(user_title).content)
            response_ids = [int(user_url.split('/')[-1]) for user_url in edition_data_from_response]
            response_ids.sort()
            self.assertEqual(test_users_ids, response_ids, f"Returned users of edition {edition.year} don't match expected value")

    async def test_get_edition_students(self):

        edition = await self.create_edition_in_db()
        students = await self.create_students_in_db(edition=edition, count=10)

        # Send request
        path = f'/editions/{edition.year}/students'
        allowed_users: Set[str] = await self.get_users_by([UserRole.ADMIN, UserRole.COACH])
        responses1: Dict[str, Response] = await self.auth_access_request_test(Request.GET, path, allowed_users)

        # Check response data
        self.assertGreater(len(responses1), 0, "Expect at least one response from the endpoint")
        self.assertEqual(len(allowed_users), len(responses1), "Number of responses should be same as number of users")

        test_students_ids = [student.id for student in students]
        test_students_ids.sort()

        # Compare response edition data with expected edition data
        for user_title in allowed_users:
            edition_students_from_response = json.loads(responses1.get(user_title).content)
            response_ids = [int(student_url.split('/')[-1]) for student_url in edition_students_from_response]
            response_ids.sort()
            self.assertEqual(test_students_ids, response_ids, f"Returned students don't match expected students for edition {edition.year}")

    async def test_get_edition_projects_user_admin_should_get_all_projects(self):

        edition = await self.create_edition_in_db()
        projects = await self.create_projects_in_db(edition=edition, count=10)

        # Send request
        path = f'/editions/{edition.year}/projects'
        response = await self.do_request(Request.GET, path, self.user_admin.name, access_token=await self.get_access_token(self.user_admin.name))
        edition_projects_from_response = json.loads(response.content)

        # Check response data
        test_projects_ids = [project.id for project in projects]
        test_projects_ids.sort()

        response_ids = [int(project_url.split('/')[-1]) for project_url in edition_projects_from_response]
        response_ids.sort()

        self.assertEqual(test_projects_ids, response_ids, f"Returned projects don't match expected projects for edition {edition.year}")

    async def test_get_edition_projects_user_coach_should_get_no_projects_if_he_is_not_coach_for_any_projects(self):
        """Test GET /editions/{year}/projects with user_coach should get no projects if he is not coach for any projects."""

        edition = await self.create_edition_in_db()
        projects = await self.create_projects_in_db(edition=edition, count=10)

        # Send request
        path = f'/editions/{edition.year}/projects'
        response = await self.do_request(Request.GET, path, self.user_coach.name, access_token=await self.get_access_token(self.user_coach.name))
        edition_projects_from_response = json.loads(response.content)

        # Check response data
        test_projects_ids = [project.id for project in projects]
        test_projects_ids.sort()

        response_ids = [int(project_url.split('/')[-1]) for project_url in edition_projects_from_response]
        response_ids.sort()

        self.assertEqual(len(response_ids), 0, f"No projects should be returned for coach {self.user_coach.name}")

    async def test_get_edition_projects_user_coach_should_get_projects_if_he_is_coach_for_the_project(self):

        edition = await self.create_edition_in_db()
        projects = await self.create_projects_in_db(edition=edition, count=10)

        projectCoach = ProjectCoach(project_id=projects[0].id, coach_id=self.user_coach.id)
        await update(projectCoach, session=self.session)

        # Send request
        path = f'/editions/{edition.year}/projects'
        response = await self.do_request(Request.GET, path, self.user_coach.name, access_token=await self.get_access_token(self.user_coach.name))
        edition_projects_from_response = json.loads(response.content)

        # Check response data
        test_projects_ids = [project.id for project in projects]
        test_projects_ids.sort()
        response_ids = [int(project_url.split('/')[-1]) for project_url in edition_projects_from_response]
        self.assertEqual(len(response_ids), 1, f"Expected 1 project for coach: {self.user_coach.name}")
        self.assertEqual(projects[0].id, response_ids[0], "Project id in the response url is not correct")

    async def test_get_edition_resolving_conflict(self):

        edition = await self.create_edition_in_db()
        projects = await self.create_projects_in_db(edition=edition, count=10)
        students = await self.create_students_in_db(edition=edition, count=10)

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
        path = f'/editions/{edition.year}/resolving_conflicts'
        response = await self.do_request(Request.GET, path, self.user_coach.name, access_token=await self.get_access_token(self.user_coach.name))
        conflict_students_from_response = json.loads(response.content)

        # check response data
        response_ids = [int(student_url.split('/')[-1]) for student_url in conflict_students_from_response]
        response_ids.sort()

        conflict_student_Ids = [conflict_student_Id_1, conflict_student_Id_2]
        conflict_student_Ids.sort()

        self.assertEqual(conflict_student_Ids, response_ids, "Conflict students in the response url is not correct")

    async def test_get_edition_question_tags(self):

        edition = await self.create_edition_in_db()
        question_tags = await self.create_question_tags_in_db(edition)

        # send request
        path = f'/editions/{edition.year}/questiontags'
        response = await self.do_request(Request.GET, path, self.user_admin.name, access_token=await self.get_access_token(self.user_admin.name))
        question_tags_from_response = json.loads(response.content)

        # check response data
        response_tags = [question_tag.split('/')[-1] for question_tag in question_tags_from_response]
        response_tags.sort()

        question_tags = [question_tag.tag for question_tag in question_tags]
        question_tags.sort()

        self.assertEqual(question_tags, response_tags, "Question tags in the response is not correct")

    async def test_get_edition_question_tags_tag(self):
        edition = await self.create_edition_in_db()
        question_tags = await self.create_question_tags_in_db(edition)

        question = Question(question="Just a question?", edition=edition.year)
        await update(question, self.session)

        question_tag = question_tags[0]
        question_tag.question_id = question.id
        question_tag.showInList = True
        question_tag.mandatory = True
        await update(question_tag, self.session)

        # send request
        path = f'/editions/{edition.year}/questiontags/{question_tag.tag}'
        response = await self.do_request(Request.GET, path, self.user_admin.name, access_token=await self.get_access_token(self.user_admin.name))
        question_tag_detail_from_response = json.loads(response.content)

        # check response data
        self.assertEqual(question_tag_detail_from_response["tag"], question_tag.tag)
        self.assertEqual(question_tag_detail_from_response["question"], "Just a question?")
        self.assertEqual(question_tag_detail_from_response["mandatory"], True)
        self.assertEqual(question_tag_detail_from_response["showInList"], True)

    async def test_get_edition_question_tags_showinlist(self):

        edition = await self.create_edition_in_db()
        question_tags = await self.create_question_tags_in_db(edition)

        question = Question(question="Just a question?", edition=edition.year)
        await update(question, self.session)

        question_tag = question_tags[0]
        question_tag.question_id = question.id
        question_tag.showInList = True
        question_tag.mandatory = True
        await update(question_tag, self.session)

        # send request
        path = f'/editions/{edition.year}/questiontags/showinlist'
        response = await self.do_request(Request.GET, path, self.user_admin.name, access_token=await self.get_access_token(self.user_admin.name))
        question_tag_detail_from_response = json.loads(response.content)

        # check response data
        self.assertEqual(question_tag_detail_from_response["tag"], question_tag.tag)
        self.assertEqual(question_tag_detail_from_response["question"], "Just a question?")
        self.assertEqual(question_tag_detail_from_response["mandatory"], True)
        self.assertEqual(question_tag_detail_from_response["showInList"], True)

    async def test_post_create_edition(self):

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
        responses1: Dict[str, Response] = await self.auth_access_request_test(Request.POST, path, allowed_users,
                                                                              new_edition)
        # Get edition id from the response url
        edition_year_in_response_url = 0
        for user_title in allowed_users:
            edition_year_in_response_url = int(json.loads(responses1.get(user_title).content).split("/")[-1])

        # Check edition year in the response url
        self.assertEqual(edition_year_in_response_url, new_edition["year"], f"Response url doesn't have the right edition year {new_edition['year']}")

        # Test whether created edition is in the database
        edition_in_db = await read_where(Edition, Edition.name == edition_name, session=self.session)
        self.assertIsNotNone(edition_in_db, f"'{edition_name}' was not found in the database.")

        # Compare every field in the database with the test value
        self.assert_edition_equal(new_edition, edition_in_db)

    async def test_patch_update_edition(self):
        # Create an edition in db
        edition = Edition(year=2023, name='edition')
        await update(edition, self.session)

        # Prepare edition data to be updated
        updated_edition = {
            "year": edition.year,
            "name": str(uuid.uuid1()),
            "description": str(uuid.uuid1()),
            "form_id": str(uuid.uuid1()),
            "read_only": not edition.read_only
        }
        updated_edition_name = updated_edition["name"]

        # Send patch request
        path = f"/editions/{edition.year}"
        allowed_users: Set[str] = await self.get_users_by([UserRole.ADMIN])
        responses1: Dict[str, Response] = await self.auth_access_request_test(Request.PATCH, path, allowed_users, updated_edition)
        # Get edition id from the response url
        edition_year_in_response_url = 0
        for user_title in allowed_users:
            edition_year_in_response_url = int(json.loads(responses1.get(user_title).content).split("/")[-1])

        # Check edition year in the response url
        self.assertEqual(edition_year_in_response_url, updated_edition["year"], f"Response url doesn't have the right edition year {updated_edition['year']}")

        # Test whether updated edition is in the database
        edition_in_db = await read_where(Edition, Edition.name == updated_edition_name, session=self.session)
        self.assertIsNotNone(edition_in_db, f"'{updated_edition_name}' was not found in the database.")

        # Compare every field in the database with the test value
        self.assert_edition_equal(updated_edition, edition_in_db)

    async def test_post_create_editions_year_question_tag(self):
        # Create an edition in db
        edition = Edition(year=2023, name='edition')
        await update(edition, self.session)

        # Prepare a new question tag
        new_question_tag_name = str(uuid.uuid1())
        post_body = {
            "tag": new_question_tag_name
        }

        # Send post new tag request
        path = f"/editions/{edition.year}/questiontags"
        allowed_users: Set[str] = await self.get_users_by([UserRole.ADMIN])
        responses1: Dict[str, Response] = await self.auth_access_request_test(Request.POST, path, allowed_users, post_body)

        # Get tag name from the response url
        tag_name_in_response_url = ""
        for user_title in allowed_users:
            tag_name_in_response_url = json.loads(responses1.get(user_title).content).split("/")[-1]

        # Check question tag in the response url
        self.assertEqual(tag_name_in_response_url, new_question_tag_name, f"Response url doesn't have the right tag name {new_question_tag_name}")

        # Test whether question tag is created in the database
        question_tag_in_db = await read_where(QuestionTag, QuestionTag.tag == new_question_tag_name, session=self.session)
        self.assertIsNotNone(question_tag_in_db, f"'{new_question_tag_name}' was not found in the database.")
        self.assertEqual(question_tag_in_db.edition, edition.year, f"'{edition.year}' was not found in the database.")
        self.assertEqual(question_tag_in_db.tag, new_question_tag_name, f"'{new_question_tag_name}' was not found in the database.")

    async def test_delete_editions_year_question_tag(self):
        # Create an edition in db
        edition = Edition(year=2023, name='edition')
        await update(edition, self.session)

        # Create a question tag
        question_tag = QuestionTag(
            edition=edition.year,
            tag=str(uuid.uuid1())
        )
        await update(question_tag, self.session)

        # Send delete new tag request
        path = f"/editions/{edition.year}/questiontags/{question_tag.tag}"
        allowed_users: Set[str] = await self.get_users_by([UserRole.ADMIN])
        await self.auth_access_request_test(Request.DELETE, path, allowed_users)

        # Test whether question tag is created in the database
        question_tag_in_db = await read_where(QuestionTag, QuestionTag.tag == question_tag.tag, session=self.session)
        self.assertIsNone(question_tag_in_db, f"'{question_tag.tag}' was not deleted in the database.")

    async def test_patch_editions_year_question_tag(self):
        # Create an edition in db
        edition = Edition(year=2023, name='edition')
        await update(edition, self.session)

        # Create a question tag
        question_tag = QuestionTag(
            edition=edition.year,
            tag=str(uuid.uuid1())
        )
        await update(question_tag, self.session)

        # Create a question
        question_text = str(uuid.uuid1())
        question = Question(edition=edition.year, question=question_text)
        await update(question, self.session)

        # Prepare a question tag for update
        new_question_tag = str(uuid.uuid1())
        updated_question_tag_request_body = {
            # tag can be changed if mandatory is false
            "tag": question_tag.tag,
            "question": question_text,
            "showInList": not question_tag.showInList,
            # change mandatory field is not supported yet
            "mandatory": question_tag.mandatory
        }
        # tag can be changed if mandatory is false.
        if updated_question_tag_request_body["mandatory"]:
            new_question_tag = question_tag.tag
        else:
            new_question_tag = str(uuid.uuid1())

        updated_question_tag_request_body["tag"] = new_question_tag

        # Send patch question tag request
        path = f"/editions/{edition.year}/questiontags/{question_tag.tag}"
        allowed_users: Set[str] = await self.get_users_by([UserRole.ADMIN])
        responses1 = await self.auth_access_request_test(Request.PATCH, path, allowed_users, updated_question_tag_request_body)

        # Get tag name from the response url
        tag_name_in_response_url = ""
        for user_title in allowed_users:
            tag_name_in_response_url = json.loads(responses1.get(user_title).content).split("/")[-1]
            self.assertEqual(tag_name_in_response_url, new_question_tag, f"Can't find question tag {new_question_tag} in respond url")

        # Check questin tag field vaules in the database
        question_tag_in_db = await read_where(QuestionTag, QuestionTag.tag == new_question_tag, session=self.session)
        self.assertEqual(question_tag_in_db.tag, new_question_tag, "Question tag was not updated in database.")
        # change mandatory field is not supported yet
        # self.assertEqual(question_tag_in_db.mandatory, updated_question_tag["mandatory"], f"Mandatory field was not updated in database.")
        self.assertEqual(question_tag_in_db.showInList, updated_question_tag_request_body["showInList"], "showInList was not updated in database.")
        self.assertEqual(question_tag_in_db.question_id, question.id, "Question id was not updated in database.")
