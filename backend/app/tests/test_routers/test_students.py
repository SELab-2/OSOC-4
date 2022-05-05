from typing import Any

from app.crud import read_where
from app.models.student import Student, DecisionOption
from app.models.user import UserRole
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

    async def test_get_student(self):
        path = "/students/"
        allowed_users = await self.get_users_by([UserRole.ADMIN, UserRole.COACH])

        # Request with bad id
        await self.do_request(Request.GET, f"{path}{self.bad_id}", "user_admin",
                              expected_status=Status.NOT_FOUND)

        # find a random student in the testdata
        student: Student = await read_where(Student, session=self.session)
        student_id: int = student.id

        # Access tests + good requests
        responses = await self.auth_access_request_test(Request.GET, f"{path}{student_id}",
                                                        allowed_users=allowed_users)
        # Assert the responses match and are not empty. TODO find a better way to assert the responses.
        for user_title, response in responses.items():
            # checking other data is difficult enough that it would need its own tests
            self.assertEqual(response.json()["id_int"], student_id)
            self.assertEqual(response.json()["decision"], student.decision)

    async def test_get_student_questionanswers(self):
        path = "/students/{}/question-answers"
        allowed_users = await self.get_users_by([UserRole.ADMIN, UserRole.COACH])

        # Request with bad id
        response = await self.do_request(Request.GET, path.format(self.bad_id), "user_admin",
                                         expected_status=Status.SUCCESS)
        # assert is empty
        self.assertTrue(response.json() == [],
                        "'get_student_questionanswers' returned a non empty list for a student that doesn't exist.")

        # find a random editable student in the testdata
        student: Student = await read_where(Student, session=self.session)

        # Access tests + good requests
        responses = await self.auth_access_request_test(Request.GET, path.format(student.id),
                                                        allowed_users=allowed_users)
        # Assert the responses match and are not empty. TODO find a better way to assert the responses.
        self.assertTrue(len(responses["user_admin"].json()) >= 1)
        for user_title, response in responses.items():
            self.assertEqual(responses["user_admin"].json(), response.json(),
                             f"The response of {user_title} did not match that of admin.")

    async def test_update_student(self):
        path = "/students/"
        body: dict[str, Any] = {"decision": DecisionOption.MAYBE}

        # Bad request with bad id
        await self.do_request(Request.PATCH, f"{path}{self.bad_id}", "user_admin",
                              expected_status=Status.NOT_FOUND, json_body=body)

        # find a random editable student in the testdata
        student: Student = await read_where(Student, session=self.session)
        # change body if necessary
        if student.decision == body["decision"]:
            body["decision"] = DecisionOption.YES

        student_id: int = student.id

        # Bad request with bad access right
        await self.do_request(Request.PATCH, f"{path}{student_id}", "user_approved_coach",
                              expected_status=Status.FORBIDDEN, json_body=body)
        # assert student wasn't changed
        student = await read_where(Student, Student.id == student_id, session=self.session)
        self.assertTrue(student.decision != body["decision"], "A student was updated by user_approved_coach.")

        # good request
        await self.do_request(Request.PATCH, f"{path}{student_id}", "user_admin",
                              expected_status=Status.SUCCESS, json_body=body)
        # assert student was updated
        student = await read_where(Student, Student.id == student_id, session=self.session)
        self.assertTrue(student.decision == body["decision"], "The student was not updated by user_admin.")
