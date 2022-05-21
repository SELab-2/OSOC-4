""" This module includes the QuestionAnswer model
"""

from typing import Optional

from sqlmodel import Field, Relationship, SQLModel


class QuestionAnswer(SQLModel, table=True):
    """represents a QuestionAnswer in the database
        a question-answer is a relationship between a question and an answer
    """
    student_id: int = Field(foreign_key="student.id", primary_key=True)
    question_id: int = Field(foreign_key="question.id", primary_key=True)
    answer_id: Optional[int] = Field(foreign_key="answer.id", primary_key=True)
    volgnummer: int = 0

    student: "Student" = Relationship(back_populates="question_answers")
    question: "Question" = Relationship(back_populates="question_answers")
    answer: "Answer" = Relationship(back_populates="question_answers")
