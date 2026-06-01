import smtplib
import os
from email.mime.text import MIMEText

def send_reset_email(to_email: str, code: str) -> bool:
    """Send password reset email. Returns True if sent, False otherwise."""
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")
    smtp_from = os.getenv("SMTP_FROM", smtp_user)

    if not smtp_host or not smtp_user:
        print(f"[DEV] Password reset code for {to_email}: {code}")
        return False

    msg = MIMEText(f"Your Nexus JEE password reset code is: {code}\n\nThis code expires in 15 minutes.")
    msg["Subject"] = "Nexus JEE - Password Reset"
    msg["From"] = smtp_from
    msg["To"] = to_email

    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        print(f"[DEV] Password reset code for {to_email}: {code}")
        return False
