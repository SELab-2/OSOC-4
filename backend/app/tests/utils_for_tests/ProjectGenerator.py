import uuid
from random import randrange
from app.models.project import Project, ProjectRequiredSkill
from app.tests.utils_for_tests.DataGenerator import DataGenerator


class ProjectGenerator(DataGenerator):
    def __init__(self, session):
        super().__init__(session)

    def generate_default_projects(self, year=2022, skills=None):
        projects = [
            Project(
                edition=year,
                name="Student Volunteer Project",
                description="Innovative open source projects, made by incredibly motivated students, coaches & organisations.",
                partner_name="UGent",
                partner_description="Universiteit Gent"),
            Project(
                edition=year,
                name="Cyberfest",
                description="Hackers & Cyborgs",
                partner_name="HoGent",
                partner_description="Hogeschool Gent")
        ]
        self.data += projects
        return projects

    def generate_project_skills(self, project, skills):
        project_skills = [ProjectRequiredSkill(
            number=randrange(1, 5),
            project=project,
            skill=skill)
            for skill in skills]
        self.data += project_skills
        return project_skills

    def generate_project(self, year=2022):
        project = Project(
            edition=year,
            name=f"project_{str(uuid.uuid1())}",
            description=f"description_{str(uuid.uuid1())}",
            partner_name=f"partner_name_{str(uuid.uuid1())}",
            partner_description=f"partner_description_{str(uuid.uuid1())}"
        )

        self.data.append(project)
        return project

    def generate_projects(self, year=2022, n=1):
        return [self.generate_project(year) for _ in range(n)]
