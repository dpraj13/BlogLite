import fetchfunction from "../fetchfunc.js"
import url from "../config.js"
import store from "../vuex/index.js"
import connection from "../components/connection.js";

export default{
    template:`
    <div>
    <div class="container-fluid">
        <div class="row">
           
            <div class="col-8 offset-3" id="main" >
            <h1 style="color: black; margin: 1%; text-align: center;">  Your Followers</h1>
               
                
                <div>
                    
                        <connection   v-for="(item,index) in follow_id_array" :f2_user_id="item" :username=username_array[index] :key="index" />         
                    
                    
                </div>
                  
                
            
            </div>
        </div>
    </div>
</div>
    `,
    components: {
       
        connection:connection,
        
        

    },
    data(){
        return{
            
            error: false,
            followed_by_array:[],
            usersID:store.state.id,
            user_name:store.state.username,
        }
    },
    methods: {
        
            
        
    },
    computed:{
        username_array(){
            const usernames = [];
            this.followed_by_array.forEach(user => {
                usernames.push(user.username);
                
            });
            
            return usernames;
         },
         follow_id_array(){
            const ids = [];
            this.followed_by_array.forEach(user => {
                ids.push(user.id);
               
            });
           
            return ids;
         }
        
            

    },
  
   
    mounted(){
//------------------Request1----------------------------------------------------
            const request1= fetchfunction(`${url}/api/follow`,{
                method:"GET",
            },true)
            request1.then((data)=>{
                this.followed_by_array=data;
                // console.log(this.followed_array);
                // console.log(data);          
            })
            .catch((err)=>{this.error=err.message}) ; 
        
       }
    

}