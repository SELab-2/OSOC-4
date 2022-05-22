import json
from typing import Dict, Set, List
import uuid
from httpx import Response
from app.config import config
from app.crud import read_where, update
from app.models.project import Project
from app.models.user import UserRole
from app.tests.test_base import TestBase, Request
from app.tests.test_routers.test_editions import TestEditions
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


class TestQuestionTags(TestBase):
    async def asyncSetUp(self):
        await super().asyncSetUp()
        edition_generator = EditionGenerator(self.session)
        self.edition = edition_generator.generate_edition(2022)
        await update(self.edition, self.session)

    async def _create_question_tags_in_db(self, edition: Edition) -> List[QuestionTag]:
        """Helper function to add question tags to database"""
        question_tag_generator = QuestionTagGenerator(self.session)
        question_tag_generator.generate_question_tags(edition.year, n=5)
        question_tag_generator.add_to_db()
        await self.session.commit()
        return question_tag_generator.data

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
