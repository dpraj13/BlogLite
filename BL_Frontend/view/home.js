import Blog from "../components/Blog.js";
import fetchfunction from "../fetchfunc.js"
import url from "../config.js"




export default {
    template: `
    <div>
        
        <div class="container-fluid">
            
            <div class="row">
                    
                <div class="col-8 offset-3" id="main">
                    <h1 class="text-center" > {{this.name}}'s Feed </h1>
                <div v-if="this.$store.state.loggedin">
                    
                    <h1 v-if="no_post" class="text-center" > {{this.message}} </h1>
                        <Blog  :my-prop=user_data.username v-for="(item,index) in blogarray" :blog_id="item"  :key="index" />   
                        <hr>
                    
                    
                </div>
                <div v-else>
                    Please go to login page first
                </div>
                
                </div>
            </div>
        </div>
    </div>`,
    components: {
        Blog:Blog,
        
        

    },
    data(){
        return {
            blogarray:[],
            user_data:null,
            error:false,
            name:null,
            message:"!!!!!!!!! There are no posts in the feed !!!!!!!!. Connect with other users to see what they are doing",
        }
    },
    computed:{
            no_post(){
                if (this.blogarray.length<1){
                    return true;
                }
                else{
                    return false ;
                }
            }
    },
    methods: {
        add_blog(){
            this.$router.push({name:"create_blog"})
        },
        delete_track(tracker_id){
            const tracker = this.trackerarray.find(c => c.tracker_id == tracker_id);
            const index = this.trackerarray.indexOf(tracker);
            this.trackerarray.splice(index,1);
 
        },

    },
    mounted(){
        if(this.$store.state.loggedin === false){
            this.$router.push({name:"login"})
        }
        const request2=fetchfunction(`${url}/api/user`,{},true)
        request2.then((data)=>{
            this.user_data = data;
            this.name=data.name;
        })
        .catch((err)=>
        {
            this.error=err.message;

        })

        const request1=fetchfunction(`${url}/api/feed`,{},true)
        
        request1.then((data)=>{
            
            this.blogarray = data;
            // console.log(this.blogarray)
        })
        .catch((err)=>
        {this.error=err.message

        })
       
    },
     
    
    
}

