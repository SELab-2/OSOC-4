from random import randint, sample

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.edition import Edition
from app.tests.utils_for_tests.DataGenerator import DataGenerator


class EditionGenerator(DataGenerator):
    def __init__(self, session: AsyncSession, coaches):
        super().__init__(session)
        self.coaches = coaches

    def generate_data(self):
        year: int = randint(2011, 2022)
        edition: Edition = Edition(
            name=f"{year} Summer Fest",
            year=year,
            coaches=sample(
                self.coaches, randint(2, len(self.coaches))
            ))
        self.data.append(edition)
        return edition
