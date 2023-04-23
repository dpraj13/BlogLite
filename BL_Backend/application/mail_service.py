from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
from email.mime.base import MIMEBase
from email import encoders 

SERVER_SMTP_HOST = "localhost"
SERVER_SMTP_PORT = 1025
SENDER_ADDRESS = "dhairyasheel@gmail.com" 
SENDER_PASSWORD = ""


def send_email(to_address,subject,message,attachment_file=None):
    msg = MIMEMultipart()
    msg["To"] = to_address
    msg["From"] = SENDER_ADDRESS
    msg["Subject"] = subject

    msg.attach(MIMEText(message,"html"))

    if attachment_file:
        with open(attachment_file,"rb") as attachment:
            part = MIMEBase('application', 'octet-stream')
            part.set_payload((attachment).read())
        encoders.encode_base64(part)
        part.add_header('Content-Disposition', f"attachment; filename= {attachment_file}",)
        msg.attach(part)
    s = smtplib.SMTP(host=SERVER_SMTP_HOST,port=SERVER_SMTP_PORT)    #CONNECTION WITH SMTP SERVER
    s.login(SENDER_ADDRESS,SENDER_PASSWORD)
    s.send_message(msg)
    s.quit()
    return True