from app.crud import read_where, update
from app.models.answer import Answer
from app.models.question import Question
from app.models.question_answer import QuestionAnswer
from app.models.student import Student


async def get_save_answer(answer, session):
    # check if answer exists else save it
    a = await read_where(Answer, Answer.answer == answer, session=session)
    if not a:
        a = Answer(answer=answer)
        await update(a, session=session)
    return a


async def process_tally(data, edition, session):
    """Processes a Tally - submitted Tally and returns a dict with fields that can be used to validate the data .

    Args:
        data ([type]): [description]
    """

    student = Student(edition_year=edition)
    await update(student, session=session)

    for field in data["data"]["fields"]:

        if "Which role are you applying for that is not in the list above?" == field["label"]:
            field["label"] = "Which role are you applying for?"

        # Check if the question already exists else save it
        q = await read_where(Question, Question.question == field["label"], Question.field_id == field["key"], Question.edition == edition, session=session)
        if not q:
            q = Question(question=field["label"], edition=edition)
            await update(q, session=session)

        if field["type"] in ["MULTIPLE_CHOICE", "CHECKBOXES"]:
            q_values = field["value"] if isinstance(field["value"], list) else [field["value"]]
            if "options" in field:
                for option in field["options"]:
                    if option["id"] in q_values and option["text"] != "Other":
                        a = await get_save_answer(option["text"], session)

                        # save the question answer binding
                        await update(QuestionAnswer(student=student, question=q, answer=a), session=session)

        elif field["type"] in ["TEXTAREA", "INPUT_TEXT", "INPUT_NUMBER", "INPUT_PHONE_NUMBER", "INPUT_EMAIL", "INPUT_LINK", "FILE_UPLOAD"]:
            if field["value"] is not None:
                a = await get_save_answer(str(field["value"]), session)
                await update(QuestionAnswer(student=student, question=q, answer=a), session=session)

