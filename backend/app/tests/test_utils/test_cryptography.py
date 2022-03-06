import unittest
from app.utils.cryptography import get_password_hash


class TestCryptography(unittest.TestCase):

    def test_get_password_hash(self):
        password = "I'm a super safe password"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        self.assertNotEqual(hash1, hash2)
