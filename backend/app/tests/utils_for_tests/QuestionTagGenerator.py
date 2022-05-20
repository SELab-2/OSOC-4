from app.models.question_tag import QuestionTag
from app.tests.utils_for_tests.DataGenerator import DataGenerator


class QuestionTagGenerator(DataGenerator):
    def __init__(self, session):
        super().__init__(session)

    def generate_question_tags(self, year, n=1):
        self.data += [
            QuestionTag(
                edition=year,
                mandatory=False,
                tag=f"tag{i+1}") for i in range(n)
        ]
