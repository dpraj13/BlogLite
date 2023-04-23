
from flask_security import Security, SQLAlchemySessionUserDatastore
from application.database import db
from application.models import User, Role
from flask import current_app as app





user_datastore = SQLAlchemySessionUserDatastore(db.session, User, Role)
app.security = Security(app, user_datastore)
