import url from "../config.js"
import fetchfunction from "../fetchfunc.js"

export default {
    template: `
    <div>
        <top_side></top_side>
        <div class="container-fluid">
            
            <div class="row">
                    
                <div class="col-5 offset-4" id="main">
                    <h2 style = "margin-top: 20%;">Update Profile</h2>
                    <form style = "margin-top: 7%;">
                        <div class="form-outline mb-4" >
                            <label for=""> <h5> Name: </h5> </label> <br>
                            <input class="form-control form-control-lg" type="text" v-model="FormData.Name" placeholder="Name" required/>
                        </div>
    
                        <div class="form-outline mb-4" >
                            <label for=""> <h5>Username: </h5></label> <br>
                            <input class="form-control form-control-lg" type="text" v-model="FormData.username" placeholder=Description required/>
                        </div>
    
                        <div>
                            <button type="submit" class="btn btn-lg btn-block btn-outline-success"  @click="editData"> Update Tracker </button>
                            <button style = "margin-left: 50px;" type="cancle" class="btn btn-lg btn-block btn-outline-danger"  @click="cancelled"> Cancel </button>
                        </div>
                        
                    </form>
                </div>    
            </div>        
        </div>
    </div>`,

    data(){
        return {
            FormData:{
                
                Name:null,
                Description:null,

            },
        }
    },  
    methods:{
        async editData(){
            fetchfunction(`${url}/api/tracker/${this.$route.params.tracker_id}`,{          
                method:"PUT",
                headers:{
                    'Content-Type':'application/json',
                },
                body: JSON.stringify(this.FormData),

            },true).then(()=>{
                
                this.$router.push({name:"home"})
            })
            .catch((err)=>{
                alert(err.message)
            })
            

        },
        cancelled(){
            this.$router.push({name:"home"})
        }

    },
    mounted(){
        
        fetchfunction(`${url}/api/tracker`,{},true)
        .then((data)=>{
            const tracker_details = data.find(c => c.tracker_id == this.$route.params.tracker_id);
            this.FormData.Name = tracker_details.tracker_name
            this.FormData.Description = tracker_details.tracker_description
            console.log("tracker_details",tracker_details)
        })
        .catch((err)=>
        {
        this.error=err.message
        
        });

        
    }
}