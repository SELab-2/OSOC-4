""" This module includes the functions used to validate the email and password
"""

import re


def valid_password(password: str) -> bool:
    """valid_password check if the entered password is valid

    :param password: the password
    :type password: str
    :return: if password is valid
    :rtype: bool
    """
    return len(password) > 11


def valid_email(email: str) -> bool:
    """valid_email check if the entered email is valid

    :param email: the email
    :type email: str
    :return: if email is valid
    :rtype: bool
    """
    reg = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    return re.fullmatch(reg, email)
