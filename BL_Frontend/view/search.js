import url from "../config.js"
import fetchfunction from "../fetchfunc.js"
import connection from "../components/connection.js";

export default {
    template: `
    <div>
    <!---    <top_side></top_side> --->
        <div class="container-fluid">
            
            <div class="row">    
                <div class="col-5 offset-4" id="main">
                    <h2 style = "margin-top: 20%;">Search Users</h2>
                    <div class="input-group mb-3">
                        <input v-model=this.text class="form-control" placeholder="Username like" aria-label="Recipient's username" aria-describedby="button-addon2">
                        <button class="btn btn-outline-secondary" type="button" id="button-addon2" @click="search">Search</button>
                        
                    </div>
                    <div>
                       <button type="submit" class="btn btn btn-block btn-outline-success" @click="all"> Give list of all usernames </button> 
                    </div>
                    <ol>
                    
                        <connection   v-for="(item,index) in userid_array" :f2_user_id="item" :username=username_array[index] :key="index" />         
                    </ol>
                </div>
                       
            </div>    
            
            </div>        
        </div>
    </div>`,
    components: {
        connection:connection,
    },

    data(){
        return {
            text:null,
            user_array:[],    
        }
    }, 
    computed:{
         username_array(){
            const usernames = [];
            this.user_array.forEach(user => {
                usernames.push(user.username);
            });
            return usernames;
         },
         userid_array(){
            const user_ids = [];
            this.user_array.forEach(user => {
                user_ids.push(user.id);
            });
            return user_ids;
         }


    } ,
    methods:{
        search(){
            const request_string=`${url}/api/search/${text}`
            // console.log(request_string)
            fetchfunction(request_string,{
                method:"GET",
            },true).then((data)=>{
                
                this.user_array=data;
                this.query=true;
                // console.log(data)
                // console.log(this.user_array)
            })
            .catch((err)=>{
                alert(err.message)
            })
        },
        all(){
            const request_string=`${url}/api/search/${this.text}`
            // console.log(request_string)
            fetchfunction(request_string,{
                method:"GET",
            },true).then((data)=>{
                
                this.user_array=data
                this.query=true;
                // console.log(data)
                // console.log(this.user_array)
            })
            .catch((err)=>{
                alert(err.message)
            })
        },

        cancelled(){
            this.$router.push({name:"my_profile"})
        }

    },
   
}