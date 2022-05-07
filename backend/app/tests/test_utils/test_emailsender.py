import os
import unittest

from app.utils.mailsender import send_invite, send_password_reset


class TestMailsender(unittest.TestCase):
    email_receiver = os.getenv("TEST_EMAIL")

    def test_send_mail(self):
        send_invite(self.email_receiver, "test_invite_key")
        send_password_reset(self.email_receiver, "test_reset_key")
        # todo find a way to confirm reception
