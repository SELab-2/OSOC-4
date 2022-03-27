from odmantic import Model, Field


class Skill(Model):
    name: str = Field(primary_field=True)
