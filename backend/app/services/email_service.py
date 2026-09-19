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

    Raises a configuration error when Mailtrap is not configured so callers
    cannot report a successful OTP request that never sent an email.
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
        raise RuntimeError("MAILTRAP_API_TOKEN is not configured")

    mail = mt.Mail(
        sender=mt.Address(email=MAILTRAP_SENDER_EMAIL, name=MAILTRAP_SENDER_NAME),
        to=[mt.Address(email=to_email)],
        subject=subject,
        text=text,
        category="Password Reset",
    )
    client = mt.MailtrapClient(token=MAILTRAP_API_TOKEN)
    client.send(mail)
    logger.info("OTP email sent to %s via Mailtrap", to_email)
    return True


def send_login_otp_email(to_email: str, otp_code: str) -> bool:
    """Send the 4-digit Admin login OTP via Mailtrap."""
    subject = "VisPass - Your Admin Login OTP"
    text = (
        "Hello Admin,\n\n"
        "Your VisPass admin login OTP is: "
        f"{otp_code}\n\n"
        "It expires in 10 minutes. Do not share it with anyone.\n\n"
        "- VisPass Support"
    )

    if not MAILTRAP_API_TOKEN:
        raise RuntimeError("MAILTRAP_API_TOKEN is not configured")

    mail = mt.Mail(
        sender=mt.Address(email=MAILTRAP_SENDER_EMAIL, name=MAILTRAP_SENDER_NAME),
        to=[mt.Address(email=to_email)],
        subject=subject,
        text=text,
        category="Admin Login",
    )
    client = mt.MailtrapClient(token=MAILTRAP_API_TOKEN)
    client.send(mail)
    logger.info("Admin login OTP sent to %s via Mailtrap", to_email)
    return True
