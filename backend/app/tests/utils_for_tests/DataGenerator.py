from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession


class DataGenerator:
    """
    A common base for all generators of testdata
    """
    first_names = ["Eva", "Mark", "Jonathan", "Christine", "Sebatian", "Ava",
                   "Blake", "Andrea", "Joanne", "Frank", "Emma", "Ruth", "Leah",
                   "Jacob", "Megan", "Richard", "Piers", "Felicity", "Melanie",
                   "Max", "Maria", "Anne", "Anne", "Charles", "Jacob"]
    last_names = ["Andrews", "Hayes", "Martinez", "Evans", "Pratt", "Vaughan",
                  "Roberts", "Forsyth", "Walker", "Baker", "Avery", "Davidson",
                  "Wilkins", "Morrison", "Ball", "Paige", "Gray", "Marshall",
                  "Langdon", "McLean", "James", "Anderson", "Clark", "Henderson",
                  "Scott"]
    emails = ["gmail.com", "outlook.com", "yahoo.com", "hotmail.com"]

    def __init__(self, session: AsyncSession):
        """
        Initializes the data list and assigns the session to use.

        :param session: The session to use to add the data to the database
        :type session: AsyncSession
        """
        self.data: list[Any] = []
        self.session: AsyncSession = session

    def add_to_db(self) -> None:
        """
        Adds the entirety of the data list to the database. No commit is done.

        :return: None
        """
        self.session.add_all(self.data)
