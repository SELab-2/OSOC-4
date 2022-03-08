from app.crud.student_forms import add_studentform
from app.models.question_answer import QuestionAnswer
from app.models.student_form import StudentForm
from ..models.question import Question
from ..models.answer import Answer
from ..crud.questions import question_exists, add_question
from ..crud.answers import answer_exists, add_answer


async def process_tally(data):
    """Processes a Tally - submitted Tally and returns a dict with fields that can be used to validate the data .

    Args:
        data ([type]): [description]
    """
    # [to implement] get edition by form id
    # form_id = res["data"]["formId"]

    studentform = StudentForm(
        name="", email="", phonenumber="", nickname="", questions=[])

    for field in data["data"]["fields"]:
        if "email" in field["label"].lower() and field["type"] == "INPUT_EMAIL":
            studentform.email = field["value"]
        else:
            # check if question already in database
            q = Question(question=field["label"],
                         field_id=field["key"], type=field["type"])
            question = await question_exists(q)

            if not question:
                question = await add_question(q)

            if question.type == "MULTIPLE_CHOICE":
                options = field["options"]
                for option in options:
                    a = Answer(questionid=question.id,
                               field_id=option["id"], text=option["text"])

                    answer = await answer_exists(a)
                    if not a:
                        answer = await add_answer(a)

                    if option["id"] == field["value"]:
                        studentform.questions.append(QuestionAnswer(
                            question=question.id, answer=answer.id))

            await add_studentform(studentform)
