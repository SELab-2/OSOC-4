from app.crud import update
from app.database import get_session
from app.models.answer import Answer
from app.models.edition import Edition
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

router = APIRouter(prefix="/dummy")


saved_skills = {}


async def _save_qa(s, q, a, session):
    await update(QuestionAnswer(student=s, question=q, answer=Answer(answer=a)), session)


class StudentsGenerator:
    entries: int = 0

    students = []  # this will be filled in once generate() is called

    names = []
    emails = []
    phonenumbs = []
    first_languages = []
    levels_english = []
    studies = []
    degree_types = []

    def __init__(self):
        self.add_entry("Quinten Vervynck", "vervycnk.quinten@gmail.com", "00320000000001", "Dutch", 4, "Computer Science", "Bachelor")
        self.add_entry("Jeremy Anderson", "jeremy.anderson@hotmail.com", "00320000000002", "English (British)", 4, "Computer Science", "Master")

    def add_entry(self, name, email, pn, fl, le, study, dregree_type):
        self.entries += 1
        self.names.append(name)
        self.emails.append(email)
        self.phonenumbs.append(pn)
        self.first_languages.append(fl)
        self.levels_english.append(le)
        self.studies.append(study)
        self.degree_types.append(dregree_type)

    def find(self, email):
        return self.students[self.emails.index(email)]

    async def generate(self, edition, session):
        # studies, type of degree, level of english, suggestions, de vragen die horen bij practical problems, skills
        # Questions
        question_name = Question(question="What is your name", field_id="", edition=edition.year)
        question_email = Question(question="What is your email", field_id="", edition=edition)
        question_phonenumb = Question(question="What is your phone number", field_id="", edition=edition.year)
        question_first_lang = Question(question="What is your first language", field_id="", edition=edition.year)
        question_level_english = Question(question="What is your level of English", field_id="", edition=edition.year)
        question_studies = Question(question="What do/did you study?", field_id="", edition=edition.year)
        question_type_degree = Question(question="What kind of diploma are you currently going for?", field_id="", edition=edition.year)

        # Mappings: (question, datalist, tag)
        pairs = [(question_name, self.names, "name"),
                 (question_email, self.emails, "email"),
                 (question_phonenumb, self.phonenumbs, "phone number"),
                 (question_first_lang, self.first_languages, "first_languages"),
                 (question_level_english, self.levels_english, "level of english"),
                 (question_studies, self.studies, "studies"),
                 (question_type_degree, self.degree_types, "type of degree")]

        # Store (question, tag) pairs
        for pair in pairs:
            await update(QuestionTag(question=pair[0], edition=edition.year, tag=pair[2], showInList=True), session)

        # Store question, answer) pairs: answer is derived from datalist
        for i in range(self.entries):
            student = Student(edition=edition)
            self.students.append(student)
            await update(student, session)
            for pair in pairs:
                await _save_qa(student, pair[0], pair[1][i], session)


class ProjectsGenerator:
    entries = 0

    projects = []  # this will be filled in once generate() is called

    names = []
    descriptions = []
    goals = []
    partner_names = []
    partner_about = []
    skills = []

    def __init__(self):
        self.add_entry("Cyberfest", "Free real estate", "buy house\nsell house\nbe happy", "UGent",
                       "De C in UGent staat voor communicatie", [(2, "Front-end developer")])

    def add_entry(self, name, descr, goals, pn, pa, sks):
        self.entries += 1
        self.names.append(name)
        self.descriptions.append(descr)
        self.goals.append(goals)
        self.partner_names.append(pn)
        self.partner_about.append(pa)
        self.skills.append(sks)

    def find(self, name):
        return self.projects[self.names.index(name)]

    async def generate(self, edition, session):
        for i in range(self.entries):
            project = Project(edition=edition.year, name=self.names[i], description=self.descriptions[i],
                              goals=self.goals[i],
                              partner_name=self.partner_names[i], partner_description=self.partner_about[i])
            self.projects.append(project)
            await update(project, session)

            # The skills needed for the projectRequiredSkills
            for skill in self.skills[i]:
                if skill[1] not in saved_skills:
                    saved_skills.update({skill[1]: Skill(name=skill[1])})
                    await update(saved_skills.get(skill[1]), session)

            # The ProjectRequiredSkills
            for skill in self.skills[i]:
                await update(ProjectRequiredSkill(number=skill[0], project=project, skill=saved_skills.get(skill[1])), session)


class UsersGenerator:
    entries = 0

    users = []  # this will be filled in once generate() is called

    names = []
    emails = []
    passwords = []
    roles = []
    actives = []
    approveds = []
    disableds = []

    def __init__(self):
        self.add_entry("user_admin", "user_admin@test.be", "Test123!user_admin", 2, True, True, False)

    def add_entry(self, name, email, password, role, active, approved, disabled):
        self.entries += 1
        self.names.append(name)
        self.emails.append(email)
        self.passwords.append(get_password_hash(password))
        self.roles.append(UserRole(role))
        self.actives.append(active)
        self.approveds.append(approved)
        self.disableds.append(disabled)

    def find(self, email):
        return self.users[self.emails.index(email)]

    async def generate(self, edition, session):
        for i in range(self.entries):
            user = User(name=self.names[i], email=self.emails[i], password=self.passwords[i], role=self.roles[i],
                        active=self.actives[i], approved=self.approveds[i], disabled=self.disableds[i],
                        editions=[edition])
            self.users.append(user)
            await update(user, session)


class SuggestionsGenerator:
    entries = 0

    suggestions = []  # this will be filled in once generate() is called

    decisions = []
    reasons = []
    students = []
    suggested_bys = []
    projects = []
    skills = []
    definitives = []

    def __init__(self):
        self.add_entry(2, "very good fit", "vervycnk.quinten@gmail.com", "user_admin@test.be", "Cyberfest", "Front-end developer",
                       True)

    def add_entry(self, decision, reason, student, suggested_by, project, skill, definitive):
        self.entries += 1
        self.decisions.append(SuggestionOption(decision))
        self.reasons.append(reason)
        self.students.append(student)
        self.suggested_bys.append(suggested_by)
        self.projects.append(project)
        self.skills.append(skill)
        self.definitives.append(definitive)

    async def generate(self, edition, students_gen, projects_gen, users_gen, session):

        for i in range(self.entries):
            suggestion = Suggestion(decision=self.decisions[i], reason=self.reasons[i],
                                    student=students_gen.find(self.students[i]),
                                    suggested_by=users_gen.find(self.suggested_bys[i]),
                                    project=projects_gen.find(self.projects[i]),
                                    skill=saved_skills.get(self.skills[i]),
                                    definitive=self.definitives[i])

            self.suggestions.append(suggestion)
            await update(suggestion, session)


async def generate_edition(year: int, session):
    edition = Edition(name=f"{year} dummy edition", year=year, description="Dummy description")
    await update(edition, session)

    usg = UsersGenerator()
    await usg.generate(edition, session)

    stg = StudentsGenerator()
    await stg.generate(edition, session)

    prg = ProjectsGenerator()
    await prg.generate(edition, session)

    sug = SuggestionsGenerator()
    await sug.generate(edition, stg, prg, usg, session)


@router.get("/", response_description="Data inserted")
async def add_dummy_data(session: AsyncSession = Depends(get_session)):
    await generate_edition(year=2022, session=session)
    return response(None, "Dummy data inserted")
