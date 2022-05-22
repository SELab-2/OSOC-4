import random
from random import sample

from app.models.edition import Edition
from app.models.skill import Skill
from app.models.student import DecisionOption, Student
from app.tests.utils_for_tests.DataGenerator import DataGenerator
from app.tests.utils_for_tests.QuestionAnswerGenerator import \
    QuestionAnswerGenerator

from sqlalchemy.ext.asyncio import AsyncSession


class StudentGenerator(DataGenerator):
    """
    The DataGenerator for students.
    Also uses the QuestionAnswerGenerator to generate Questions, Answers, QuestionAnswers and QuestionTags.
    """

    def __init__(self, session: AsyncSession, edition: Edition, skills: list[Skill] = []):
        """
        Initializes the data list and assigns the session, edition and skills to use.

        :param session: The session to use to add the data to the database
        :type session: AsyncSession
        :param edition: The edition for which to generate students
        :type edition: Edition
        :param skills: The skills to sample from
        :type skills: list[Skill]
        """
        super().__init__(session)
        self.edition = edition
        self.question_answer_generator = QuestionAnswerGenerator(session, edition)
        self.skills = skills

    def generate_student(self) -> Student:
        """
        Generate a student and its Answers and QuestionAnswers

        :return: The generated student
        :rtype: Student
        """
        student = Student(edition=self.edition, decision=random.choice(list(DecisionOption)),
                          skills=sample(self.skills, k=2))
        self.data.append(student)
        self.question_answer_generator.generate_question_answers(student)
        return student

    def generate_students(self, number: int) -> list[Student]:
        """
        Generate 'number' students and their Answers and QuestionAnswers

        :return: The generated students
        :rtype: list[Student]
        """
        return [self.generate_student() for _ in range(number)]

    def add_to_db(self):
        """
        Adds the entirety of the data list and the question_answer_generator's data list to the database.
        No commit is done.

        :return: None
        """
        super().add_to_db()
        self.question_answer_generator.add_to_db()
