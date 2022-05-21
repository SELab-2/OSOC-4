import uuid
from app.crud import read_all_where, read_where, update
from app.tests.test_base import TestBase, Request, Status
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

        self.participation_data = {
            "student_id": self.students[0].id,
            "project_id": self.project.id,
            "skill_name": self.skills[0].name,
            "reason": str(uuid.uuid1())
        }

    def assert_participation_equal(self, test_data: dict[str, any], participation: Participation):
        """Assert that the data in the given participation matches the test data

        :param test_data: dictionary containing the test data
        :type test_data: dict[str, any]
        :param participation: the participation to compare
        :type participation: Participation
        """
        participation_dict = participation.dict()
        # compare data
        for key, value in test_data.items():
            self.assertEqual(participation_dict[key], value,
                             (f"{key} of participation did not match.\n"
                              f"Expected: {value}\n"
                              f"Got: {participation_dict[key]}"))

    async def test_post_participation_create(self):
        """Test POST /participations/create"""
        path = "/participations/create"
        await self.do_request(Request.POST, path, "user_admin", access_token=await self.get_access_token("user_admin"), json_body=self.participation_data)

        # verify participation is created in db
        db_participations = await read_all_where(Participation, Participation.student_id == self.participation_data["student_id"], Participation.project_id == self.participation_data["project_id"], session=self.session)
        self.assertEqual(1, len(db_participations))
        self.assert_participation_equal(self.participation_data, db_participations[0])

    async def test_participation_create_invalid_student(self):
        """Test POST /participations/create with invalid student id"""

        self.participation_data.update({
            "student_id": 0
        })
        path = "/participations/create"

        await self.do_request(Request.POST, path, "user_admin", expected_status=Status.CONFLICT, access_token=await self.get_access_token("user_admin"), json_body=self.participation_data)

    async def test_participation_create_invalid_project(self):
        """Test POST /participations/create with invalid project id"""

        self.participation_data.update({
            "project_id": 0
        })
        path = "/participations/create"

        await self.do_request(Request.POST, path, "user_admin", expected_status=Status.CONFLICT, access_token=await self.get_access_token("user_admin"), json_body=self.participation_data)

    async def test_participation_create_year_mismatch(self):
        """Test POST /participations/create with invalid project id"""

    async def test_delete_participations(self):
        """Test DELETE /participations"""
        # create a participation in db
        participation = Participation(**self.participation_data)
        await update(participation, session=self.session)

        # Send DELETE request
        path = f"/participations?student_id={self.students[0].id}&project_id={self.project.id}"
        await self.do_request(Request.DELETE, path, "user_admin", access_token=await self.get_access_token("user_admin"))

        # verify participation is deleted from db
        db_participations = await read_all_where(Participation, Participation.student_id == participation.student_id, Participation.project_id == participation.project_id, session=self.session)
        self.assertEqual(0, len(db_participations))

    async def test_patch_participations(self):
        """Test PATCH /participations"""
        # create a participation in db
        participation = Participation(**self.participation_data)
        await update(participation, session=self.session)

        # modify participation
        self.participation_data.update({
            "skill_name": self.skills[1].name,  # new skill
            "reason": str(uuid.uuid1())   # new reason
        })

        # Send PATCH request
        path = f"/participations?student_id={self.students[0].id}&project_id={self.project.id}"
        await self.do_request(Request.PATCH, path, "user_admin", access_token=await self.get_access_token("user_admin"), json_body=self.participation_data)

        # verify participation is changed
        db_participation = await read_where(Participation, Participation.student_id == self.participation_data["student_id"], Participation.project_id == self.participation_data["project_id"], session=self.session)
        self.assert_participation_equal(self.participation_data, db_participation)
