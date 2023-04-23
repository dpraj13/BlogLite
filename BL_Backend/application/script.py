
from email import message
from werkzeug.utils import secure_filename
import pandas as pd
import datetime
from datetime import datetime
import re
from application.models import User,Posts,Role,Follow
import csv

ALLOWED_EXTENSIONS = set(['png','jpg','jpeg','gif','csv'])

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.',1)[1].lower() in ALLOWED_EXTENSIONS


def date_validation(date):
    format="%Y-%m-%d"
    res = True
    # using try-except to check for truth value
    try:
        res = bool(datetime.strptime(date, format))
    except ValueError:
        res = False
    return res


def is_valid_email(email):
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_pattern, email) is not None
    
def date_validation(date):
    format="%Y-%m-%d"
    res = True
    # using try-except to check for truth value
    try:
        res = bool(datetime.strptime(date, format))
    except ValueError:
        res = False
    return res
    
def Valid(filename,user_id):
    error="Improper data format"
    flag=True
    posts=Posts.query.filter_by(user_id=user_id).all()
    titles=[]
    for post in posts:
        titles.append(post.title)
    file = open("application/static/imports/"+filename)
    csvreader = csv.reader(file)
    post_header = next(csvreader)
    post_header_default=['title', 'description','private']
    # print(titles)
    rows = []
    valid=True
    res=True
    try:
        for row in csvreader:
            rows.append(row)
            if len(row)<3:
                flag=False
                error="Less attributes provided for post data"
                raise StopIteration
    except StopIteration:
        # print("iteration stopped")
        return flag,error
    #print(res)
    valid=res

    #print(rows)
    file.close()
    for row in rows:
        if (row[0] not in titles):
            continue
        else:
            error="Post with similar title already exists"
            flag=False
            return flag ,error
    error=False
    return flag,error