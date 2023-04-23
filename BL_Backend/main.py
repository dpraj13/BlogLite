from  flask import Flask, render_template , request,redirect,make_response,send_file
from sqlalchemy import true
from  flask_restful import Api
from flask_cors import CORS
from flask_login import current_user
from application import workers
from application.database import db
from flask_caching import Cache
from application.models import User,Posts,Role,Follow
# from cache import Cache

app = Flask(__name__)
CORS(app)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.sqlite3"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"]=False

db.init_app(app)
api = Api(app)
app.app_context().push()

class LocalDevelopmentConfig():

    SECRET_KEY = "asdfghklljdhd"
    # SECURITY_PASSWORD_HASH = "bcrypt"    
    SECURITY_PASSWORD_SALT = "hjfddrtghvg545456rcgj" 
    SECURITY_REGISTERABLE = True
    SECURITY_CONFIRMABLE = False
    SECURITY_SEND_REGISTER_EMAIL = False
    SECURITY_UNAUTHORIZED_VIEW = None
    WTF_CSRF_ENABLED = False
    SECURITY_TOKEN_AUTHENTICATION_HEADER = "Authentication-Token"
    UPLOAD_FOLDER="application\static"
    CACHE_TYPE = "RedisCache"
    CACHE_REDIS_HOST = "localhost"
    CACHE_REDIS_PORT = 6379
    CACHE_DEFAULT_TIMEOUT = 1000


    

app.config.from_object(LocalDevelopmentConfig)



app.app_context().push()
celery = workers.celery

    # Update with configuration
celery.conf.update(
    broker_url = "redis://localhost:6379/1",
    result_backend = "redis://localhost:6379/2",
    enable_utc = False,
    timezone='Asia/Kolkata'
    )
 
celery.Task = workers.ContextTask      #overide celery task to contex task
app.app_context().push()


from application.api import UserAPI
api.add_resource(UserAPI,"/api/user","/api/user/register")

from application.api import PublicUserAPI
api.add_resource(PublicUserAPI,"/api/user/public/<username>")

from application.api import PublicUserImageAPI
api.add_resource(PublicUserImageAPI,"/api/user/image/<username>")

from application.api import UserImageAPI
api.add_resource(UserImageAPI,"/api/user/image")

from application.api import PostImageAPI
api.add_resource(PostImageAPI,"/api/image")

from application.api import All_PostsAPI
api.add_resource(All_PostsAPI,"/api/all_posts")

from application.api import All_Public_PostsAPI
api.add_resource(All_Public_PostsAPI,"/api/all_posts/<username>")

from application.api import PostsAPI
api.add_resource(PostsAPI,"/api/add_post","/api/post/<post_id>")

from application.api import GetFreePostAPI
api.add_resource(GetFreePostAPI,"/api/free_post/<post_id>")

from application.api import FeedAPI
api.add_resource(FeedAPI,"/api/feed")

from application.api import FollowAPI
api.add_resource(FollowAPI,"/api/follow/<user2_id>","/api/follow")

from application.api import CheckFollowAPI
api.add_resource(CheckFollowAPI,"/api/check_follow/<user2_id>")

from application.api import FollowingAPI
api.add_resource(FollowingAPI,"/api/following")

from application.api import SearchAPI
api.add_resource(SearchAPI,"/api/search/<like>")

from application.api import Export_Blog_API
api.add_resource(Export_Blog_API,"/api/export/<post_id>")

from application.api import Export_AllPosts_API
api.add_resource(Export_AllPosts_API,"/api/export")

from application.api import Import_API
api.add_resource(Import_API,"/api/upload")


db.create_all()
if __name__ == '__main__':
    app.run(host="0.0.0.0",debug=True,port=5000,threaded=True)

