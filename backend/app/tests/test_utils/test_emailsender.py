import os
import unittest

from app.crud import read_where
from app.models.student import Student
from app.tests.test_base import TestBase
from app.tests.utils_for_tests.EditionGenerator import EditionGenerator
from app.tests.utils_for_tests.SkillGenerator import SkillGenerator
from app.tests.utils_for_tests.StudentGenerator import StudentGenerator
from app.utils.mailsender import send_invite, send_password_reset, send_email, send_decision_template_email


@unittest.skip("Do not overload the email system.")
class TestMailsender(TestBase):
    # todo find a way to confirm reception
    email_receiver = os.getenv("TEST_EMAIL")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    async def asyncSetUp(self):
        await super().asyncSetUp()

        eg = EditionGenerator(self.session)
        eg.generate_edition()
        eg.add_to_db()

        skillg = SkillGenerator(self.session)
        skillg.generate_skills()
        skillg.add_to_db()

        studg = StudentGenerator(self.session, eg.data[0], skillg.data)
        studg.generate_student()

        # replace student's mailadress to the test mailadress
        studg.question_answer_generator.question_email.question_answers[0].answer.answer = self.email_receiver

        studg.add_to_db()

        await self.session.commit()

    def test_send_password_reset(self):
        send_password_reset(self.email_receiver, "test_reset_key")

    def test_send_invite(self):
        send_invite(self.email_receiver, "test_invite_key")

    async def test_send_decision_template_email(self):
        user = await self.get_user_by_name("user_admin")
        student = await read_where(Student, session=self.session)

        # test could be expanded
        await send_decision_template_email(student, str(user.id), self.session)

    async def test_send_mail(self):
        user = await self.get_user_by_name("user_admin")
        student = await read_where(Student, session=self.session)
        await send_email("a test mail", "Hello, this is a test", student, str(user.id), self.session)
