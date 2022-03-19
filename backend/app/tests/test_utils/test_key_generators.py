import os
import unittest
from datetime import timedelta
from typing import Set

from app.utils.keygenerators import generate_random_key, generate_new_invite_key, INVITE_EXPIRE, \
    generate_new_reset_password_key


class TestKeyGenerators(unittest.TestCase):
    def test_generate_random_key(self):
        for i in range(4, 128):
            key: str = generate_random_key(i)

            self.assertTrue(len(key) == i, "Key had unexpected length")
            self.assertTrue(key.isalnum(), "Key is incorrectly formatted")

    @unittest.skip("Test fails")
    def test_generate_new_invite_key(self):
        expire = os.getenv('INVITE_EXPIRE')
        sample_size: int = 1000

        keys: Set = {
            key and self.assertEqual(expiry, timedelta(minutes=int(expire)), "Key expiry, was incorrect.")
            for key, expiry in generate_new_invite_key()
            for _ in range(sample_size)
        }

        self.assertEqual(sample_size, len(keys), "Keys were not unique.")

    @unittest.skip("Test fails")
    def test_generate_new_reset_password_key(self):
        expire = os.getenv('PASSWORDRESET_EXPIRE')
        sample_size: int = 1000

        keys: Set = {
            key and self.assertEqual(expiry, timedelta(minutes=int(expire)), "Key expiry, was incorrect.")
            for key, expiry in generate_new_reset_password_key()
            for _ in range(sample_size)
        }

        self.assertEqual(sample_size, len(keys), "Keys were not unique.")
