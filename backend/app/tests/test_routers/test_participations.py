from typing import List
import uuid
from app.crud import read_all_where, read_where, update
from app.models.project import Project
from app.tests.test_base import TestBase, Request
from app.tests.utils_for_tests.EditionGenerator import EditionGenerator
from app.tests.utils_for_tests.SkillGenerator import SkillGenerator
from app.models.edition import Edition
from app.tests.utils_for_tests.StudentGenerator import StudentGenerator
from app.tests.utils_for_tests.ProjectGenerator import ProjectGenerator
from app.models.participation import Participation
from app.tests.utils_for_tests.QuestionTagGenerator import QuestionTagGenerator
from app.models.question_tag import QuestionTag
from app.models.student import Student
from app.models.skill import Skill


class TestParticipations(TestBase):
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

    async def create_participation_in_db(self, edition: Edition) -> List[QuestionTag]:
        question_tag_generator = QuestionTagGenerator(self.session, edition)
        question_tag_generator.generate_question_tags(n=5)
        question_tag_generator.add_to_db()
        await self.session.commit()
        return question_tag_generator.data

    def assert_participation_equal(self, test_data: dict[str, any], participation: Participation):
        participation_dict = participation.dict()
        # compare data
        for key, value in test_data.items():
            self.assertEqual(participation_dict[key], value,
                             (f"{key} of participation did not match.\n"
                              f"Expected: {value}\n"
                              f"Got: {participation_dict[key]}"))

    async def test_post_participation_create(self):
        # prepare data
        edition2022 = await self.create_edition_in_db(2022)
        students = await self.create_students_in_db(edition2022, count=5)
        projects = await self.create_projects_in_db(edition=edition2022, count=1)
        skills = await read_all_where(Skill, session=self.session)

        # Send POST request
        post_body = {
            "student_id": students[0].id,
            "project_id": projects[0].id,
            "skill_name": skills[0].name,
            "reason": str(uuid.uuid1())
        }
        path = "/participations/create"
        await self.do_request(Request.POST, path, self.user_admin.name, access_token=await self.get_access_token(self.user_admin.name), json_body=post_body)

        # verify participation is created in db
        participation_in_db = await read_all_where(Participation, Participation.reason == post_body["reason"], session=self.session)
        self.assertEqual(1, len(participation_in_db))
        self.assert_participation_equal(post_body, participation_in_db[0])

    async def test_delete_participations(self):
        # prepare data
        edition2022 = await self.create_edition_in_db(2022)
        students = await self.create_students_in_db(edition2022, count=5)
        projects = await self.create_projects_in_db(edition=edition2022, count=1)
        skills = await read_all_where(Skill, session=self.session)

        reason = str(uuid.uuid1())

        # create a participation in db
        participation = Participation(student_id=students[0].id, project_id=projects[0].id, skill_name=skills[0].name, reason=reason)
        await update(participation, session=self.session)

        # verify participation is in db
        participation_in_db = await read_all_where(Participation, Participation.reason == reason, session=self.session)
        self.assertEqual(1, len(participation_in_db))

        # Send DELETE request
        path = f"/participations?student_id={students[0].id}&project_id={projects[0].id}"
        await self.do_request(Request.DELETE, path, self.user_admin.name, access_token=await self.get_access_token(self.user_admin.name))

        # verify participation is deleted from db
        participation_in_db = await read_where(Participation, Participation.reason == reason, session=self.session)
        self.assertIsNone(participation_in_db)

    async def test_patch_participations(self):
        # prepare data
        edition2022 = await self.create_edition_in_db(2022)
        students = await self.create_students_in_db(edition2022, count=5)
        projects = await self.create_projects_in_db(edition=edition2022, count=1)
        skills = await read_all_where(Skill, session=self.session)

        reason = str(uuid.uuid1())

        # create a participation in db
        participation = Participation(student_id=students[0].id, project_id=projects[0].id, skill_name=skills[0].name, reason=reason)
        await update(participation, session=self.session)

        # verify participation is in db
        participation_in_db = await read_all_where(Participation, Participation.reason == reason, session=self.session)
        self.assertEqual(1, len(participation_in_db))

        # modify participation
        modified_participation = {
            "student_id": students[0].id,
            "project_id": projects[0].id,
            "skill_name": skills[1].name, # new skill
            "reason": str(uuid.uuid1())   # new reason
        }

        # Send PATCH request
        path = f"/participations?student_id={students[0].id}&project_id={projects[0].id}"
        await self.do_request(Request.PATCH, path, self.user_admin.name, access_token=await self.get_access_token(self.user_admin.name), json_body=modified_participation)

        # verify participation is changed
        participation_in_db = await read_where(Participation, Participation.reason == modified_participation["reason"], session=self.session)
        self.assert_participation_equal(modified_participation, participation_in_db)
