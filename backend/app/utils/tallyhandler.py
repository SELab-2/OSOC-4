from app.crud import read_where, update
from app.models.answer import Answer
from app.models.question import Question
from app.models.question_answer import QuestionAnswer
from app.models.student import Student


async def process_tally(data):
    """Processes a Tally - submitted Tally and returns a dict with fields that can be used to validate the data .

    Args:
        data ([type]): [description]
    """
    # [to implement] get edition by form id
    # form_id = res["data"]["formId"]

    studentform: Student = Student(
        name="", email="", phonenumber="", nickname="", questions=[])

    for field in data["data"]["fields"]:
        if "email" in field["label"].lower() and field["type"] == "INPUT_EMAIL":
            studentform.email = field["value"]
        else:
            # check if question already in database
            q: Question = Question(question=field["label"],
                                   field_id=field["key"], type=field["type"])
            question = await read_where(Question, Question.id == q.id)

            if not question:
                question = await update(q)

            if question.type == "MULTIPLE_CHOICE":
                options = field["options"]
                for option in options:
                    a: Answer = Answer(questionid=question.id,
                                       field_id=option["id"], text=option["text"])

                    answer = await read_where(Answer, Answer.id == a.id)
                    if not a:
                        answer = await update(a)

                    if option["id"] == field["value"]:
                        studentform.question_answers.append(QuestionAnswer(
                            question=question.id, answer=answer.id))

            await update(studentform)
