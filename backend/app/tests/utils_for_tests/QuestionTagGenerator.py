import uuid
from app.models.question_tag import QuestionTag
from app.tests.utils_for_tests.DataGenerator import DataGenerator
from app.models.edition import Edition


class QuestionTagGenerator(DataGenerator):
    def __init__(self, session, edition: Edition):
        super().__init__(session)
        self.edition_year = edition.year

    def generate_default_question_tag(self):
        self.data += [
            QuestionTag(
                edition=self.edition_year,
                tag="studies"),
            QuestionTag(
                edition=self.edition_year,
                tag="type of degree"),
            QuestionTag(
                edition=self.edition_year,
                tag="level of english"),
            QuestionTag(
                edition=self.edition_year,
                tag="first language"),
            QuestionTag(
                edition=self.edition_year,
                tag="phone number"),
            QuestionTag(
                edition=self.edition_year,
                mandatory=True,
                tag="email"),
            QuestionTag(
                edition=self.edition_year,
                mandatory=True,
                tag="last name"),
            QuestionTag(
                edition=self.edition_year,
                mandatory=True,
                tag="first name"),
        ]

    def generate_question_tags(self):
        return self.generate_default_question_tag()

    def add_to_db(self):
        super().add_to_db()
