from application.models import User,Posts,Follow
from flask import current_app as app
from flask_caching import Cache
cache = Cache(app)



@cache.memoize(5)
def user_by_user_id(id):
    user = User.query.filter_by(id=id).first()
    return user

@cache.memoize(5)
def user_by_username(uname):
    user = User.query.filter_by(username=uname).first()
    return user

@cache.memoize(5)
def post_by_postid(id):
    return Posts.query.filter_by(id=id).first()

def delete_cached_post(id):
    cache.delete_memoized(post_by_postid,id)

@cache.memoize(1)
def follow(id1,id2):
    return Follow.query.filter_by(f1_user_id=id1,f2_user_id=id2).first()

def delete_cached_follow(id1,id2):
    cache.delete_memoized(follow,id1,id2)
    
@cache.memoize(1)
def public_posts_by_user_id(id):
    all_posts = Posts.query.filter_by(user_id = id,private=0).all()
    return all_posts

