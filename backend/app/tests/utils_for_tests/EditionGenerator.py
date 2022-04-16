from datetime import date
from random import randint, sample
from typing import List

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.edition import Edition
from app.tests.utils_for_tests.DataGenerator import DataGenerator


class EditionGenerator(DataGenerator):
    curr_year: int = date.year

    def __init__(self, session: AsyncSession, coaches):
        super().__init__(session)
        self.coaches = coaches

    def generate_n_of_data(self, n: int, **args) -> List[Edition]:
        return [self.generate_data(year) for year in range(2022 - n, self.curr_year + 1)]

    def generate_data(self, year: int = 2022):
        edition: Edition = Edition(
            name=f"{year} Summer Fest",
            year=year,
            coaches=sample(
                self.coaches, randint(2, len(self.coaches))
            ))
        self.data.append(edition)
        return edition
