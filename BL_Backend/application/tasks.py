from datetime import datetime, timedelta
import numpy as np
from application.workers import celery
from datetime import datetime
from flask import current_app as app
import csv
import os
from celery.schedules import crontab
from jinja2 import Template
from application.models import User,Posts,Follow
from application import mail_service
from weasyprint import HTML
import matplotlib.pyplot as plt
from zipfile import ZipFile
from  flask import make_response,json,request,jsonify,send_file,Response,url_for
import shutil,io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image 
from reportlab.lib.styles import getSampleStyleSheet
from application import cached
from datetime import datetime
import pandas as pd
from application.database import db


@celery.on_after_finalize.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(crontab(minute=30, hour=19), send_daily_reminder.s(), name='Daily Reminder') 
    # sender.add_periodic_task(60.0, send_daily_reminder.s(), name='Every 60 sec')        
    sender.add_periodic_task(crontab(00,00, day_of_month='1'), send_monthly_report.s(), name='Monthly report')
    # sender.add_periodic_task(60.0, send_monthly_report.s(), name='REPORT--Every 60 sec')  

@celery.task()
def send_monthly_report():
    folder = os.path.dirname(os.path.abspath(__file__))
    url = os.path.join(folder, 'static')
    # print(url)
    users = User.query.all()
    # Calculate the date range for the last month
    last_month = datetime.now() - timedelta(days=30)
    for user in users:
        # Query the database to get all the posts created in the last month
        last_month_posts = Posts.query.filter(Posts.date >= last_month,Posts.user_id==user.id).all()
        
        # Create a list of the dates and the number of posts created on each date
        dates = [datetime.strptime((str(post.date))[0:10], '%Y-%m-%d') for post in last_month_posts]
        dates.sort()
        # print(dates)
        t_dict={}
        for i in dates:
            if t_dict.get(str(i)[:10]):
                t_dict[str(i)[:10]]+=1
            else:
               t_dict[str(i)[:10]]=1
            
        trendline = {"Date":list(t_dict.keys()),
                    "No of Posts":list(t_dict.values())
                    }    
        # print(t_dict)
        df = pd.DataFrame(trendline)
        # print(df)
        if len(dates)>0:
            df.plot(x="Date", y="No of Posts", kind="line")
            # Get the x and y coordinates of the trendline
            x = df['Date']
            y = df['No of Posts']

            # Plot the trendline with highlighted coordinates
            plt.plot(x, y, 'o', color='blue')

            # Add coordinates as text labels to the plot
            for i, j in zip(x, y):
                plt.text(i, j, f'({i}, {j})', ha='center', va='bottom', color='black')
            plt.xlabel("Date of Post Created")
            plt.ylabel("No of Posts")
            plt.title("Summary of Posts for "+user.name)
            fig_loc=str(user.id)+".png"
            # trendline_path=url_for('application/static/trendline/',filename=fig_loc)
            trendline_path=os.path.join('application', 'static', 'trendline',fig_loc )
            # print(trendline_path)
            plt.savefig("application/static/trendline/"+fig_loc)
        else:
            trendline_path="no card"

        url = os.path.join(folder, 'application/static/trendline')
        with open("./application/templates/report.html","r") as f:   
            template = Template(f.read())
            message = template.render(posts=last_month_posts,url=url,id=user.id,user=user.name)
        html = HTML(string= message,base_url=".")
        file_name = "report.pdf"
        html.write_pdf(target=file_name)

        with open("./application/templates/welcome.html","r") as f:   
                template = Template(f.read())
        mail_service.send_email(user.email,"Monthly report",template.render(user=user.name),attachment_file="report.pdf")


@celery.task
def export_pdf_post(post_id):
    post=cached.post_by_postid(id=post_id)
    pdf_path=str(post.id)+"posts.pdf"
    pdf_file = SimpleDocTemplate(pdf_path, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []   
    elements.append(Paragraph( post.title, styles["Heading1"]))
    
    elements.append(Spacer(1, 20))
    
    if post.image:
        try:
            image_path="application/static/blog_images/"+str(post.image)
            img = Image(image_path)
            # elements.append(PageBreak()) # create a new page
            aspect_ratio = img.drawWidth / float(img.drawHeight)
            img.drawHeight = 200
            img.drawWidth = 200 * aspect_ratio
            elements.append(img)
            elements.append(Spacer(1, 20))
        except:
            pass
    elements.append(Paragraph("Description: " + post.description, styles["Normal"]))
    elements.append(Paragraph("Date: " + str(post.date)[0:10], styles["Normal"]))
    elements.append(Spacer(1, 40))
    pdf_file.build(elements)
    return pdf_path



@celery.task
def export_posts_as_csv(user_id):
    user_posts = Posts.query.filter_by(user_id=user_id).all()        
    # Create a CSV file containing the post data
    csv_dir = 'application/static/csv/'
    zip_dir = 'application/static/zip'
    csv_name = os.path.join(str(user_id) + '_posts.csv')
    with open(csv_name, 'w', newline='') as csvfile:
        fieldnames = ['title', 'description', 'date', 'image', 'private']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for post in user_posts:
            writer.writerow({
                'title': post.title,
                'description': post.description,
                'date': post.date,
                'image': post.image,
                'private': post.private
            })

    # Create a zip file containing the CSV file and the associated images
    base_path = "application/static/blog_images/"
    zip_name = os.path.join(zip_dir, str(user_id) + '_export.zip')
    with ZipFile(zip_name, 'w') as zip:
        zip.write(csv_name)
        for post in user_posts:
            if post.image:
                filename = os.path.basename(post.image)
                image_path = os.path.join(base_path, post.image)
                zip.write(image_path, filename)
    return zip_name



@celery.task
def import_posts_as_csv(filename,user_id):
    date=str(datetime.now())
    file = open("application/static/imports/"+filename)
    csvreader = csv.reader(file)
    posts_header = next(csvreader)
    rows = []
    for row in csvreader:
        # print(row)
        rows.append(row)
    file.close()
    for row in rows:
        l1=Posts(user_id=user_id,title=row[0],description=row[1],private=row[2],date=date)
        db.session.add(l1) 
    db.session.commit()
    return True


@celery.task()
def send_daily_reminder():
    with open("./application/templates/reminder.html","r") as f:   
            template = Template(f.read())
    users = User.query.all()
    # calculate today's date
    today = datetime.now()
    today_str = str(today.strftime("%Y-%m-%d"))
    # print(today_str)
    # query to get all posts created today
    for user in users:
        today_posts = Posts.query.filter(Posts.date.like(today_str + '%'), Posts.user_id==user.id).all()
        #User.query.filter(User.username.like(like + '%'),User.id != id).all()
        # print(today_posts)
        if today_posts==[]:
            mail_service.send_email(user.email,"Reminder",template.render(user=user.name,list=None))
        else:
            mail_service.send_email(user.email,"Reminder",template.render(user=user.name,list=today_posts))
        



