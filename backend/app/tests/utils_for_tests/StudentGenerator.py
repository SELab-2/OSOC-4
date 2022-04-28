import random
from random import sample

from app.models.student import DecisionOption, Student
from app.tests.utils_for_tests.DataGenerator import DataGenerator
from app.tests.utils_for_tests.QuestionAnswerGenerator import \
    QuestionAnswerGenerator


class StudentGenerator(DataGenerator):
    def __init__(self, session, edition, skills=[]):
        super().__init__(session)
        self.edition = edition
        self.question_answer_generator = QuestionAnswerGenerator(session, edition)
        self.skills = skills

    def generate_student(self):
        student = Student(edition=self.edition, decision=random.choice(list(DecisionOption)), skills=sample(self.skills, k=2))
        self.data.append(student)
        self.question_answer_generator.generate_question_answers(student)
        return student

    def generate_students(self, number: int):
        return [self.generate_student() for _ in range(number)]

    def add_to_db(self):
        super().add_to_db()
        self.question_answer_generator.add_to_db()
