from app.models.skill import Skill
from app.tests.utils_for_tests.DataGenerator import DataGenerator


class SkillGenerator(DataGenerator):
    """
    The DataGenerator for Skills
    """
    skills = ["Front-end developer", "Back-end developer", "UX / UI designer", "Graphic designer",
              "Business Modeller", "Storyteller", "Marketer", "Copywriter", "Video editor",
              "Photographer"]


    def generate_skills(self) -> list[Skill]:
        """
        Generates an amount of Skills

        :return: The list of alle generated skills
        :rtype: list[Skill]
        """
        skill_objs = [Skill(name=skill) for skill in self.skills]
        self.data.extend(skill_objs)

        return skill_objs
