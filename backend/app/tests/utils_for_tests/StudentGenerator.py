from app.models.student import Student
from app.tests.utils_for_tests.DataGenerator import DataGenerator
from app.tests.utils_for_tests.QuestionAnswerGenerator import QuestionAnswerGenerator


class StudentGenerator(DataGenerator):
    def __init__(self, session, edition):
        super().__init__(session)
        self.edition = edition
        self.question_answer_generator = QuestionAnswerGenerator(session, edition)

    def generate_student(self):
        student = Student(edition=self.edition)
        self.data.append(student)
        self.question_answer_generator.generate_question_answers(student)
        return student

    def generate_students(self, number: int):
        return [self.generate_student() for _ in range(number)]

    def add_to_session(self):
        super().add_to_session()
        self.question_answer_generator.add_to_session()

    async def commit(self):
        await super().commit()
        await self.question_answer_generator.commit()
