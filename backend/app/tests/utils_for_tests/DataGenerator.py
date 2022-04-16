from typing import Any, List

from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import update

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


class DataGenerator:
    def __init__(self, session: AsyncSession):
        self.data: List[Any] = []
        self.session: AsyncSession = session

    def generate_n_of_data(self, n: int, **args) -> List[Any]:
        return [self.generate_data(args) for _ in range(n)]

    def generate_data(self, *args):
        pass

    async def add_to_session(self):
        for d in self.data:
            await update(d, self.session)

        return self
