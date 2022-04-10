from random import choice, randrange, sample

from app.crud import update
from app.database import get_session
from app.models.answer import Answer
from app.models.edition import Edition
from app.models.participation import Participation
from app.models.project import Project, ProjectRequiredSkill
from app.models.question import Question
from app.models.question_answer import QuestionAnswer
from app.models.question_tag import QuestionTag
from app.models.skill import Skill
from app.models.student import Student
from app.models.suggestion import Suggestion, SuggestionOption
from app.models.user import User, UserRole
from app.utils.cryptography import get_password_hash
from app.utils.response import response
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/ddd")

first_names = ["Eva", "Mark", "Jonathan", "Christine", "Sebatian", "Ava",
               "Blake", "Andrea", "Joanne", "Frank", "Emma", "Ruth", "Leah",
               "Jacob", "Megan", "Richard", "Piers", "Felicity", "Melanie",
               "Max", "Maria", "Anne", "Anne", "Charles", "Jacob"]
last_names = ["Andrews", "Hayes", "Martinez", "Evans", "Pratt", "Vaughan",
              "Roberts", "Forsyth", "Walker", "Baker", "Avery", "Davidson",
              "Wilkins", "Morrison", "Ball", "Paige", "Gray", "Marshall",
              "Langdon", "McLean", "James", "Anderson", "Clark", "Henderson",
              "Scott"]
emails = ["gmail.com", "outlook.com", "yahoo.com", "hotmail.com"]


def generate_user(role=UserRole.COACH, active=True, approved=True, disabled=False):
    first_name = choice(first_names)
    last_name = choice(last_names)
    return(User(email=f"{first_name.lower()}.{last_name.lower()}@{choice(emails)}",
                name=f"{first_name} {last_name}",
                password=get_password_hash("justapassword"),
                role=role,
                active=active,
                approved=approved,
                disabled=disabled))


class QuestionAnswerGenerator:
    question_first_name = Question(question="What is your first name?", field_id="")
    question_last_name = Question(question="What is your last name?", field_id="")
    question_email = Question(question="Phone number", field_id="")
    question_phone_number = Question(question="Your email address", field_id="")

    questions_yes_no = \
        [Question(question=q, field_id="") for q in
         ["Will you live in Belgium in July 2022?",
          "Can you work during the month of July, Monday through Thursday (~09:00 to 17:00)",
          "Would you like to be called by a different name than your birth name?",
          "Would you like to add your pronouns?",
          "Have you participated in osoc before?",
          "Would you like to be a student coach this year?"]]

    answers_yes_no = [[Answer(answer=yn) for yn in ["yes", "no"]]
                      for question in questions_yes_no]

    questions_text = \
        [Question(question=q, field_id="") for q in
         ["Are there any responsibilities you might have which could hinder you during the day?",
          "Tell us a fun fact about yourself.",
          "How many years does your degree take?",
          "Which year of your degree are you in?",
          "What is the name of your college or university?",
          "Which skill would you list as your best one?"]]

    answers_text = [[Answer(answer=f"text{t}")
                    for t in range(1, 4)] for question in questions_text]

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
         "a master's degree", "doctoral degree", "no diploma, I am self taught", "other"]]

    questions_multiple_choice = []
    answers_multiple_choice = []

    for qa in qa_multiple_choice:
        questions_multiple_choice.append(Question(question=qa[0], field_id=""))
        answers_multiple_choice.append(
            [Answer(answer=answer_text) for answer_text in qa[1:]])

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

    questions_multiple_choice2 = []
    answers_multiple_choice2 = []

    for qa in qa_multiple_choice2:
        questions_multiple_choice2.append(Question(question=qa[0], field_id=""))
        answers_multiple_choice2.append(
            [Answer(answer=answer_text) for answer_text in qa[1:]])

    question_tags = []

    def __init__(self, session):
        self.session = session
        self.other_answers = []
        self.question_answers = []

    def generate_question_tags(self, edition):
        self.question_tags = \
            [QuestionTag(question=self.question_first_name,
                         edition=edition.year, tag="first name"),
             QuestionTag(question=self.question_last_name,
                         edition=edition.year, tag="last name"),
             QuestionTag(question=self.question_email,
                         edition=edition.year, tag="email"),
             QuestionTag(question=self.question_phone_number,
                         edition=edition.year, tag="phone number"),
             QuestionTag(question=self.questions_multiple_choice[2],
                         edition=edition.year, tag="first language"),
             QuestionTag(question=self.questions_multiple_choice[3],
                         edition=edition.year, tag="level of english"),
             QuestionTag(question=self.questions_multiple_choice2[0],
                         edition=edition.year, tag="studies"),
             QuestionTag(question=self.questions_multiple_choice[4],
                         edition=edition.year, tag="type of degree")]

    def generate_question_answers(self, student):
        first_name = choice(first_names)
        last_name = choice(last_names)

        answer_first_name = Answer(answer=first_name)
        answer_last_name = Answer(answer=last_name)
        answer_email = Answer(answer=f"{first_name.lower()}.{last_name.lower()}@{choice(emails)}")
        answer_phone_number = Answer(answer=f"04{randrange(100):0>2} {randrange(1000):0>3} {randrange(1000):0>3}")

        self.other_answers += [answer_first_name, answer_last_name,
                               answer_email, answer_phone_number]

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
                             question=self.question_phone_number,
                             answer=answer_phone_number)]

        qa += [QuestionAnswer(student=student,
                              question=self.questions_yes_no[i],
                              answer=choice(self.answers_yes_no[i]))
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

    async def add_to_session(self):
        self.session.add(self.question_first_name)
        self.session.add(self.question_last_name)
        self.session.add(self.question_email)
        self.session.add(self.question_phone_number)
        for answer in self.other_answers:
            self.session.add(answer)

        for question in self.questions_yes_no:
            self.session.add(question)
        for answers in self.answers_yes_no:
            for answer in answers:
                self.session.add(answer)

        for question in self.questions_text:
            self.session.add(question)
        for answers in self.answers_text:
            for answer in answers:
                self.session.add(answer)

        for question in self.questions_multiple_choice:
            self.session.add(question)
        for answers in self.answers_multiple_choice:
            for answer in answers:
                self.session.add(answer)

        for question in self.questions_multiple_choice2:
            self.session.add(question)
        for answers in self.answers_multiple_choice2:
            for answer in answers:
                self.session.add(answer)

        for question_answer in self.question_answers:
            self.session.add(question_answer)

        for question_tag in self.question_tags:
            self.session.add(question_tag)


class StudentGenerator:
    students = []
    edition_years = []

    def __init__(self, session):
        self.session = session
        self.question_answer_generator = QuestionAnswerGenerator(session)

    def generate_student(self, edition):
        if edition.year not in self.edition_years:
            self.edition_years.append(edition.year)
            self.question_answer_generator.generate_question_tags(edition)
        student = Student(edition=edition)
        self.students.append(student)
        self.question_answer_generator.generate_question_answers(student)
        return student

    async def add_to_session(self):
        for student in self.students:
            self.session.add(student)
        await self.question_answer_generator.add_to_session()


def generate_suggestions(student, student_skills, project, coaches, unconfirmed=3, confirmed_suggestion=None, admin=None):
    suggestions = [Suggestion(
        mail_sent=False,
        decision=choice(list(SuggestionOption)),
        reason="reason x",
        student=student,
        suggested_by=choice(coaches),
        project=project,
        skill=choice(student_skills),
        definitive=False) for _ in range(unconfirmed)]

    if confirmed_suggestion is not None and admin is not None:
        suggestions.append(Suggestion(
            mail_sent=True,
            decision=confirmed_suggestion,
            reason="reason x",
            student=student,
            suggested_by=admin,
            project=project,
            skill=choice(student_skills),
            definitive=True))

    return suggestions


@router.get("/", response_description="Data inserted")
async def add_dummy_data(session: AsyncSession = Depends(get_session)):
    user_admin = User(
        email="user_admin@test.be",
        name="admin",
        password=get_password_hash("Test123!user_admin"),
        role=UserRole.ADMIN,
        active=True, approved=True, disabled=False)

    user_coach = User(
        email="user_coach@test.be",
        name="coach",
        password=get_password_hash("Test123!user_coach"),
        role=UserRole.ADMIN,
        active=True, approved=True, disabled=False)

    users = [generate_user(active=False, approved=False, disabled=False),
             generate_user(active=True, approved=False, disabled=False),
             generate_user(active=True, approved=True, disabled=False),
             generate_user(active=True, approved=True, disabled=True)]

    admins = [generate_user(role=UserRole.ADMIN) for _ in range(2)]
    coaches = [generate_user() for _ in range(5)]

    edition = Edition(
        name="2019 Summer Fest",
        year=2019,
        coaches=coaches
    )

    skills = [Skill(name=skill) for skill in
              ["Front-end developer", "Back-end developer", "UX / UI designer", "Graphic designer",
               "Business Modeller", "Storyteller", "Marketer", "Copywriter", "Video editor",
               "Photographer"]]

    project = Project(
        name="Student Volunteer Project",
        goals="Free\nReal\nEstate",
        description="Free real estate",
        partner_name="UGent",
        partner_description="De C in UGent staat voor communicatie",
        coaches=coaches[:2],
        edition=edition.year)

    project1_skills = [ProjectRequiredSkill(
        number=randrange(2, 5),
        project=project,
        skill=skill)
        for skill in skills]

    project2 = Project(
        name="Cyberfest",
        goals="Goal 1\nGoal 2",
        description="Hackers & Cyborgs",
        partner_name="HoGent",
        partner_description="Like UGent but worse",
        coaches=coaches[2:],
        edition=edition.year)
    await update(project, session)

    project2_skills = [ProjectRequiredSkill(
        number=randrange(1, 8),
        project=project2,
        skill=skill)
        for skill in sample(skills, k=randrange(3, len(skills)))]

    student_generator = StudentGenerator(session)
    # generate students without suggestions
    for _ in range(3):
        student_generator.generate_student(edition)

    suggestions = []
    participations = []

    # generate students with conflicts in suggestions
    for s in SuggestionOption:
        for i in range(2):
            student = student_generator.generate_student(edition)
            suggestions += generate_suggestions(student, skills, project, coaches[:2], 5, s, choice(admins))
            suggestions += generate_suggestions(student, skills, project2, coaches[2:], 5, s, choice(admins))
            suggestions += generate_suggestions(student, skills, project2, coaches[2:], 5, s, choice(admins))

    # generate students that participate in a project
    for required_skill in project1_skills:
        for _ in range(randrange(required_skill.number)):
            student = student_generator.generate_student(edition)
            participations.append(Participation(student=student, project=project,
                                                skill=required_skill.skill))

    # save models to database
    session.add(user_admin)
    session.add(user_coach)

    for user in users:
        session.add(user)
    for admin in admins:
        session.add(admin)
    for coach in coaches:
        session.add(coach)

    for skill in skills:
        session.add(skill)

    session.add(edition)

    session.add(project)
    session.add(project2)

    for skill in project1_skills:
        session.add(skill)
    for skill in project2_skills:
        session.add(skill)

    await student_generator.add_to_session()

    for suggestion in suggestions:
        session.add(suggestion)

    for participation in participations:
        session.add(participation)

    await session.commit()

    return response(None, "Dummy data inserted")
