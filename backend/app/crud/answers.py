from typing import List, Optional
from ..database import engine
from ..models.answer import Answer


async def add_get_answer(answer: Answer) -> Answer:
    a = await get_answer(answer)
    if not a:
        a = await add_answer(answer)
    return a


async def add_answer(answer: Answer) -> Answer:
    a = await engine.save(answer)
    return a


async def get_answer(answer: Answer) -> Optional[Answer]:
    a = await engine.find_one(Answer, Answer.questionid == answer.questionid, Answer.text == answer.text)
    if a:
        return a
    return None
