""" This module includes the functions to process the tally forms
"""

from app.crud import read_where, update
from app.models.answer import Answer
from app.models.question import Question
from app.models.question_answer import QuestionAnswer
from app.models.question_tag import QuestionTag
from app.models.skill import Skill, StudentSkill
from app.models.student import Student
from sqlalchemy.ext.asyncio import AsyncSession


async def get_save_answer(answer: str, session: AsyncSession) -> Answer:
    """get_save_answer check if answer exists else save it

    :param answer: the answer string
    :type answer: str
    :param session: session used to perform database actions
    :type session: AsyncSession
    :return: the found or saved answer
    :rtype: Answer
    """

    a = await read_where(Answer, Answer.answer == answer, session=session)
    if not a:
        a = Answer(answer=answer)
        await update(a, session=session)
    return a


async def process_tally(data, edition, session: AsyncSession):
    """Processes a Tally - submitted Tally and returns a dict with fields that can be used to validate the data .

    Args:
        data ([type]): [description]
    """

    student = Student(edition_year=edition)
    await update(student, session=session)

    # get the skills questiontag
    skills_tag = await read_where(QuestionTag, QuestionTag.tag == "skills", QuestionTag.edition == edition, session=session)

    for field in data["data"]["fields"]:

        if "Which role are you applying for that is not in the list above?" == field["label"]:
            field["label"] = "Which role are you applying for?"

        # Check if the question already exists else save it
        # get the question by id
        q = await read_where(Question, Question.field_id == field["key"], Question.edition == edition, session=session)

        # check if the saved question is the same as the one in the form
        if not q:
            # check if a question is saved without the field id => needed when a question created with a questiontag
            q = await read_where(Question, Question.question == field["label"], Question.edition == edition, session=session)
            if q:
                # if so update the field id
                q.field_id = field["key"]
            else:
                q = Question(question=field["label"], field_id=field["key"], edition=edition)
            await update(q, session=session)
        elif q.question != field["label"]:
            q.question = field["label"]
            await update(q, session=session)

        elif field["type"] in ["MULTIPLE_CHOICE", "CHECKBOXES"]:
            q_values = field["value"] if isinstance(field["value"], list) else [field["value"]]
            if "options" in field:
                for option in field["options"]:
                    if option["id"] in q_values and option["text"] != "Other":
                        a = await get_save_answer(option["text"], session)

                        if q.id == skills_tag.question_id:
                            # save the skill for the student
                            skill = await read_where(Skill, Skill.name == option["text"], session=session)
                            print("found skill")
                            if not skill:
                                skill = Skill(name=option["text"])
                                await update(skill, session=session)

                            student_skill = StudentSkill(student_id=student.id, skill_name=skill.name)
                            await update(student_skill, session=session)

                        # save the question answer binding
                        await update(QuestionAnswer(student=student, question=q, answer=a), session=session)

        elif field["type"] in ["TEXTAREA", "INPUT_TEXT", "INPUT_NUMBER", "INPUT_PHONE_NUMBER", "INPUT_EMAIL", "INPUT_LINK", "FILE_UPLOAD"]:
            if field["value"] is not None:
                a = await get_save_answer(str(field["value"]), session)
                await update(QuestionAnswer(student=student, question=q, answer=a), session=session)
