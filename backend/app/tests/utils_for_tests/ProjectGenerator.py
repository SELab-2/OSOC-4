import uuid
from app.models.project import Project
from app.tests.utils_for_tests.DataGenerator import DataGenerator
from app.models.edition import Edition


class ProjectGenerator(DataGenerator):
    def __init__(self, session, edition_year:int):
        super().__init__(session)
        self.edition_year = edition_year

    def generate_default_projects(self):
        self.data += [
            Project(
                edition = self.edition_year,
                name = "Student Volunteer Project",
                description = "Free real estate",
                partner_name = "UGent",
                partner_description= "De C in UGent staat voor communicatie"),
            Project(
                edition = self.edition_year,
                name = "Student Volunteer Project 2",
                description = "Free real estate 2",
                partner_name = "UGent 2",
                partner_description= "De C in UGent staat voor communicatie 2"),
        ]


    def generate_project(self):

        project = Project(
            edition=self.edition_year,
            name = f"project_{str(uuid.uuid1())}",
            description = f"description_{str(uuid.uuid1())}",
            partner_name = f"partner_name_{str(uuid.uuid1())}",
            partner_description= f"partner_description_{str(uuid.uuid1())}",
        )

        self.data.append(project)
        return project

    def generate_projects(self, n=1):
        return [self.generate_project() for _ in range(n)]

    def add_to_db(self):
        super().add_to_db()
