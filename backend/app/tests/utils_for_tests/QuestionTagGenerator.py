from app.models.question_tag import QuestionTag
from app.tests.utils_for_tests.DataGenerator import DataGenerator


class QuestionTagGenerator(DataGenerator):
    """
    The DataGenerator for question tags
    """
    def generate_question_tags(self, year: int, n: int = 1) -> list[QuestionTag]:
        """
        Generates a number of question tags

        :param year: The year of the edition the generated question tags are in
        :type year: int
        :param n: The amount of question tags to generate
        :type n: int
        :return: A list of question tags
        :rtype: list[QuestionTag]
        """
        self.data += [
            QuestionTag(
                edition=year,
                mandatory=False,
                tag=f"tag{i+1}") for i in range(n)
        ]
