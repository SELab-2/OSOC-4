from typing import Any

from app.crud import read_where
from app.models.student import Student, DecisionOption
from app.tests.test_base import TestBase, Request, Status
from app.tests.utils_for_tests.EditionGenerator import EditionGenerator
from app.tests.utils_for_tests.SkillGenerator import SkillGenerator
from app.tests.utils_for_tests.StudentGenerator import StudentGenerator


class TestStudents(TestBase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    async def asyncSetUp(self) -> None:
        await super().asyncSetUp()

        eg = EditionGenerator(self.session)
        eg.generate_edition()
        eg.add_to_db()

        skillg = SkillGenerator(self.session)
        skillg.generate_skills()
        skillg.add_to_db()

        studg = StudentGenerator(self.session, eg.data[0], skillg.data)
        studg.generate_students(len(self.users))
        studg.add_to_db()

        await self.session.commit()

    async def test_update_student(self):
        path = "/students/"
        body: dict[str, Any] = {"decision": DecisionOption.MAYBE, "email_sent": True}

        # Bad request with bad id
        await self.do_request(Request.PATCH, f"{path}{self.bad_id}", "user_admin",
                              expected_status=Status.NOT_FOUND, json_body=body)

        # find a random editable student in the testdata
        student: Student = await read_where(Student, session=self.session)
        # change body if necessary
        body["email_sent"] = not student.email_sent
        if student.decision == body["decision"]:
            body["decision"] = DecisionOption.YES

        student_id: int = student.id

        # Bad request with bad access right
        await self.do_request(Request.PATCH, f"{path}{student_id}", "user_approved_coach",
                              expected_status=Status.FORBIDDEN, json_body=body)
        # assert student wasn't changed
        student = await read_where(Student, Student.id == student_id, session=self.session)
        self.assertTrue(student.email_sent != body["email_sent"] and student.decision != body["decision"],
                        "A student was updated by user_approved_coach.")

        # good request
        await self.do_request(Request.PATCH, f"{path}{student_id}", "user_admin",
                              expected_status=Status.SUCCESS, json_body=body)
        # assert student was updated
        student = await read_where(Student, Student.id == student_id, session=self.session)
        self.assertTrue(student.email_sent == body["email_sent"] and student.decision == body["decision"],
                        "A student was updated by user_approved_coach.")
