from app.models.student import Student
from app.tests.utils_for_tests.DataGenerator import DataGenerator
from app.tests.utils_for_tests.QuestionAnswerGenerator import QuestionAnswerGenerator


class StudentGenerator(DataGenerator):
    edition_years = []

    def __init__(self, session, edition):
        super().__init__(session)
        self.edition = edition
        self.question_answer_generator = QuestionAnswerGenerator(session, edition)

    def generate_data(self):
        if self.edition.year not in self.edition_years:
            self.edition_years.append(self.edition.year)
            self.question_answer_generator.generate_question_tags()
        student = Student(edition=self.edition)
        self.data.append(student)
        self.question_answer_generator.generate_question_answers(student)
        return student

    async def add_to_session(self):
        await super().add_to_session()
        await self.question_answer_generator.add_to_session()
