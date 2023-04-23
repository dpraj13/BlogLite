from flask_restful import Resource, Api
from  flask import make_response,json,request,jsonify,send_file,Response
from flask_security import hash_password,auth_required
from flask_restful import fields,marshal_with
from werkzeug.exceptions import HTTPException
from flask_restful import reqparse 
from flask_security import current_user
from application.database import db
from application.datastore import user_datastore
from application.models import User,Posts,Role,Follow
from application import tasks
import json
import csv
import zipfile
from datetime import datetime
from application import cached
from application.script import ALLOWED_EXTENSIONS ,allowed_file,is_valid_email,Valid
import os
from werkzeug.utils import secure_filename
from datetime import datetime
import base64
import time
from time import mktime
from reportlab.lib import pagesizes
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image 
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import letter
import shutil,io
from zipfile import ZipFile

output_fields = {
  "id": fields.Integer,
  "username": fields.String,
  "name": fields.String,
  "email":  fields.String
}

user_parser = reqparse.RequestParser()
user_parser.add_argument("name")
user_parser.add_argument("username")
user_parser.add_argument("email")
user_parser.add_argument("password")
user_parser.add_argument("profile_image")


class SchemaValidationError(HTTPException):
    def __init__(self, status_code, error_code, error_message):
        data = { "error_code" : error_code, "error_message": error_message }
        self.response = make_response(json.dumps(data), status_code)


class BusinessValidationError(HTTPException):
    def __init__(self, status_code, error_code, error_message):
        data = { "error_code" : error_code, "error_message": error_message }
        self.response = make_response(json.dumps(data), status_code)


class NotFoundError(HTTPException):
    def __init__(self, status_code):
        self.response = make_response('', status_code)

class Errorcode(HTTPException):
    def __init__(self,status_code,error_code,error_message):
        message = {"error_code":error_code,"error_message":error_message}
        self.response = make_response(json.dumps(message),status_code)



class UserAPI(Resource):
    @marshal_with(output_fields)
    @auth_required("token")
    def get(self):
        id = current_user.id
        # print(id)
        user = cached.user_by_user_id(id)
        # user = User.query.filter_by(id=id).first()
        if user:
            # print("user",user)
            return user
        else:
            raise BusinessValidationError(status_code=404, error_code="BE1004", error_message="User Not Found")

    @marshal_with(output_fields)
    def post(self):
        args = user_parser.parse_args()
        name = args.get("name",None)
        username = args.get("username",None)
        email = args.get("email",None)
        password = args.get("password",None)
        # user = cached.user_by_user_id(id)
        user= User.query.filter_by(username=username).first()
        if user:
            raise SchemaValidationError(403,"SE1002","Username Already exist")            
        elif User.query.filter_by(email=email).first() != None:
            raise SchemaValidationError(403,"SE1004","Email Already exist")
        elif is_valid_email(email)==False:
            raise SchemaValidationError(403,"SE1007","Invalid Email Address")
        else:
            try:
                user_datastore.create_user(username=username,email=email, password=hash_password(password), active=1,name = name)
                db.session.commit()
            except:
                raise SchemaValidationError(404,"SE1005","Integrity Error")
        return User.query.filter_by(username=username).first()


    

    # @auth_required("token")
    # def delete(self):
    #     id = current_user.id
    #     user= User.query.filter_by(id=id).first()
    #     try:
    #         post = Posts.query.filter_by(user_id = id,id=post_id).first()   
    #     except:
    #             raise Errorcode(404,"NULL","Integrity Error")
    #     if not post:
    #         raise NotFoundError(status_code = 404)
        
    #     old_file="application/static/"+str(post.image)
    #     os.remove(old_file)
    #     user.posts.remove(post)            #clearing that specific post of user from relations of user-post
    #     db.session.delete(post)               # deleteing tracker
    #     db.session.commit()

class PublicUserAPI(Resource):
    def get(self,username):
        user = cached.user_by_username(username)
        # user = User.query.filter_by(username=username).first()
        name=user.name
        id=user.id
        if user:
            # print("user",user)
            return make_response(jsonify({'name': name,'id':id}),200)
        else:
            raise BusinessValidationError(status_code=404, error_code="BE1004", error_message="User Not Found")
        
class PublicUserImageAPI(Resource):
    #GET PROFILE IMAGE
    def get(self,username):
        user= User.query.filter_by(username=username).first()
        # user = cached.user_by_username(username)
        if user.profile_image != None:
            image_path="application/static/profile_images/"+str(user.profile_image)
            return send_file(image_path, mimetype='image/gif')
        else:
            raise Errorcode(404,"NULL","Integrity Error")
        
class UserImageAPI(Resource):
    #GET PROFILE IMAGE
    @auth_required("token")
    def get(self):
        user_id = current_user.id
        user= User.query.filter_by(id=user_id).first()
        # user = cached.user_by_user_id(id)
        if user.profile_image != None:
            image_path="application/static/profile_images/"+str(user.profile_image)
            return send_file(image_path, mimetype='image/gif')
        else:
            raise Errorcode(404,"NULL","Integrity Error")

    #SAVE PROFILE IMAGE
    @auth_required("token")
    def post(self):
        user_id = current_user.id
        # user= User.query.filter_by(id=user_id).first()
        user = cached.user_by_user_id(user_id)
        if 'file' not in request.files:
            return jsonify({'error': 'media not provided'}), 400
        file= request.files ['file']
        if file.filename == '':
            return jsonify({'error': 'no file selected'}), 400
        if file and allowed_file(file.filename):
            filename =str(user_id)+secure_filename (file.filename)
            # file.save(os.path.join(, filename)) 
            file.save("application/static/profile_images/"+filename)
            filename=str(filename)
            # print("filename---------",filename)
        try:
            user.profile_image=filename
            db.session.add(user)
            # cached.delete_cached_trackers(user_id)
            db.session.commit()
            return make_response(jsonify({'message': 'Profile Image uploaded successfully'}),200)
        except:
            raise Errorcode(404,"NULL","Integrity Error")
    
    #CHANGE PROFILE IMAGE
    @auth_required("token")
    def put(self):
        user_id = current_user.id
        # print("puting profile image")
        user= User.query.filter_by(id=user_id).first()
        # user = cached.user_by_user_id(user_id)
        if 'file' not in request.files:
            return jsonify({'error': 'media not provided'}), 400
        file= request.files ['file']
        if file.filename == '':
            return jsonify({'error': 'no file selected'}), 400
        if file and allowed_file(file.filename) and user.profile_image:
            old_file="application/static/profile_images/"+str(user.profile_image)
            os.remove(old_file)
            filename =str(user_id)+secure_filename (file.filename)
            # file.save(os.path.join(, filename)) 
            file.save("application/static/profile_images/"+filename)
            filename=str(filename)
            # print("filename---------",filename)
        else:
            filename =str(user_id)+secure_filename (file.filename)
            # file.save(os.path.join(, filename)) 
            file.save("application/static/profile_images/"+filename)
            filename=str(filename)
            # print("filename---------",filename)
        try:
            user.profile_image=filename
            db.session.add(user)
            # cached.delete_cached_trackers(user_id)
            db.session.commit()
            return make_response(jsonify({'message': 'Profile Image Changed successfully'}),200)
        except:
            raise Errorcode(404,"NULL","Integrity Error")








post_output_fields = {
  "id": fields.Integer,
  "title": fields.String,
  "description":  fields.String,
  "date":  fields.String,
  "private": fields.Integer
}

post_parser= reqparse.RequestParser()
# post_parser.add_argument("UserId")
post_parser.add_argument("title")
post_parser.add_argument("description")
post_parser.add_argument("date")
post_parser.add_argument("private")
post_parser.add_argument("image")

update_post_parser = reqparse.RequestParser()
update_post_parser.add_argument("description")
update_post_parser.add_argument("title")
update_post_parser.add_argument("private")

class PostImageAPI(Resource):
    #GET IMAGE
    # @auth_required("token")
    def get(self):
        args=request.args
        post_id= args.get("post_id")
        post = Posts.query.filter_by(id=post_id).first() 
        # print("IMAGE------------------!",post.image,post.id)
        if post.image == None :
            return make_response(jsonify({'message': 'Post dont have any image'}),200)
        else:
            image_path="application/static/blog_images/"+str(post.image)
            return send_file(image_path, mimetype='image/gif')

    #CHANGE IMAGE
    @auth_required("token")
    def put(self):
        args=request.args
        post_id= args.get("post_id")
        id = current_user.id
        post = Posts.query.filter_by(user_id = id,id=post_id).first()
        if 'file' not in request.files:
            return jsonify({'error': 'media not provided'}), 400
        file= request.files ['file']
        if file.filename == '':
            return jsonify({'error': 'no file selected'}), 400
        if post.image != None:
            if file and allowed_file(file.filename):
                old_file="application/static/blog_images/"+str(post.image)
                os.remove(old_file)
                filename =str(post_id)+secure_filename (file.filename)
                # file.save(os.path.join(, filename)) 
                file.save("application/static/blog_images/"+filename)
                filename=str(filename)
                # print("filename---------",filename)
            try:
                post.image=filename
                db.session.add(post)
                # cached.delete_cached_trackers(user_id)
                db.session.commit()
                return make_response(jsonify({'message': 'Image uploaded successfully'}),200)
            except:
                raise Errorcode(404,"NULL","Integrity Error")
        else:
            filename =str(post_id)+secure_filename (file.filename)
            # file.save(os.path.join(, filename)) 
            file.save("application/static/blog_images/"+filename)
            filename=str(filename)
            # print("filename---------",filename)
            try:
                post.image=filename
                db.session.add(post)
                # cached.delete_cached_trackers(user_id)
                db.session.commit()
                return make_response(jsonify({'message': 'Image inserted successfully'}),200)
            except:
                raise Errorcode(404,"NULL","Integrity Error")


class All_PostsAPI(Resource):
    @auth_required("token")
    def get(self):      
        id = current_user.id
        # print("ID------------",id)
        posts = Posts.query.filter_by(user_id = id).all()
        posts_list=[]
        if (posts):
            
            for i in posts:
                posts_list.append(i.id) 
            return make_response(jsonify(posts_list),200)
        else:
             return make_response(jsonify(posts_list),200)

class All_Public_PostsAPI(Resource):
    def get(self,username):      
        # print("ID------------",id)
        # user = User.query.filter_by(username=username).first()
        user = cached.user_by_username(username)
        posts = Posts.query.filter_by(user_id = user.id,private=0).all()
        if (posts):
            posts_list=[]
            for i in posts:
                posts_list.append(i.id) 
            return make_response(jsonify(posts_list),200)
        else:
             raise NotFoundError(status_code = 404)

class GetFreePostAPI(Resource):
    def get(self,post_id):      
        # post = Posts.query.filter_by(id=post_id).first()
        post=cached.post_by_postid(id=post_id)
        user_id=post.user_id
        # user = User.query.filter_by(id=user_id).first()
        user = cached.user_by_user_id(user_id)
        id=post.id
        username=user.username
        title=post.title
        description=post.description
        date=post.date
        private=post.private   
        if (post): 
         return make_response(jsonify({'id':id,'username':username,'title':title,'description':description,'date':date,'private':private}),200)
        else:
           raise NotFoundError(status_code = 404)

class PostsAPI(Resource):
    @marshal_with(post_output_fields)
    @auth_required("token")
    def get(self,post_id):      
        id = current_user.id
        # all_trackers = cached.trackers_by_userid(id)  
        post = Posts.query.filter_by(user_id = id,id=post_id).first()   
        if (post): 
         return post
        else:
            raise BusinessValidationError(status_code=404, error_code="BE1005", error_message="Post does not belong to the specified User")

    
    @auth_required("token")
    def delete(self,post_id):                
        id = current_user.id
        user= User.query.filter_by(id=id).first()
        # user = cached.user_by_user_id(id)
        # print("ID:",id)
        # print("Post_id:",post_id)
        try:
            # print(type(int(post_id)))
            post = Posts.query.filter_by(id=int(post_id)).first()     
            # print(post)
        except:
                raise Errorcode(404,"NULL","Integrity Error")
        if not post:
            raise NotFoundError(status_code = 404)
        if (post.image):
            old_file="application/static/blog_images/"+str(post.image)
            if os.path.exists(old_file):
                os.remove(old_file)
            else:
                pass
            
            user.posts.remove(post)            #clearing that specific post of user from relations of user-post
            db.session.delete(post) 
            cached.delete_cached_post(post_id)            
            db.session.commit()

        else:
            user.posts.remove(post)            #clearing that specific post of user from relations of user-post
            db.session.delete(post)
            cached.delete_cached_post(post_id)          
            db.session.commit()


    @marshal_with(post_output_fields)    
    @auth_required("token")
    def put(self,post_id):       
        id = current_user.id
        args = update_post_parser.parse_args()
        title = args.get("title",None)
        description = args.get("description",None)
        private = args.get("private",None)
        # print("DETAILS",post_id,title,description,private)
        try:
            post = Posts.query.filter_by(user_id = id,id=post_id).first()     
        except:
                raise Errorcode(404,"NULL","Integrity Error")
        if not post:
            raise NotFoundError(status_code = 404)
        try:
            post.title = title
            post.description = description
            post.private=private
            cached.delete_cached_post(post_id)
            db.session.commit()
            post2 = Posts.query.filter_by(user_id = id,id=post_id).first() 
            return post2
            

        except:
            raise Errorcode(404,"Not_unique","Title name must be unique")

        
    @marshal_with(post_output_fields)
    @auth_required("token")
    def post(self): 
        # print("-------------POST BLOG  INVOKED -----------")           
        # args = post_parser.parse_args()
        args=request.args
        user_id = current_user.id
        title = args.get("title")
        description = args.get("description")
        private = args.get("private")
        date=str(datetime.now())
        # print("details",title,description,private,user_id,date)
        if 'file' not in request.files:
            try:
                p1 = Posts(title = title, user_id= user_id,description = description,
                        date=date,private=private)
                db.session.add(p1)
                db.session.commit()
                post=Posts.query.filter_by(title=title,user_id=user_id).first()
                return post
            except:
                raise Errorcode(406,"Not_unique","Title name must be unique")
        file= request.files ['file']
        if file.filename == '':
            return jsonify({'error': 'no file selected'}), 400
        # print("REACHED !-----------------------")
        if file and allowed_file(file.filename):
            try:
                p1 = Posts(title = title, user_id= user_id,description = description,
                        date=date,private=private)
                db.session.add(p1)
                # cached.delete_cached_trackers(user_id)
                db.session.commit()
                post=Posts.query.filter_by(title=title,user_id=user_id).first()
                filename =str(post.id)+secure_filename (file.filename)
                file.save("application/static/blog_images/"+filename)
                filename=str(filename)
                post.image=filename
                db.session.commit()
                # print("filename---------",filename)
                # return jsonify({'msg': 'media uploaded successfully'})
                return post
            except:
                raise Errorcode(406,"Not_unique","Title name must be unique")
        


class FeedAPI(Resource):
    # @marshal_with(post_output_fields)
    @auth_required("token")
    def get(self):      
        id = current_user.id
        # all_trackers = cached.trackers_by_userid(id)
        followings = Follow.query.filter_by(f1_user_id=id).all()
        following_list=[]
        if not followings:
            pass
        else:
            for following in followings:
                follower_id=following.f2_user_id
                following_list.append(follower_id)
        all_posts_of_following=[]
        # myposts = Posts.query.filter_by(user_id = id).all()
        # all_posts_of_following.extend(myposts)
        # print("following list ",following_list)
        for following in following_list:
            # all_posts = Posts.query.filter_by(user_id = following,private=0).all()
            all_posts=cached.public_posts_by_user_id(following)
            all_posts_of_following.extend(all_posts)
        # print("all posts---------",all_posts_of_following)
        date_format = "%Y-%m-%d %H:%M:%S"
        all_post_list=[]
        for post in all_posts_of_following:
            post_dict={}
            DT=(post.date)[:-7]
            # print("--------DT------",DT)
            date_object = datetime.strptime(DT, date_format)
            timestamp = int(mktime(date_object.timetuple()))
            # print("timestamp",timestamp)
            post_dict["post_id"]=post.id
            post_dict["date"]=timestamp
            all_post_list.append(post_dict)
        # print("all POSTS LIST",all_post_list)
        sorted_posts = sorted(all_post_list,reverse=True, key=lambda x: x['date'])
        # print("sorted",sorted_posts)
        feed_list=[]
        for i in sorted_posts:
            feed_list.append(i['post_id'])
        return make_response(jsonify(feed_list),200)

        


class FollowAPI(Resource):

    #FOLLOW other user
    @auth_required("token")
    def post(self,user2_id):
        id = current_user.id
        # print("F1----",id,"F2---",user2_id)
        if str(id)==str(user2_id):
            raise Errorcode(406,"NULL","Integrity Error, cannot follow same user")
        try:
            f1 = Follow(f1_user_id=id,f2_user_id=user2_id)
            db.session.add(f1)
            db.session.commit()
            return make_response(jsonify({'message': 'FOLLOWED'}),200)
        except:
            raise Errorcode(406,"NULL","Integrity Error, already followed")
    
    #UNFOLLOW other user
    @auth_required("token")
    def delete(self,user2_id):
        id = current_user.id
        follow=Follow.query.filter_by(f1_user_id=id,f2_user_id=user2_id).first() 
        if str(id)==str(user2_id):
            raise Errorcode(406,"NULL","Integrity Error, cannot unfollow same user")                    
        if not follow:
            raise NotFoundError(status_code = 404)                   
        db.session.delete(follow)   
        cached.delete_cached_follow(id,user2_id)                  
        db.session.commit() 
        return make_response(jsonify({'message': 'UNFOLLOWED'}),200)

    #NO of FOLLOWERS
    @marshal_with(output_fields)
    @auth_required("token")
    def get(self):
        id = current_user.id
        followers = Follow.query.filter_by(f2_user_id=id).all()
        followers_list = []
        if not followers:
            return make_response(jsonify(followers_list),200)
        else:
            for follower in followers:
                follower_id=follower.f1_user_id
                user= User.query.filter_by(id=follower_id).first()
                followers_list.append(user)
            return followers_list

class CheckFollowAPI(Resource):
    #Check if user follows other user
    @auth_required("token")
    def get(self,user2_id):
        id = current_user.id
        # follow = Follow.query.filter_by(f1_user_id=id,f2_user_id=user2_id).first()
        follow=cached.follow(id,user2_id)
        if follow==None:
            return make_response(jsonify({"follow":0}),200)
        else:
            # for follower in followers:
            #     follower_id=follower.f1_user_id
            #     followers_list.append(follower_id)
            return make_response(jsonify({"follow":1}),200)
    

class FollowingAPI(Resource):
    #Following other users
    @marshal_with(output_fields)
    @auth_required("token")
    def get(self):
        id = current_user.id
        followings = Follow.query.filter_by(f1_user_id=id).all()
        following_list=[]
        if not followings:
            raise NotFoundError(status_code = 404)
        else:
            for following in followings:
                follower_id=following.f2_user_id
                user= User.query.filter_by(id=follower_id).first()
                following_list.append(user)
            return following_list

class SearchAPI(Resource):
    @marshal_with(output_fields)
    @auth_required("token")
    def get(self,like):
        # print(like)
        id=current_user.id
        if(like=='null'):
            return User.query.filter(User.id != id).all()
        else:
            return User.query.filter(User.username.like(like + '%'),User.id != id).all()
        
        

class Export_Blog_API(Resource):
    @auth_required("token")
    def get(self,post_id):            
        id = current_user.id
        try:
            post=cached.post_by_postid(id=post_id)
            # post = Posts.query.filter_by(id=post_id).first()     
        except:
                raise Errorcode(404,"NULL","Integrity Error")
        if not post:
            raise NotFoundError(status_code = 404)
        # task=tasks.export_pdf_post.delay(post.id)
        task=tasks.export_pdf_post.apply_async((post.id,),countdown=0)
        # pdf_path=task.wait()
        pdf_path=task.get()
        src_file =pdf_path
        dst_file = 'application/static/pdf_posts/'+pdf_path
        path=dst_file+src_file
        if(os.path.exists(path)):
            os.remove(path)
            shutil.move(src_file, dst_file)
        else:
            shutil.move(src_file, dst_file)
        return send_file(dst_file, mimetype='application/pdf')



class Export_AllPosts_API(Resource):

    @auth_required("token")
    def get(self):
        user_id = current_user.id
        task = tasks.export_posts_as_csv.delay(user_id)
        zip_name = task.wait()
        dst_file = 'application/static/csv/'
        src_file =str(user_id)+"_posts.csv"
        path=dst_file+src_file
        if(os.path.exists(path)):
            os.remove(path)
            shutil.move(src_file, dst_file)
        else:
            shutil.move(src_file, dst_file)
        with open(zip_name, 'rb') as f:
            response = Response(f.read(), mimetype='application/zip')
            response.headers.set('Content-Disposition', 'attachment', filename=zip_name)
            return response
        


class Import_API(Resource):
    @auth_required("token")
    def post(self):
        user_id = current_user.id
        file = request.files['file']
        
        if file and allowed_file(file.filename):
            filename=secure_filename(file.filename)
            new_filename=f'{filename.split(".")[0]}.csv'
            # print(new_filename)
            file.save("application/static/imports/"+new_filename)
            #print(Valid(new_filename,user_id))
            flag,error=Valid(new_filename,user_id)
            # print(flag,error)
            if (flag):
                task = tasks.import_posts_as_csv.delay(new_filename,user_id)
                done=task.wait()
                if(done):
                  return make_response(jsonify({'message': "Posts created successfully"}),200)
                else:
                    pass
                
            else:
                return make_response(jsonify({'message': error}),400)
        else:
            return make_response(jsonify({'message': "Invalid File type "}),404)