import json
from typing import Dict, Set
import uuid
from httpx import Response
from app.config import config
from app.crud import read_all_where, read_where, update
from app.models.suggestion import Suggestion
from app.models.user import UserRole
from app.tests.test_base import TestBase, Request
from app.tests.utils_for_tests.EditionGenerator import EditionGenerator
from app.models.edition import Edition
from app.models.project import Project
from app.models.student import Student
from app.tests.utils_for_tests.ProjectGenerator import ProjectGenerator
from app.tests.utils_for_tests.SkillGenerator import SkillGenerator
from app.tests.utils_for_tests.StudentGenerator import StudentGenerator

class TestSuggestions(TestBase):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    async def test_post_add_suggestion(self):

        # Create an edition in db
        edition = Edition(year=2023, name='edition')
        await update(edition, self.session)

        # Create student in db
        skill_generator = SkillGenerator(self.session)
        skill_generator.generate_skills()
        student_generator = StudentGenerator(self.session, edition=edition, skills=skill_generator.data)
        student = student_generator.generate_student()
        student_generator.add_to_db()
        await self.session.commit()

        # Create project in db
        project = Project(edition=edition.year, name="", description="", partner_name="", partner_description="")
        await update(project, self.session)

        # prepare suggestion request
        suggestion_request_body = {
            "decision": 0,
            "reason": str(uuid.uuid1()),
            "student_id": student.id,
            "project_id": project.id
            }
        path = "/suggestions/create"
        allowed_users: Set[str] = await self.get_users_by([UserRole.ADMIN])

        # Post create suggestion request
        await self.do_request(Request.POST, path, self.user_admin.name, access_token=await self.get_access_token(self.user_admin.name), json_body=suggestion_request_body)

        # Test whether created suggestion is in the database
        suggestion_in_db = await read_where(Suggestion, Suggestion.reason == suggestion_request_body["reason"], session=self.session)
        self.assertIsNotNone(suggestion_in_db, f"'Suggestion was not found in the database.")
        self.assertEqual(suggestion_in_db.student_id, student.id, f"'Student was not found in the database.")
        self.assertEqual(suggestion_in_db.project_id, project.id, f"'Project was not found in the database.")
        self.assertEqual(suggestion_in_db.suggested_by_id, self.user_admin.id, f"'Project was not found in the database.")
        self.assertEqual(suggestion_in_db.decision, suggestion_request_body['decision'], f"'Project was not found in the database.")
