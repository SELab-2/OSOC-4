import uuid
from app.models.project import Project
from app.tests.utils_for_tests.DataGenerator import DataGenerator


class ProjectGenerator(DataGenerator):
    def __init__(self, session, edition_year: int):
        super().__init__(session)
        self.edition_year = edition_year

    def generate_default_projects(self):
        self.data += [
            Project(
                edition=self.edition_year,
                name="Student Volunteer Project",
                description="Innovative open source projects, made by incredibly motivated students, coaches & organisations.",
                partner_name="UGent",
                partner_description="Universiteit Gent"),
            Project(
                edition=self.edition_year,
                name="Cyberfest",
                description="Hackers & Cyborgs",
                partner_name="HoGent",
                partner_description="Hogeschool Gent")
        ]

    def generate_project(self):
        project = Project(
            edition=self.edition_year,
            name=f"project_{str(uuid.uuid1())}",
            description=f"description_{str(uuid.uuid1())}",
            partner_name=f"partner_name_{str(uuid.uuid1())}",
            partner_description=f"partner_description_{str(uuid.uuid1())}"
        )

        self.data.append(project)
        return project

    def generate_projects(self, n=1):
        return [self.generate_project() for _ in range(n)]
