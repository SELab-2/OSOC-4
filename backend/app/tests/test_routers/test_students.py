import random
import unittest

from app.crud import read_all_where, clear_data, read_where
from app.models.edition import Edition
from app.models.skill import Skill
from app.tests.test_base import TestBase
from app.tests.utils_for_tests.EditionGenerator import EditionGenerator
from app.tests.utils_for_tests.SkillGenerator import SkillGenerator
from app.tests.utils_for_tests.StudentGenerator import StudentGenerator


class TestStudents(TestBase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    async def asyncSetUp(self) -> None:
        await super().asyncSetUp()
        await clear_data(self.session)

        eg = EditionGenerator(self.session)
        eg.generate_edition()
        eg.add_to_db()
        await self.session.commit()

        skill_generator = SkillGenerator(self.session)
        skill_generator.generate_skills()
        skill_generator.add_to_db()
        await self.session.commit()

        skills = await read_all_where(Skill, session=self.session)
        edition = await read_where(Edition, session=self.session)

        sg = StudentGenerator(self.session, edition, skills)
        sg.generate_students(len(self.users))
        sg.add_to_db()
        await self.session.commit()

    @unittest.skip("Not yet implemented.")
    async def test_update_student(self):
        pass
