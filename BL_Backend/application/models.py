from .database import db
from flask_security import UserMixin, RoleMixin
from sqlalchemy import create_engine, Column, Integer, UniqueConstraint, Unicode


roles_users = db.Table('roles_users',
        db.Column('user_id', db.Integer(), db.ForeignKey('user.id')),
        db.Column('role_id', db.Integer(), db.ForeignKey('role.id')))

class User(db.Model,UserMixin):
    __tablename__ = "user"
    id = db.Column(db.Integer , autoincrement = True , primary_key = True)
    username = db.Column(db.String , unique = True, nullable = False) 
    password = db.Column(db.String , nullable = False)
    name = db.Column(db.String , nullable = False)
    email = db.Column(db.String,unique = True)
    profile_image = db.Column(db.String)
    active = db.Column(db.Boolean())
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False) 
    roles = db.relationship('Role', secondary=roles_users,backref=db.backref('users', lazy='dynamic'))
    posts = db.relationship("Posts",back_populates="user")
    follows=db.relationship("Follow",back_populates="user")
    
    

class Role(db.Model, RoleMixin):
    __tablename__ = 'role'
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))

class Posts(db.Model):
    __tablename__ = "posts"
    id = db.Column(db.Integer , autoincrement = True , primary_key = True)
    user_id = db.Column(db.Integer , db.ForeignKey("user.id"))
    title = db.Column(db.UnicodeText, nullable = False)  
    description = db.Column(db.UnicodeText)
    date = db.Column(db.String)
    image = db.Column(db.String)
    private= db.Column(db.Integer)
    user = db.relationship("User", back_populates="posts")
    __table_args__ = (db.UniqueConstraint('user_id', 'title'),)

class Follow(db.Model):
    __tablename__ = "follows"
    id = db.Column(db.Integer , autoincrement = True , primary_key = True)
    f1_user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    f2_user_id = db.Column(db.Integer)
    user = db.relationship("User", back_populates="follows") 
    __table_args__ = (db.UniqueConstraint( f1_user_id, f2_user_id  , name='unique_columns'),)
