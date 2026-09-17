"""Send the 4-digit forgot-password OTP via Mailtrap (works for every role)."""

import logging

import mailtrap as mt

from app.core.config import (
    MAILTRAP_API_TOKEN,
    MAILTRAP_SENDER_EMAIL,
    MAILTRAP_SENDER_NAME,
)

logger = logging.getLogger(__name__)


def send_otp_email(to_email: str, otp_code: str, role: str) -> bool:
    """Send OTP email through Mailtrap. Returns True on success.

    Falls back to logging the OTP when no API token is configured
    (local dev without Mailtrap), so the flow never hard-crashes.
    """
    subject = "VisPass - Your Password Reset OTP"
    text = (
        f"Hello,\n\n"
        f"Your VisPass account ({role}) requested a password reset.\n"
        f"Your 4-digit OTP is: {otp_code}\n\n"
        f"It expires in 10 minutes. Do not share it with anyone.\n\n"
        f"- VisPass Support"
    )

    if not MAILTRAP_API_TOKEN:
        logger.warning("MAILTRAP_API_TOKEN not set — OTP for %s is %s", to_email, otp_code)
        print(f"[DEV-OTP] {to_email}: {otp_code}")
        return False

    mail = mt.Mail(
        sender=mt.Address(email=MAILTRAP_SENDER_EMAIL, name=MAILTRAP_SENDER_NAME),
        to=[mt.Address(email=to_email)],
        subject=subject,
        text=text,
        category="Password Reset",
    )
    client = mt.MailtrapClient(token=MAILTRAP_API_TOKEN)
    response = client.send(mail)
    print(response)
    logger.info("OTP email sent to %s via Mailtrap", to_email)
    return True
