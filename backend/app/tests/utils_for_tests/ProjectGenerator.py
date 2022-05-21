import uuid
from random import randrange
from app.models.project import Project, ProjectRequiredSkill
from app.models.skill import Skill
from app.tests.utils_for_tests.DataGenerator import DataGenerator


class ProjectGenerator(DataGenerator):
    """
    The DataGenerator for projects
    """
    def generate_default_projects(self, year: int = 2022) -> list[Project]:
        """
        Generates the default projects for testing.

        :param year: The year of the edition the generated projects are in
        :type year: int, Optional
        :return: The generated projects
        :rtype: list[Project]
        """
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

    def generate_project_skills(self, project: Project, skills: list[Skill]) -> list[ProjectRequiredSkill]:
        """
        Generates required skills for a project.

        :param project: The project to generate skills for
        :type project: Project
        :param skills: The list of skills to choose from
        :type skills: list[Skill]
        :return: The generated skills for the project
        :rtype: list[ProjectRequiredSkill]
        """
        project_skills = [ProjectRequiredSkill(
            number=randrange(1, 5),
            project=project,
            skill=skill)
            for skill in skills]
        self.data += project_skills
        return project_skills

    def generate_project(self, year: int = 2022) -> Project:
        """
        Generates a project.

        :param year: The year of the edition the generated project is in
        :type year: int, Optional
        :return: The generated project
        :rtype: Project
        """
        project = Project(
            edition=year,
            name=f"project_{str(uuid.uuid1())}",
            description=f"description_{str(uuid.uuid1())}",
            partner_name=f"partner_name_{str(uuid.uuid1())}",
            partner_description=f"partner_description_{str(uuid.uuid1())}"
        )

        self.data.append(project)
        return project

    def generate_projects(self, year: int = 2022, n: int = 1) -> list[Project]:
        """
        Generates a number of projects.

        :param year: The year of the edition the generated projects are in
        :type year: int, Optional
        :param n: The amount of projects to generate
        :type n: int
        :return: The generated projects
        :rtype: list[Project]
        """
        return [self.generate_project(year) for _ in range(n)]
