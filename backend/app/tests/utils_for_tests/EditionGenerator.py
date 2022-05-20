from random import randint, sample

from app.models.edition import Edition
from app.models.user import User
from app.tests.utils_for_tests.DataGenerator import DataGenerator
from sqlalchemy.ext.asyncio import AsyncSession


class EditionGenerator(DataGenerator):
    """
    The DataGenerator for editions
    """
    def __init__(self, session: AsyncSession):
        super().__init__(session)

    def generate_edition(self, year: int = 2022, coaches: list[User] = []) -> Edition:
        """
        Generates an edition.

        :param year: The year of the edition to be generated
        :type year: int, Optional
        :param coaches: The coaches for the given edition
        :type coaches: list[User], Optional
        :return: The generated edition
        :rtype: Edition
        """
        edition: Edition = Edition(
            name=f"{year} Summer Fest",
            year=year,
            coaches=coaches, read_only=False)
        self.data.append(edition)
        return edition

    def generate_editions(self, number: int, coaches: list[User] = []) -> list[Edition]:
        """
        Generates 'number' editions

        :param number: The amount of editions to generate
        :type number: int
        :param coaches: The coaches of which to sample from for an edition
        :type coaches: list[User]
        :return: A list of editions
        :rtype: list[Edition]
        """
        if len(coaches) == 0:
            return [self.generate_edition(year) for year in range(2022 - number, 2022)]
        return [self.generate_edition(year, sample(coaches, k=randint(1, len(coaches)))) for year in range(2022 - number, 2022)]
