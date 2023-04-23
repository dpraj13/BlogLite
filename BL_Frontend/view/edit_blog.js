import url from "../config.js"
import fetchfunction from "../fetchfunc.js"

export default {
    template: `
    <div>
        <top_side></top_side>
        <div class="container-fluid">
            
            <div class="row">
                    
                <div class="col-5 offset-4" id="main">
                    <h2 style = "margin-top: 20%;">Update Blog Details</h2>
                    <form style = "margin-top: 7%;">
                        <div class="form-outline mb-4" >
                            <label for=""> <h5>Title: </h5> </label> <br>
                            <input class="form-control form-control-lg" type="text" v-model="FormData.title" placeholder="Blog Title" required/>
                        </div>
    
                        <div class="form-outline mb-4" >
                            <label for=""> <h5>Description: </h5></label> <br>
                            <input class="form-control form-control-lg" type="text" v-model="FormData.description" placeholder=Description required/>
                        </div>
                        <div class="form-outline mb-4" >
                            <label for=""><h5>Visibility :</h5></label> <br>
                                <select id="type" v-model="FormData.private" class="form-control form-control-lg" required >
                                 <option disabled value="">Please Select</option>
                                    <option value=0>Public</option>
                                    <option value=1>Private</option>
                                   
                            </select>
                        </div>
                        
                            <h5 >Upoad Image</h5>
                                    
                            <input type="file" class="form-control" ref="fileInput"  placeholder="blog Image"  id="inputGroupFile01">
                            <br />
                            
                        
    
                        <div>
                            <button style = "margin-left: 50px; margin-top:10px;"type="submit" class="btn btn-md btn-block btn-outline-success"  @click="editData"> Update Blog </button>
                            <button style = "margin-left: 50px; margin-top:10px;" type="cancle" class="btn btn-md btn-block btn-outline-danger"  @click="cancelled"> Cancel </button>
                        </div>
                        
                    </form>
                </div>    
            </div>        
        </div>
    </div>`,

    data(){
        return {
            FormData:{
                
                title:null,
                description:null,
                private:null,

            },
            post_id:null,
        }
    },  
    methods:{
        async editData(){
            if(this.FormData.title)
            {const request1=fetchfunction(`${url}/api/post/${this.post_id}`,{          
                method:"PUT",
                headers:{
                    'Content-Type':'application/json',
                },
                body: JSON.stringify(this.FormData),

            },true)
            request1.then(()=>{
                if(this.$refs.fileInput.files[0]){
                    const formData = new FormData();
                formData.append('file', this.$refs.fileInput.files[0]);
                const request_string=`${url}/api/image?post_id=${this.post_id}`
                // console.log(request_string)
                const request2=fetchfunction(request_string,{
                    method:"PUT",
                    body:formData 
                },true)
                request2.then(()=>{
                    this.$router.push({name:"my_profile"});
                    location.reload(); 
                })
                .catch((err)=>{
                    alert(err.message)
                })
                     
                }
                else{
                    this.$router.push({name:"my_profile"});
                }


            })
            .catch((err)=>{
                alert(err.message)
            })
            
                   
        }
           
        else{
                
                    alert("Title Must be provided")
                
            }
                   

        },
        cancelled(){
            this.$router.push({name:"my_profile"})
        }

    },
    mounted(){
        fetchfunction(`${url}/api/post/${this.$route.params.post_id}`,{}
        ,true)
        .then((data_)=>{
            this.FormData = data_;
            this.post_id=data_.id
            // console.log(this.post_id)
        })
        .catch((err)=>
        {this.error=err.message

        })
        
    }
}