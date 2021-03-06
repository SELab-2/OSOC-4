import unittest

from app.utils.validators import valid_password, valid_email


class TestValidators(unittest.TestCase):
    def test_valid_email(self):
        valid_emails = ["test@test.test", "test+test@test.test", "test+test@test.test.test",
                        "test.test+test@test.test.test", "test123@t20e5s19t20.test"]
        invalid_emails = ["test.test@test"]

        valid_map = [valid_email(email) for email in valid_emails]
        invalid_map = [not valid_email(email) for email in invalid_emails]

        self.assertTrue(all(valid_map), "A valid email was tagged invalid")
        self.assertTrue(all(invalid_map), "An invalid email was tagged valid")

    def test_valid_password(self):
        valid_passwords = ["ValidPass?!123"]
        invalid_passwords = ["", "abce"]

        valid_map = [valid_password(passw) for passw in valid_passwords]
        invalid_map = [not valid_password(passw) for passw in invalid_passwords]

        self.assertTrue(all(valid_map), "A valid password was tagged invalid")
        self.assertTrue(all(invalid_map), "An invalid password was tagged valid")
