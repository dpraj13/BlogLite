import fetchfunction from "../fetchfunc.js"
import url from "../config.js"
import store from "../vuex/index.js"
import my_blog from "../components/my_blog.js";
import Blog from "../components/Blog.js";

export default{
    template:`
    <div>
    <div class="container-fluid">
        <div class="row">
           
            <div class="col-8 offset-3" id="main" >
            <h1 style="color: black; margin: 1%; text-align: center;"> MY PROFILE </h1>
            <hr>
                <h1 style="color: black; margin: 1%; text-align: center;"> Name - {{this.name}}</h1>
                <hr>
                <h1 style="color: black; margin: 1%; text-align: center;"> Username - {{this.username}}</h1>
                <hr>
                <div class="container">
                    <div class="row">
                        <div class="col">
                            <img v-if="this.profile_image" id="my-image" :src="profile_image" class="img-thumbnail"  alt="">
                        </div>
                        <div class="col">
                            <h2 style="color: black; margin: 10%; text-align: center;"> Total Posts</h2>
                            <h3 style="color: black; margin: 10%; text-align: center;">{{no_of_all_posts}}</h3>
                        </div>
                        <div class="col">
                            
                            <router-link :to="{ name: 'followed_page' }">
                                      <h2 style="color: black; margin: 10%; text-align: center;"> <button type="button" class="btn btn-outline-dark btn-lg" >Following</button></h2>   
                                      
                           </router-link>
                            <h3 style="color: black; margin: 10%; text-align: center;">{{no_of_followed}}</h3>
                           
                        </div>
                        
                        <div class="col">
                        
                            <router-link :to="{ name: 'followed_by' }">
                                      <h2 style="color: black; margin: 10%; text-align: center;"><button type="button" class="btn btn-outline-dark btn-lg" >Followers</button> </h2>  
                            </router-link>
                            <h3 style="color: black; margin: 10%; text-align: center;">{{no_of_followed_by}}</h3>
                        </div>
                    </div>
                    <hr>
                </div>
                <div class="container" style=" margin: 1%; text-align: center;" >
                    <div class="btn-group" role="group" aria-label="Basic mixed styles example" >
                        <button type="button" class="btn btn-danger btn-md" @click ="change_pic" ><i class="bi bi-cloud-arrow-up"></i> 
                        <span class="d-none d-sm-inline-block">Upload/Change profile image </span> </button>

                        <button type="button" class="btn btn-warning btn-md" @click = "add_blog" ><i class="bi bi-plus"></i> 
                        <span class="d-none d-sm-inline-block">Create New Blog</span></button>

                        <button v-if="no_of_all_posts> 0" type="button" class="btn btn-success btn-md" @click="export_zip">
                            <i class="bi bi-download"></i>
                            <span class="d-none d-sm-inline-block">Export All posts</span>
                        </button>
                        <button  type="button" class="btn btn-info btn-md" >
                           
                            <router-link :to="{ name: 'import_page' }">
                            <i class="bi bi-upload"></i>
                            <span class="d-none d-sm-inline-block">  Import Posts</span>
                            </router-link>
                        </button>
                    </div>
                </div>
                <hr>
                <div>
                    <h1 v-if="no_of_all_posts> 0" style="color: black; margin: 1%; text-align: center;"> All POSTS </h1>
                    <hr>
                    <div v-if="this.$store.state.loggedin">
                    
                        <my_blog   v-for="(item,index) in all_posts" :blog_id="item"  :key="index" :item="item"  ></my_blog>       
                    
                    </div>
                </div>
                  
                </div>
            
            </div>
        </div>
    </div>
</div>
    `,
    components: {
        my_blog:my_blog,
        
        

    },
    data(){
        return{
            profile_image: null,
            user_data: null,
            error: false,
            total_posts:null,
            followed:null,
            followed_by:null,
            all_posts:null,
            followed_array:[],
            followed_by_array:[],
            name:null,
            username:null,
            

        }
    },
    methods: {
        add_blog(){
            this.$router.push({name:"create_blog"})
        },
        change_pic(){
            this.$router.push({name:"edit_profile_image"})
        },
        export_zip(){
                    const thisurl = url+'/api/export';
                    fetch(thisurl, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/zip',
                            "Authentication-Token": store.getters.get_token,
                        }
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.blob();
                    })
                    .then(blob => {
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        const zip_name=this.name+'_all_posts'+'.zip';
                        link.download = zip_name;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    })
                    .catch(error => {
                        console.error('There was an error:', error);
                    });
        },
        
        
    },
    computed:{
        no_of_followed(){
            return this.followed_array.length
        },
        no_of_followed_by(){
            const len=  this.followed_by_array.length
            // console.log(len)
            if(len>0){
                return len;
            }
            else{
                return 0 ;
            }
            
        },
        no_of_all_posts(){
            return this.all_posts.length
            // this.total_posts = this.all_posts.length
        }

    },
   
    mounted(){
        const request1=fetch(`${url}/api/user/image`, {
                    method: "GET",
                    headers: {
                      "Content-Type": "application/json",
                      "Authentication-Token": store.getters.get_token,
                    },
                  })
        request1.then((response) => {
            if (!response.ok) {
                throw new Error("Failed to fetch profile image.");}
            return response.blob();
          })
          .then((imageBlob) => {
            this.profile_image = URL.createObjectURL(imageBlob);
          })
          .catch((error) => {
            console.log(error);
            this.error = true;
          });
//------------------Request2----------------------------------------------------
        const request2=fetchfunction(`${url}/api/user`,{},true)
        request2.then((data)=>{
            this.user_data = data;
            this.name=data.name;
            this.username=data.username;
        //    console.log(this.user_data)
        })
        .catch((err)=>{this.error=err.message}) ;
//------------------Request3----------------------------------------------------
        const request3=fetchfunction(`${url}/api/all_posts`,{
            method: "GET",
        },true)

        request3.then((data_)=>{
            this.all_posts = data_;
        //    console.log(this.all_posts)
        })
        .catch((err)=>{this.error=err.message}) ;
//------------------Request4----------------------------------------------------
        const request4=fetchfunction(`${url}/api/follow`,{
            method: "GET",
        },true)
        request4.then((data_)=>{
            this.followed_by_array = data_;
        //    console.log(this.followed_by_array)
        })
        .catch((err)=>{this.error=err.message}) ;
//------------------Request5----------------------------------------------------
        const request5=fetchfunction(`${url}/api/following`,{
            method: "GET",
        },true)
        request5.then((data_)=>{
            this.followed_array = data_;
        //    console.log(this.followed_array)
        })
        .catch((err)=>{this.error=err.message}) ;
    }

}