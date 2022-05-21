import uuid
from app.crud import read_all_where, read_where, update
from app.tests.test_base import TestBase, Request
from app.tests.utils_for_tests.EditionGenerator import EditionGenerator
from app.tests.utils_for_tests.SkillGenerator import SkillGenerator
from app.tests.utils_for_tests.StudentGenerator import StudentGenerator
from app.tests.utils_for_tests.ProjectGenerator import ProjectGenerator
from app.models.participation import Participation


class TestParticipations(TestBase):
    async def asyncSetUp(self):
        await super().asyncSetUp()

        edition_generator = EditionGenerator(self.session)
        self.edition = edition_generator.generate_edition(2022)
        await update(self.edition, self.session)

        skill_generator = SkillGenerator(self.session)
        self.skills = skill_generator.generate_skills()
        skill_generator.add_to_db()

        student_generator = StudentGenerator(self.session, edition=self.edition, skills=self.skills)
        self.students = student_generator.generate_students(5)
        student_generator.add_to_db()

        project_generator = ProjectGenerator(self.session)
        self.project = project_generator.generate_project(year=self.edition.year)
        project_generator.add_to_db()

        await self.session.commit()

    def assert_participation_equal(self, test_data: dict[str, any], participation: Participation):
        participation_dict = participation.dict()
        # compare data
        for key, value in test_data.items():
            self.assertEqual(participation_dict[key], value,
                             (f"{key} of participation did not match.\n"
                              f"Expected: {value}\n"
                              f"Got: {participation_dict[key]}"))

    async def test_post_participation_create(self):
        # Send POST request
        post_body = {
            "student_id": self.students[0].id,
            "project_id": self.project.id,
            "skill_name": self.skills[0].name,
            "reason": str(uuid.uuid1())
        }
        path = "/participations/create"
        await self.do_request(Request.POST, path, "user_admin", access_token=await self.get_access_token("user_admin"), json_body=post_body)

        # verify participation is created in db
        participation_in_db = await read_all_where(Participation, Participation.reason == post_body["reason"], session=self.session)
        self.assertEqual(1, len(participation_in_db))
        self.assert_participation_equal(post_body, participation_in_db[0])

    async def test_delete_participations(self):
        reason = str(uuid.uuid1())

        # create a participation in db
        participation = Participation(student_id=self.students[0].id, project_id=self.project.id, skill_name=self.skills[0].name, reason=reason)
        await update(participation, session=self.session)

        # verify participation is in db
        participation_in_db = await read_all_where(Participation, Participation.reason == reason, session=self.session)
        self.assertEqual(1, len(participation_in_db))

        # Send DELETE request
        path = f"/participations?student_id={self.students[0].id}&project_id={self.project.id}"
        await self.do_request(Request.DELETE, path, "user_admin", access_token=await self.get_access_token("user_admin"))

        # verify participation is deleted from db
        participation_in_db = await read_where(Participation, Participation.reason == reason, session=self.session)
        self.assertIsNone(participation_in_db)

    async def test_patch_participations(self):
        reason = str(uuid.uuid1())

        # create a participation in db
        participation = Participation(student_id=self.students[0].id, project_id=self.project.id, skill_name=self.skills[0].name, reason=reason)
        await update(participation, session=self.session)

        # verify participation is in db
        participation_in_db = await read_all_where(Participation, Participation.reason == reason, session=self.session)
        self.assertEqual(1, len(participation_in_db))

        # modify participation
        modified_participation = {
            "student_id": self.students[0].id,
            "project_id": self.project.id,
            "skill_name": self.skills[1].name,  # new skill
            "reason": str(uuid.uuid1())   # new reason
        }

        # Send PATCH request
        path = f"/participations?student_id={self.students[0].id}&project_id={self.project.id}"
        await self.do_request(Request.PATCH, path, "user_admin", access_token=await self.get_access_token("user_admin"), json_body=modified_participation)

        # verify participation is changed
        participation_in_db = await read_where(Participation, Participation.reason == modified_participation["reason"], session=self.session)
        self.assert_participation_equal(modified_participation, participation_in_db)
