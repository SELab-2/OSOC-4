from typing import Optional

from app.database import db
from app.models.answer import Answer


async def add_answer(answer: Answer) -> Answer:
    """add_answer this adds a new answer to the database

    :param answer: the new answer to add
    :type answer: Answer
    :return: returns the new user
    :rtype: User
    """
    a = await db.engine.save(answer)
    return a


async def answer_exists(answer: Answer) -> Optional[Answer]:
    """answer_exists this checks whether an answer exists

    :param answer: the answer to check
    :type answer: Answer
    :return: returns the answer if it exists, else None
    :rtype: Optional[Answer]
    """
    a = await db.engine.find_one(Answer, Answer.field_id == answer.field_id, Answer.question_id == answer.question_id, Answer.text == answer.text)
    if a:
        return a
    return None
