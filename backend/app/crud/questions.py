from typing import Optional
from app.database import engine
from app.models.question import Question
from odmantic.bson import ObjectId


async def add_question(question: Question) -> Question:
    """add_user this adds a new user to the database

    :param question: the new question to be added
    :type question: Question
    :return: returns the new question
    :rtype: Question
    """
    await engine.save(question)
    return question


async def question_exists(question: Question) -> Optional[Question]:
    """question_exists this checks whether a question exists

    :param question: the answer to check
    :type question: Question
    :return: returns the answer if it exists, else None
    :rtype: Optional[Answer]
    """
    q = await engine.find_one(Question, Question.question == question.question, Question.field_id == question.field_id)
    if q:
        return q
    return None


async def get_question_by_question(question_str: str) -> Optional[Question]:
    """get_question_by_question this function returns the question with the given question string

    :param question_str: the question string of the question object
    :type question_str: str
    :return: The question object with the given question string or None if such a question doesn't exist
    :rtype: Optional[Question]
    """
    q = await engine.find_one(Question, Question.question == question_str)
    if q:
        return q
    return None


async def get_question_by_id(id: ObjectId) -> Optional[Question]:
    """get_question_by_id this function returns the question with the given id

    :param id: the id of the question
    :type id: ObjectId
    :return: The question with the given id or None if such a question doesn't exist
    :rtype: Optional[Question]
    """
    q = await engine.find_one(Question, Question.id == id)
    if q:
        return q
    return None


async def get_question_by_key(key: str) -> Optional[Question]:
    """get_question_by_key this function returns the question with the given key / field_id

    :param key: the key/field_id of the question
    :type key: str
    :return: The question with the given key/field_id or None if such a question doesn't exist
    :rtype: Optional[Question]
    """
    q = await engine.find_one(Question, Question.field_id == key)
    if q:
        return q
    return None
