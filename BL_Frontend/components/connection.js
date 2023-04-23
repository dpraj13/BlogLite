import fetchfunction from "../fetchfunc.js"
import url from "../config.js"
import store from "../vuex/index.js"


export default {
    template: `
    
        <div class="card">
            
            <div class="card-body">
                 
                
                <router-link :to="{ name: 'public_user', params: { username:this.username } }"> 
                          <h2 class="card-header" align="center"   ><button class="btn btn-outline-dark btn-lg" type="button" >{{this.username}}</button> 
                        </router-link>
               
                <div style="color: black; margin: 1%; text-align: center;">
                        <button v-if="follow==0"type="button" class="btn btn-success " @click="followme">Follow</button>
                        <button v-else-if="follow==1"type="button" class="btn btn-danger" @click="unfollow" >Unfollow</button>
                </div>

            </div>
        </div>
    `,
    props: ["f2_user_id","username"],
    data(){
        return {
            
            f2UserId:this.f2_user_id,
            user_name:this.username,
            follow:null,
            zero:0,
            one:1,
            
        }
    },
    methods:{
         unfollow(){
            const request3=fetchfunction(`${url}/api/follow/${this.f2UserId}`,{  method: "DELETE",headers: {
                "Content-Type": "application/json",
              },},true)
            request3.then(()=>{
              this.follow=this.zero;
              
            })
            .catch((err)=>{this.error=err.message}) ;
          },
          followme(){
            const request3=fetchfunction(`${url}/api/follow/${this.f2UserId}`,{  method: "POST",headers: {
                "Content-Type": "application/json",
              },},true)
            request3.then(()=>{
              this.follow=this.one
              
            })
            .catch((err)=>{this.error=err.message}) ;
          },
          
        // edit_tracker(tracker_id){
        //     this.$router.push({name:"edit_tracker" ,params:{ tracker_id:tracker_id}})
        // },

        // delete_tracker(){
        //     fetchfunction(`${url}/api/tracker/${this.TrackerData.tracker_id}`,{
        //         method:"DELETE",
        //     },true).then(()=>{
        //         console.log("Data Deleted successfully")
                
        //     })
        //     .catch((err)=>{
        //         alert(err.message)
        //     })
        // }
    },
    computed:{

    },
    beforeMount(){
        // console.log(this.Blogdata);
        fetchfunction(`${url}/api/check_follow/${this.f2_user_id}`,{
          method:"GET",
        }
        ,true)
        .then((data)=>{
            // console.log(data)
            this.follow = data.follow;
            
            // console.log(this.post_data)
        })
        .catch((err)=>
        {this.error=err.message

        })},
    mounted(){
        // fetch(`${url}/api/chexk_follow/${this.blog_id}`, {
        //   method: "GET",
        //   headers: {
        //     "Content-Type": "application/json",
        //     "Authentication-Token":store.getters.get_token,
        //   },
        // })
        //   .then((response) => {
        //     if (!response.ok) {
        //       throw new Error("Failed to fetch blog image.");
        //     }
        //     return response.blob();
        //   })
        //   .then((imageBlob) => {
        //     this.blog_image = URL.createObjectURL(imageBlob);
        //   })
        //   .catch((error) => {
        //     console.error(error);
        //     this.error = true;
        //   });
      },


}