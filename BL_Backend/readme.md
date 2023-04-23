This is Bloglite web app
It let's users to add new blogs/posts and connect to other users .
It also allows users to perform CRUD opertions on Posts.
App also shows how many people you have connectedto.
Export as CSV,Daily Reminder and monthly report are few more of its features.  
Also posts can be created/Imported from a CSV file.



To run app follow steps below

# First you need to install all the dependencies/modules specified in requirements.txt file.

If you are running on linux a shell script named local_setup.sh can do this for you.

# Next run the main.py python file using below command or invoke run.sh command to run
- For linux : python3 main.py 
- For windows : python main.py

# For Backend to cache API you need to install redis server or invoke redis.sh command to run
  Once installed please user below command to start redis server in your linux os
- redis-server 

# for celery job scheduling to work you need start celery beat and celery workers or invoke worker.sh , beat.sh .
Use commands below for that

- celery -A main.celery beat --max-interval 1 -l info
- celery -A main.celery worker -l info

# To check received mails in install and run mailhog 
Refer link below for installation of Mailhog
https://github.com/mailhog/MailHog

Below is command to run mailhog/You can invoke mailhog.sh to do that 
- ~/go/bin/MailHog

weasyprint is needed to be installed seperately please refer below document to install same.
- https://doc.courtbouillon.org/weasyprint/stable/first_steps.html#linux

# Frontend can be run using any live server there are no dependecies needed to be installed for frontend.
# TO test API you can use bloglite.yaml file