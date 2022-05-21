import os
import unittest
from datetime import timedelta

from app.utils.keygenerators import generate_random_key, generate_new_invite_key, generate_new_reset_password_key


class TestKeyGenerators(unittest.TestCase):
    def test_generate_random_key(self):
        for i in range(4, 128):
            key: str = generate_random_key(i)

            self.assertTrue(len(key) == i, "Key had unexpected length")
            self.assertTrue(key.isalnum(), "Key is incorrectly formatted")

    def test_generate_new_invite_key(self):
        expire: int = os.getenv('INVITE_EXPIRE')
        self.key_check(generate_new_invite_key, "I", expire)

    def test_generate_new_reset_password_key(self):
        expire: int = os.getenv('PASSWORDRESET_EXPIRE')
        self.key_check(generate_new_reset_password_key, "R", expire)

    def key_check(self, key_gen, key_identifier: str, expire: int):
        """
        Checks correctness of the given key generator

        Args:
            key_gen: The key generator
            key_identifier: The start of the key
            expire: The expiry variable of the key

        Returns:

        """
        key, gotten_expire = key_gen()
        # self.assertEqual does not accept datetime.timedelta
        # TypeError: int() argument must be a string, a bytes-like object or a number, not 'datetime.timedelta'
        self.assertEqual(gotten_expire, timedelta(minutes=int(expire)),
                         f"Expire was '{gotten_expire}' but expected '{expire}'")
        self.assertEqual(key_identifier, key[:len(key_identifier)],
                         f"Key identifier was '{key[:len(key_identifier)]}' but expected '{key_identifier}'.")
        self.assertEqual(21, len(key), f"Key '{key}' had length {len(key)} but expected length of 21.")
