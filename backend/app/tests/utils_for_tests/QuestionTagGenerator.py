from app.models.question_tag import QuestionTag
from app.tests.utils_for_tests.DataGenerator import DataGenerator
from app.models.edition import Edition


class QuestionTagGenerator(DataGenerator):
    def __init__(self, session, edition: Edition):
        super().__init__(session)
        self.edition_year = edition.year

    def generate_question_tags(self, n=1):
        self.data += [
            QuestionTag(
                edition=self.edition_year,
                mandatory=False,
                tag=f"tag{i+1}") for i in range(n)
        ]

        self.data += [
            QuestionTag(
                edition=self.edition_year,
                mandatory=True,
                tag=f"mandatory_tag{i+1}") for i in range(n)
        ]
