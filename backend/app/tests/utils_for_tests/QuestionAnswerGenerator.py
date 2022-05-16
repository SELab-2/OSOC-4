from random import choice, randrange, sample

from app.models.answer import Answer
from app.models.question import Question
from app.models.question_answer import QuestionAnswer
from app.models.question_tag import QuestionTag
from app.tests.utils_for_tests.DataGenerator import DataGenerator


class QuestionAnswerGenerator(DataGenerator):
    questionstrings_yes_no = [
        "Will you live in Belgium in July 2022?",
        "Can you work during the month of July, Monday through Thursday (~09:00 to 17:00)",
        "Would you like to be called by a different name than your birth name?",
        "Would you like to add your pronouns?",
    ]

    questionstrings_text = [
        "Are there any responsibilities you might have which could hinder you during the day?",
        "Tell us a fun fact about yourself.",
        "How many years does your degree take?",
        "Which year of your degree are you in?",
        "What is the name of your college or university?",
        "Which skill would you list as your best one?"
    ]

    qa_multiple_choice = [
        ["Are you able to work 128 hours with a student employment agreement, or as a volunteer?",
         "Yes, I can work with a student employee agreement in Belgium",
         "Yes, I can work as a volunteer in Belgium",
         "No, but I would like to join this experience for free",
         "No, I won't be able to work as a student, as a volunteer or for free."],
        ["What is your gender?", "female", "male", "transgender", "rather not say"],
        ["What language are you most fluent in?", "dutch", "english", "french", "german", "other"],
        ["How would you rate your English",
         "1 I can understand form, but it is hard for me to reply.",
         "2 I can have simple conversations.",
         "3 I can express myself, understand people and get a point across.",
         "4 I can have extensive and complicated conversations.",
         "5 I am fluent."],
        ["What kind of diploma are you currently going for?",
         "a professional bachelor", "an academic bachelor", "an associate degree",
         "a master's degree", "doctoral degree", "no diploma, I am self taught", "other"]
    ]

    # multiple choice questions with max 2 answers
    qa_multiple_choice2 = [
        ["What do/did you study?",
         "backend developer", "business management", "communication sciences",
         "computer sciences", "design", "frontend development", "marketing",
         "photography", "videography", "other"],
        ["Which role are you applying for?",
         "Front-end developer", "Back-end developer", "UX / UI designer", "Graphic designer",
         "Business Modeller", "Storyteller", "Marketer", "Copywriter", "Video editor",
         "Photographer", "Other"]]

    def __init__(self, session, edition):
        super().__init__(session)
        self.other_answers = []
        self.question_answers = []
        self.edition = edition

        self.question_first_name = Question(question="What is your first name?", field_id="", edition=edition.year)
        self.question_last_name = Question(question="What is your last name?", field_id="", edition=edition.year)
        self.question_email = Question(question="Your email address", field_id="", edition=edition.year)
        self.question_alumni = Question(question="Have you participated in osoc before?", field_id="",
                                        edition=edition.year)
        self.question_student_coach = Question(question="Would you like to be a student coach this year?", field_id="",
                                               edition=edition.year)
        self.question_phone_number = Question(question="Phone number", field_id="", edition=edition.year)

        self.questions_yes_no = \
            [Question(question=q, field_id="", edition=edition.year) for q in self.questionstrings_yes_no]
        self.answers_yes_no = [Answer(answer=yn) for yn in ["yes", "no"]]

        self.questions_text = \
            [Question(question=q, field_id="", edition=edition.year) for q in self.questionstrings_text]
        self.answers_text = [[Answer(answer=f"text{t}") for t in range(1, 4)] for _ in self.questions_text]

        self.questions_multiple_choice = []
        self.answers_multiple_choice = []

        for qa in self.qa_multiple_choice:
            self.questions_multiple_choice.append(Question(question=qa[0], field_id="", edition=edition.year))
            self.answers_multiple_choice.append([Answer(answer=answer_text) for answer_text in qa[1:]])

        self.questions_multiple_choice2 = []
        self.answers_multiple_choice2 = []

        for qa in self.qa_multiple_choice2:
            self.questions_multiple_choice2.append(Question(question=qa[0], field_id="", edition=edition.year))
            self.answers_multiple_choice2.append([Answer(answer=answer_text) for answer_text in qa[1:]])

        self.question_tags = [QuestionTag(question=self.question_first_name,
                                          edition=self.edition.year, mandatory=True, tag="first name"),
                              QuestionTag(question=self.question_last_name,
                                          edition=self.edition.year, mandatory=True, tag="last name"),
                              QuestionTag(question=self.question_email,
                                          edition=self.edition.year, mandatory=True, tag="email"),
                              QuestionTag(question=self.question_alumni,
                                          edition=self.edition.year, mandatory=True, tag="alumni"),
                              QuestionTag(question=self.question_student_coach,
                                          edition=self.edition.year, mandatory=True, tag="student-coach"),
                              QuestionTag(question=self.question_phone_number,
                                          edition=self.edition.year, tag="phone number"),
                              QuestionTag(question=self.questions_multiple_choice[2],
                                          edition=self.edition.year, tag="first language"),
                              QuestionTag(question=self.questions_multiple_choice[3],
                                          edition=self.edition.year, tag="level of english"),
                              QuestionTag(question=self.questions_multiple_choice2[0],
                                          edition=self.edition.year, tag="studies"),
                              QuestionTag(question=self.questions_multiple_choice[4],
                                          edition=self.edition.year, tag="type of degree")]

        self.data = [self.question_first_name, self.question_last_name, self.question_email, self.question_alumni,
                     self.question_phone_number, self.question_student_coach, *self.questions_yes_no,
                     *self.questions_text, *self.questions_multiple_choice, *self.questions_multiple_choice2,
                     *self.question_tags,
                     *self.answers_yes_no,
                     *(answer for answers in (*self.answers_text, *self.answers_multiple_choice,
                                              *self.answers_multiple_choice2) for answer in answers)]

    def generate_question_answers(self, student):
        first_name = choice(self.first_names)
        last_name = choice(self.last_names)

        answer_first_name = Answer(answer=first_name)
        answer_last_name = Answer(answer=last_name)
        answer_email = Answer(answer=f"{first_name.lower()}.{last_name.lower()}@{choice(self.emails)}")
        answer_phone_number = Answer(answer=f"04{randrange(100):0>2} {randrange(1000):0>3} {randrange(1000):0>3}")

        self.other_answers += [answer_first_name, answer_last_name, answer_email, answer_phone_number]

        qa = [QuestionAnswer(student=student,
                             question=self.question_first_name,
                             answer=answer_first_name),
              QuestionAnswer(student=student,
                             question=self.question_last_name,
                             answer=answer_last_name),
              QuestionAnswer(student=student,
                             question=self.question_email,
                             answer=answer_email),
              QuestionAnswer(student=student,
                             question=self.question_alumni,
                             answer=choice(self.answers_yes_no)),
              QuestionAnswer(student=student,
                             question=self.question_student_coach,
                             answer=choice(self.answers_yes_no)),
              QuestionAnswer(student=student,
                             question=self.question_phone_number,
                             answer=answer_phone_number)]

        qa += [QuestionAnswer(student=student,
                              question=self.questions_yes_no[i],
                              answer=choice(self.answers_yes_no))
               for i in range(len(self.questions_yes_no))]
        qa += [QuestionAnswer(student=student,
                              question=self.questions_text[i],
                              answer=choice(self.answers_text[i]))
               for i in range(len(self.questions_text))]
        qa += [QuestionAnswer(student=student,
                              question=self.questions_multiple_choice[i],
                              answer=choice(self.answers_multiple_choice[i]))
               for i in range(len(self.questions_multiple_choice))]
        for i in range(len(self.questions_multiple_choice2)):
            qa += [QuestionAnswer(student=student,
                                  question=self.questions_multiple_choice2[i],
                                  answer=answer)
                   for answer in sample(self.answers_multiple_choice2[i], k=randrange(1, 3))]

        self.question_answers += qa
        self.data += qa
