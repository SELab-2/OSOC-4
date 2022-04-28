from typing import Any, List

from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import update_all


class DataGenerator:
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
        self.data: List[Any] = []
        self.session: AsyncSession = session

    def add_to_db(self):
        self.session.add_all(self.data)
