import unittest

from app.utils.mailsender import send_invite


class MyTestCase(unittest.TestCase):
    email_receiver = "Stef.Vandenhaute+SEL2TEST@UGent.be"  # TODO config in config fail

    @unittest.skip('Prevent, email spam')
    def test_send_mail(self):
        send_invite(self.email_receiver, "test")


if __name__ == '__main__':
    unittest.main()
