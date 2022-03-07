import unittest
from app.utils.cryptography import get_password_hash, verify_password


class TestCryptography(unittest.TestCase):
    test_password = "I'm a super safe password"

    def test_get_password_hash(self):
        self.assertNotEqual(self.test_password, get_password_hash(self.test_password),
                            "Password hash was equal to password.")

    def test_password_verification(self):
        self.assertTrue(verify_password(self.test_password, get_password_hash(self.test_password)),
                        "Password was not verified.")

    def test_password_salt(self):
        hash1 = get_password_hash(self.test_password)
        hash2 = get_password_hash(self.test_password)
        self.assertNotEqual(hash1, hash2, "Password hashes were equal.")
