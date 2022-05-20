from random import randint, sample
from typing import List

from app.models.edition import Edition
from app.models.user import User
from app.tests.utils_for_tests.DataGenerator import DataGenerator


class EditionGenerator(DataGenerator):
    def generate_edition(self, year: int = 2022, coaches: List[User] = []):
        edition: Edition = Edition(
            name=f"{year} Summer Fest",
            year=year,
            coaches=coaches, read_only=False)
        self.data.append(edition)
        return edition

    def generate_editions(self, number: int, coaches: List[User] = []) -> List[Edition]:
        if len(coaches) == 0:
            return [self.generate_edition(year) for year in range(2022 - number, 2022)]
        return [self.generate_edition(year, sample(coaches, k=randint(1, len(coaches)))) for year in range(2022 - number, 2022)]
