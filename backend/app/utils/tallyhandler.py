from app.crud import update, read_by_key_value
from app.models.question_answer import QuestionAnswer
from app.models.student_form import StudentForm
from app.models.question import Question
from app.models.answer import Answer


async def process_tally(data):
    """Processes a Tally - submitted Tally and returns a dict with fields that can be used to validate the data .

    Args:
        data ([type]): [description]
    """
    # [to implement] get edition by form id
    # form_id = res["data"]["formId"]

    studentform: StudentForm = StudentForm(
        name="", email="", phonenumber="", nickname="", questions=[])

    for field in data["data"]["fields"]:
        if "email" in field["label"].lower() and field["type"] == "INPUT_EMAIL":
            studentform.email = field["value"]
        else:
            # check if question already in database
            q: Question = Question(question=field["label"],
                                   field_id=field["key"], type=field["type"])
            question = await read_by_key_value(Question, Question.id, q.id)

            if not question:
                question = await update(q)

            if question.type == "MULTIPLE_CHOICE":
                options = field["options"]
                for option in options:
                    a: Answer = Answer(questionid=question.id,
                                       field_id=option["id"], text=option["text"])

                    answer = await read_by_key_value(Answer, Answer.id, a.id)
                    if not a:
                        answer = await update(a)

                    if option["id"] == field["value"]:
                        studentform.questions.append(QuestionAnswer(
                            question=question.id, answer=answer.id))

            await update(studentform)
