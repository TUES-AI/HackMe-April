import os

import yagmail


def send_email(to_email: str, subject: str, body: str) -> None:
    sender = os.environ.get("TEACHER_EMAIL")
    password = os.environ.get("TEACHER_PASSWORD")
    host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    port = int(os.environ.get("SMTP_PORT", "587"))
    smtp_ssl = os.environ.get("SMTP_SSL", "false").lower() in ("true", "1", "yes")
    smtp_starttls = os.environ.get("SMTP_STARTTLS", "true").lower() in ("true", "1", "yes")
    if smtp_ssl:
        smtp_starttls = False
    dev_mode = os.environ.get("EMAIL_DEV_MODE", "false").lower() in ("true", "1", "yes")

    if not sender or not password:
        raise RuntimeError("Email credentials not configured in environment.")

    if dev_mode:
        print(f"\n{'=' * 60}")
        print("DEV MODE - Email would be sent:")
        print(f"To: {to_email}")
        print(f"Subject: {subject}")
        print(f"Body: {body}")
        print(f"{'=' * 60}\n")
        return

    try:
        yag = yagmail.SMTP(
            user=sender,
            password=password,
            host=host,
            port=str(port),
            smtp_starttls=smtp_starttls,
            smtp_ssl=smtp_ssl,
        )
        yag.send(to=to_email, subject=subject, contents=body)
        yag.close()
    except Exception as exc:
        print(f"\n{'=' * 60}")
        print("EMAIL FAILED - Printing to console instead:")
        print(f"Error: {exc}")
        print(f"To: {to_email}")
        print(f"Subject: {subject}")
        print(f"Body: {body}")
        print(f"{'=' * 60}\n")
