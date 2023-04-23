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
            <h1 style="color: black; margin: 1%; text-align: center;"> PUBLIC PROFILE </h1>
            <hr>
                <h1 style="color: black; margin: 1%; text-align: center;"> Name - {{this.name}}</h1>
                <hr>

                <h1 style="color: black; margin: 1%; text-align: center;"> Username - {{this.user_name}}</h1>
                <hr>
                    <div style="color: black; margin: 1%; text-align: center;">
                        <button v-if="follow==0"type="button" class="btn btn-success " @click="followme">Follow</button>
                        <button v-else-if="follow==1"type="button" class="btn btn-danger" @click="unfollow" >Unfollow</button>
                    </div>
                <hr>
                <div class="container">
                        <div class="col" style="color: black; margin: 1%; text-align: center;">
                        <img v-if="this.profile_image"  id="blog_img" :src="profile_image" class="img-thumbnail"  alt="">
                        </div>
                
                </div>
                <div class="container">
                    <div class="row">
                        
                    </div>
                    
                </div>
                <div>
                    <h1  v-if="no_of_all_posts> 0" style="color: black; margin: 1%; text-align: center;"> All POSTS </h1>
                    <div v-if="this.$store.state.loggedin">
                    <ol>
                        <Blog :my-prop=this.name v-for="(item,index) in all_posts" :blog_id="item"  :key="index" />         
                    </ol>
                    
                </div>
                  
                </div>
            
            </div>
        </div>
    </div>
</div>
    `,
    props: ["username"],
    components: {
        my_blog:my_blog,
        Blog:Blog,
        
        

    },
    data(){
        return{
            profile_image: null,
            error: false,
            all_posts:[],
            followed_array:[],
            followed_by_array:[],
            name:null,
            usersID:null,
            user_name:this.$route.params.username,
            follow:null,
            zero:0,
            one:1,

        }
    },
    methods: {
        unfollow(){
            const request3=fetchfunction(`${url}/api/follow/${this.usersID}`,{  method: "DELETE",headers: {
                "Content-Type": "application/json",
              },},true)
            request3.then(()=>{
                    this.follow=this.zero;
                })
            .catch((err)=>{this.error=err.message}) ;
        },
        followme(){
            const request3=fetchfunction(`${url}/api/follow/${this.usersID}`,{  method: "POST",headers: {
                "Content-Type": "application/json",
              },},true)
            request3.then(()=>{
              this.follow=this.one;
              
            })
            .catch((err)=>{this.error=err.message}) ;
          },
       
        
    },
    computed:{
        no_of_followed(){
            return this.followed_array.length
        },
        no_of_followed_by(){
            return this.followed_by_array.length
        },
        no_of_all_posts(){
            return this.all_posts.length
            // this.total_posts = this.all_posts.length
        }

    },
    beforeCreate(){
        

    },
    beforeMount(){
        
        },
   
    mounted(){
//------------------Request1----------------------------------------------------
            const request1= fetchfunction(`${url}/api/user/public/${this.$route.params.username}`,{
                method:"GET",
            },true)
            request1.then((data)=>{
                this.usersID=data.id;
                this.name=data.name;
                
            // console.log(this.usersID);
            // console.log("public user request",data)
            
//-------------------Request2_ inside Request1-------------------------------------------------------            
            const request2=fetchfunction(`${url}/api/check_follow/${this.usersID}`,{
                method:"GET",
              }
              ,true)
              request2.then((data)=>{
                  // console.log(data)
                  this.follow = data.follow;
                  
                //   console.log("Follow",this.follow)
              })
              .catch((err)=>
              {this.error=err.message
      
              })

            })
            .catch((err)=>{this.error=err.message}) ; 
        
       

        
        
        
//------------------Request3----------------------------------------------------
        const request3=fetch(`${url}/api/user/image/${this.user_name}`, {
                    method: "GET",
                    headers: {
                      "Content-Type": "application/json",
                    },
                  })
        request3.then((response) => {
            if (!response.ok) {
                throw new Error(response) }
            return response.blob();
          })
          .then((imageBlob) => {
            this.profile_image = URL.createObjectURL(imageBlob);
          })
          .catch((error) => {
            console.log(error);
            this.error = true;
          });

        
//------------------Request4----------------------------------------------------
        const request4=fetchfunction(`${url}/api/all_posts/${this.user_name}`,{
            method: "GET",
        },true)

        request4.then((data_)=>{
            this.all_posts = data_;
        //    console.log(this.all_posts)
        })
        .catch((err)=>{this.error=err.message}) ;

        
    }
    

}