from typing import List, Optional
from ..database import engine
from ..models.question import Question
from odmantic.bson import ObjectId


async def add_get_question(question: Question) -> Question:
    q = await get_question(question)
    if not q:
        q = await add_question(question)
    return q


async def add_question(question: Question) -> Question:
    await engine.save(question)
    return question


async def get_question(question: Question) -> Question:
    q = await engine.find_one(Question, Question.question == question.question, Question.field_id == question.field_id)
    if q:
        return q
    return None


async def get_question_by_question(question: str) -> Optional[Question]:
    q = await engine.find_one(Question, Question.question == question)
    if q:
        return q
    return None


async def get_question_by_id(id: ObjectId) -> Optional[Question]:
    q = await engine.find_one(Question, Question.id == id)
    if q:
        return q
    return None


async def get_question_by_key(key: str) -> Optional[Question]:
    q = await engine.find_one(Question, Question.field_id == key)
    if q:
        return q
    return None
