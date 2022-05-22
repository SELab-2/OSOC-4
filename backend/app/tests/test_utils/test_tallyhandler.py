import json

from app.crud import read_where
from app.models.answer import Answer
from app.models.student import Student
from app.routers.students import get_student
from app.tests.test_base import TestBase
from app.tests.utils_for_tests.EditionGenerator import EditionGenerator
from app.tests.utils_for_tests.QuestionAnswerGenerator import QuestionAnswerGenerator
from app.utils.tallyhandler import get_save_answer, process_tally


class TestTallyHandler(TestBase):
    async def test_get_save_answer(self):
        answer_text = "I have answered the test"

        answer = await get_save_answer(answer_text, self.session)
        self.assertEqual(answer_text, answer.answer)

        db_answer = await read_where(Answer, session=self.session)
        self.assertEqual(db_answer, answer)

        answer = await get_save_answer(answer_text, self.session)
        self.assertEqual(answer_text, answer.answer)

    async def test_process_tally(self):
        # prepare necessary data
        eg = EditionGenerator(self.session)
        edition = eg.generate_edition()
        eg.add_to_db()

        qg = QuestionAnswerGenerator(self.session, edition)
        qg.add_to_db()

        await self.session.commit()

        with open("./app/tests/test_data/tallyform") as f:
            data = json.load(f)

        # test the tally processing
        await process_tally(data, edition.year, self.session)

        # check whether data was actually put in the db
        student = await read_where(Student, session=self.session)
        self.assertIsNotNone(student)

        student_info = await get_student(student.id, session=self.session)

        self.assertEqual("Victor", student_info["mandatory"]["first name"])
        self.assertEqual("Mylle", student_info["mandatory"]["last name"])
        self.assertEqual("victor.mylle@hotmail.com", student_info["mandatory"]["email"])
        self.assertEqual("No, it's my first time participating in osoc", student_info["mandatory"]["alumni"])
