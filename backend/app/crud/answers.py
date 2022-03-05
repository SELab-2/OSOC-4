from typing import List, Optional
from ..database import engine
from ..models.answer import Answer


async def add_answer(answer: Answer) -> Answer:
    a = await engine.save(answer)
    return a


async def answer_exists(answer: Answer) -> Optional[Answer]:
    a = await engine.find_one(Answer, Answer.field_id == answer.field_id, Answer.questionid == answer.questionid, Answer.text == answer.text)
    if a:
        return a
    return None
