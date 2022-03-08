from app.database import engine
from app.models.student_form import StudentForm


async def add_studentform(student_form: StudentForm) -> StudentForm:
    """add_studentform this adds a new studentform to the database

    :param user_data: user data to create a new user
    :type user_data: dict
    :return: returns the new user
    :rtype: User
    """
    await engine.save(student_form)
    return student_form
