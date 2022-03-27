from random import choice, randrange, sample

from app.database import db
from app.models.answer import Answer
from app.models.edition import Edition
from app.models.participation import Participation
from app.models.project import Partner, Project, RequiredSkills
from app.models.question import Question
from app.models.question_answer import QuestionAnswer
from app.models.skill import Skill
from app.models.student import Student
from app.models.suggestion import Suggestion, SuggestionOption
from app.models.user import User, UserRole
from app.utils.cryptography import get_password_hash
from app.utils.response import response
from fastapi import APIRouter

router = APIRouter(prefix="/ddd")

skills = [Skill(name=skill) for skill in
          ["Front-end developer", "Back-end developer", "UX / UI designer", "Graphic designer",
           "Business Modeller", "Storyteller", "Marketer", "Copywriter", "Video editor",
           "Photographer"]]

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

questions_yes_no = [Question(question=q, field_id="", type="MULTIPLE_CHOICE") for q in
                    ["Will you live in Belgium in July 2022?",
                     "Can you work during the month of July, Monday through Thursday (~09:00 to 17:00)",
                     "Would you like to be called by a different name than your birth name?",
                     "Would you like to add your pronouns?",
                     "Have you participated in osoc before?",
                     "Would you like to be a student coach this year?"]]

answers_yes_no = [[Answer(question_id=question.id, field_id="", answer=yn)
                   for yn in ["yes", "no"]] for question in questions_yes_no]

questions_text = [Question(question=q, field_id="", type="TEXTAREA") for q in
                  ["Are there any responsibilities you might have which could hinder you during the day?",
                   "Tell us a fun fact about yourself.",
                   "How many years does your degree take?",
                   "Which year of your degree are you in?",
                   "What is the name of your college or university?",
                   "Which skill would you list as your best one?"]]

answers_text = [[Answer(question_id=question.id, field_id="", answer=f"text{t}")
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
    questions_multiple_choice.append(Question(question=qa[0], field_id="", type="MULTIPLE_CHOICE"))
    answers_multiple_choice.append(
        [Answer(question_id=questions_multiple_choice[-1].id, field_id="", answer=answer_text)
         for answer_text in qa[1:]])

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
    questions_multiple_choice2.append(Question(question=qa[0], field_id="", type="MULTIPLE_CHOICE"))
    answers_multiple_choice2.append(
        [Answer(question_id=questions_multiple_choice2[-1].id, field_id="", answer=answer_text)
         for answer_text in qa[1:]])


def generate_user(role=UserRole.COACH, active=True, approved=True, disabled=False):
    first_name = choice(first_names)
    last_name = choice(last_names)
    email = choice(emails)
    return User(email=f"{first_name}.{last_name}@{email}".lower(),
                name=f"{first_name} {last_name}",
                password="a",
                role=role,
                active=active,
                approved=approved,
                disabled=disabled)


def generate_student(edition_id):
    first_name = choice(first_names)
    last_name = choice(last_names)
    email = choice(emails)
    random_skills = sample(skills, k=randrange(1, len(skills)))
    return Student(name=f"{first_name} {last_name}",
                   email=f"{first_name}.{last_name}@{email}".lower(),
                   phone_number=f"04{randrange(100):0>2} {randrange(1000):0>3} {randrange(1000):0>3}",
                   nickname=first_name,
                   question_answers=[],
                   skills=[skill.id for skill in random_skills],
                   edition=edition_id)


def generate_suggestions(student, project, unconfirmed=3, confirmed_suggestion=None, admin=None):
    suggestions = [Suggestion(
        decision=choice(list(SuggestionOption)),
        reason="reason x",
        student=student.id,
        suggested_by=choice(project.users),
        project=project.id,
        skill=choice(student.skills),
        definitive=False) for _ in range(unconfirmed)]

    if confirmed_suggestion is not None and admin is not None:
        suggestions.append(Suggestion(
            decision=confirmed_suggestion,
            reason="reason x",
            student=student.id,
            suggested_by=admin.id,
            project=project.id,
            skill=choice(student.skills),
            definitive=True))

    return suggestions


def generate_question_answers():
    qa = [QuestionAnswer(question=questions_yes_no[i].id, answer=choice(answers_yes_no[i]).id)
          for i in range(len(questions_yes_no))]
    qa += [QuestionAnswer(question=questions_text[i].id, answer=choice(answers_text[i]).id)
           for i in range(len(questions_text))]
    qa += [QuestionAnswer(question=questions_multiple_choice[i].id, answer=choice(answers_multiple_choice[i]).id)
           for i in range(len(questions_multiple_choice))]
    for i in range(len(questions_multiple_choice2)):
        qa += [QuestionAnswer(question=questions_multiple_choice2[i].id, answer=answer.id)
               for answer in sample(answers_multiple_choice2[i], k=randrange(1, 3))]
    return qa


@router.get("/", response_description="Data retrieved")
async def add_dummy_data():
    user_admin = User(
        email="user_admin@test.be",
        name="admin",
        password=get_password_hash("Test123!user_admin"),
        role=UserRole.ADMIN,
        active=True, approved=True, disabled=False)

    users = [generate_user(active=False, approved=False, disabled=False),
             generate_user(active=True, approved=False, disabled=False),
             generate_user(active=True, approved=True, disabled=False),
             generate_user(active=True, approved=True, disabled=True)]

    admins = [generate_user(role=UserRole.ADMIN) for _ in range(2)]
    coaches = [generate_user() for _ in range(5)]

    partner = Partner(
        name="UGent",
        about="De C in UGent staat voor communicatie")

    edition = Edition(
        name="2019 Summer Fest",
        year=2019,
        user_ids=[coach.id for coach in coaches])

    project = Project(
        name="Student Volunteer Project",
        goals=["Free", "Real", "Estate"],
        description="Free real estate",
        partner=partner,
        users=[coaches[i].id for i in range(2)],
        required_skills=[RequiredSkills(skill=skill.id, number=randrange(2, 5))
                         for skill in skills],
        edition=edition.id)

    project2 = Project(
        name="Cyberfest",
        goals=["Goal 1", "Goal 2"],
        description="Hackers & Cyborgs",
        partner=partner,
        users=[coaches[i].id for i in range(2, 5)],
        required_skills=[RequiredSkills(skill=skill.id, number=randrange(1, 8))
                         for skill in sample(skills, k=randrange(3, len(skills)))],
        edition=edition.id)

    # generate students without suggestions
    students = [generate_student(edition.id) for _ in range(3)]
    suggestions = []
    participations = []
    for student in students:
        suggestions += generate_suggestions(student, project)

    # generate students with conflicts in suggestions
    for s in SuggestionOption:
        for i in range(2):
            students.append(generate_student(edition.id))
            suggestions += generate_suggestions(students[-1], project, 5, s, choice(admins))
            suggestions += generate_suggestions(students[-1], project2, 5, s, choice(admins))
            suggestions += generate_suggestions(students[-1], project2, 5, s, choice(admins))

    # generate students that participate in a project
    for required_skill in project.required_skills:
        for _ in range(randrange(required_skill.number)):
            students.append(generate_student(edition.id))
            participations.append(Participation(student=students[-1].id, project=project.id,
                                                skill=required_skill.skill))

    question_answers = []

    for student in students:
        generated_question_answers = generate_question_answers()
        question_answers += generated_question_answers
        student.question_answers = [qa.id for qa in generated_question_answers]

    # save models to database
    await db.engine.save(user_admin)
    for user in users:
        await db.engine.save(user)
    for admin in admins:
        await db.engine.save(admin)
    for coach in coaches:
        await db.engine.save(coach)

    for question in questions_yes_no:
        await db.engine.save(question)
    for answers in answers_yes_no:
        for answer in answers:
            await db.engine.save(answer)
    for question in questions_text:
        await db.engine.save(question)
    for answers in answers_text:
        for answer in answers:
            await db.engine.save(answer)
    for question in questions_multiple_choice:
        await db.engine.save(question)
    for answers in answers_multiple_choice:
        for answer in answers:
            await db.engine.save(answer)
    for question in questions_multiple_choice2:
        await db.engine.save(question)
    for answers in answers_multiple_choice2:
        for answer in answers:
            await db.engine.save(answer)

    for question_answer in question_answers:
        await db.engine.save(question_answer)

    for skill in skills:
        await db.engine.save(skill)

    await db.engine.save(edition)
    await db.engine.save(project)
    await db.engine.save(project2)

    for student in students:
        await db.engine.save(student)

    for suggestion in suggestions:
        await db.engine.save(suggestion)

    for participation in participations:
        await db.engine.save(participation)

    return response(None, "Dummy data inserted")
