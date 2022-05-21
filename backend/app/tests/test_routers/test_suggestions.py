import uuid
from app.crud import read_where, update
from app.models.suggestion import Suggestion
from app.tests.test_base import TestBase, Request
from app.models.edition import Edition
from app.models.project import Project
from app.tests.utils_for_tests.SkillGenerator import SkillGenerator
from app.tests.utils_for_tests.StudentGenerator import StudentGenerator


class TestSuggestions(TestBase):
    async def asyncSetUp(self):
        await super().asyncSetUp()
        # Create an edition in db
        self.edition = Edition(year=2023, name='edition')
        await update(self.edition, self.session)

        # Create student in db
        skill_generator = SkillGenerator(self.session)
        skill_generator.generate_skills()
        student_generator = StudentGenerator(self.session, edition=self.edition, skills=skill_generator.data)
        self.student = student_generator.generate_student()
        student_generator.add_to_db()
        await self.session.commit()

        # Create project in db
        self.project = Project(edition=self.edition.year, name="", description="", partner_name="", partner_description="")
        await update(self.project, self.session)

    async def test_post_add_suggestion(self):
        # prepare suggestion request
        suggestion_request_body = {
            "decision": 0,
            "reason": str(uuid.uuid1()),
            "student_id": self.student.id,
            "project_id": self.project.id
        }
        path = "/suggestions/create"

        # Post create suggestion request
        await self.do_request(Request.POST, path, self.users["user_admin"].name, access_token=await self.get_access_token(self.users["user_admin"].name), json_body=suggestion_request_body)

        # Test whether created suggestion is in the database
        suggestion_in_db = await read_where(Suggestion, Suggestion.reason == suggestion_request_body["reason"], session=self.session)
        self.assertIsNotNone(suggestion_in_db, "Suggestion was not found in the database.")
        self.assertEqual(suggestion_in_db.student_id, self.student.id, "Student was not found in the database.")
        self.assertEqual(suggestion_in_db.project_id, self.project.id, "Project was not found in the database.")
        self.assertEqual(suggestion_in_db.suggested_by_id, self.users["user_admin"].id, "Project was not found in the database.")
        self.assertEqual(suggestion_in_db.decision, suggestion_request_body['decision'], "Project was not found in the database.")
