from random import sample
from typing import List

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.skill import Skill
from app.tests.utils_for_tests.DataGenerator import DataGenerator

skills = ["Front-end developer", "Back-end developer", "UX / UI designer", "Graphic designer",
          "Business Modeller", "Storyteller", "Marketer", "Copywriter", "Video editor",
          "Photographer"]


class SkillGenerator(DataGenerator):
    def __init__(self, session: AsyncSession):
        super().__init__(session)

    def generate_n_of_data(self, n: int = -1, **args) -> List[Skill]:
        if n == -1:
            n = len(skills)

        skill_objs = [Skill(name=skill) for skill in sample(skills, n)]
        self.data.extend(skill_objs)

        return skill_objs

    def generate_data(self):
        return self.generate_n_of_data(1).pop()
