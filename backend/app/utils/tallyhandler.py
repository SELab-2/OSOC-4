from app.crud.student_forms import add_studentform
from app.models.question_answers import QuestionAnswer
from app.models.student_form import StudentForm
from app.models.question import Question
from app.models.answer import Answer
from app.crud.questions import add_get_question
from app.crud.answers import add_get_answer


async def process_tally(data):
    """Processes a Tally - submitted Tally and returns a dict with fields that can be used to validate the data .

    Args:
        data ([type]): [description]
    """

    studentform = StudentForm(
        email="", phonenumber="", questions=[])

    for field in data["data"]["fields"]:

        # check if question already in database
        q = Question(question=field["label"],
                     field_id=field["key"], type=field["type"])
        question = await add_get_question(q)

        # handle mulitple choice
        if question.type in ["CHECKBOXES", "MULTIPLE_CHOICE"] and "options" in field:
            options = field["options"]

            answers = []

            for option in options:
                a = Answer(questionid=question.id, text=option["text"])

                answer = await add_get_answer(a)

                if field["value"] != None and (option["id"] == field["value"] or option["id"] in field["value"]):
                    answers.append(answer.id)
            studentform.questions.append(QuestionAnswer(
                question=question.id, answer=answers))

        elif question.type == "CHECKBOXES":
            a = Answer(questionid=question.id, text=field["value"])
            answer = await add_get_answer(a)
            studentform.questions.append(QuestionAnswer(
                question=question.id, answer=[answer.id]))

        elif question.type in ["TEXTAREA", "INPUT_TEXT", "INPUT_NUMBER", "INPUT_LINK"] and field["value"] is not None:
            a = Answer(questionid=question.id,
                       text=field["value"])
            answer = await add_get_answer(a)

            studentform.questions.append(QuestionAnswer(
                question=question.id, answer=[answer.id]))

        elif question.type == "INPUT_EMAIL":
            studentform.email = field["value"]

        elif question.type == "INPUT_PHONE_NUMBER":
            studentform.phonenumber = field["value"]

        await add_studentform(studentform)
