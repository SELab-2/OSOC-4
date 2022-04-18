from typing import List

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.skill import Skill
from app.tests.utils_for_tests.DataGenerator import DataGenerator


class SkillGenerator(DataGenerator):
    skills = ["Front-end developer", "Back-end developer", "UX / UI designer", "Graphic designer",
              "Business Modeller", "Storyteller", "Marketer", "Copywriter", "Video editor",
              "Photographer"]

    def __init__(self, session: AsyncSession):
        super().__init__(session)

    def generate_skills(self) -> List[Skill]:
        skill_objs = [Skill(name=skill) for skill in self.skills]
        self.data.extend(skill_objs)

        return skill_objs
