from sqlalchemy.ext.asyncio import AsyncSession

from app.models.skill import Skill
from app.tests.utils_for_tests.DataGenerator import DataGenerator


class SkillGenerator(DataGenerator):
    """
    The DataGenerator for Skills
    """
    skills = ["Front-end developer", "Back-end developer", "UX / UI designer", "Graphic designer",
              "Business Modeller", "Storyteller", "Marketer", "Copywriter", "Video editor",
              "Photographer"]

    def __init__(self, session: AsyncSession):
        """
        Initializes the data list and assigns the session to use.

        :param session: The session to use to add the data to the database
        :type session: AsyncSession
        """
        super().__init__(session)

    def generate_skills(self) -> list[Skill]:
        """
        Generates an amount of Skills

        :return: The list of alle generated skills
        :rtype: list[Skill]
        """
        skill_objs = [Skill(name=skill) for skill in self.skills]
        self.data.extend(skill_objs)

        return skill_objs
