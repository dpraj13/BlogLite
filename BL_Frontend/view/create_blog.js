import url from "../config.js"
import fetchfunction from "../fetchfunc.js"

export default {
    template: `
    <div>
        <top_side></top_side>
        <div class="container-fluid">
            
            <div class="row">
                    
                <div class="col-5 offset-4" id="main">
                    <h2 style = "margin-top: 20%;">Create Blog</h2>
                    <form style = "margin-top: 7%;">
                        <div class="form-outline mb-4" >
                            <label for=""><h5>Blog Title </h5></label> <br>
                            <input class="form-control form-control-lg" type="text" v-model="FormData.title" placeholder="Blog Title" required/>
                        </div>

                        <div class="form-outline mb-4" >
                            <label for=""><h5>Description </h5></label> <br>
                            <input class="form-control form-control-lg" type="text" v-model="FormData.description" placeholder="Description" required/>
                        </div>

                        <label for=""><h5>Image </h5></label>
                        <div class="input-group mb-3">
                            
                            <input type="file" class="form-control" ref="fileInput"  placeholder="Blog Image"  id="inputGroupFile01">
                        </div>

                        <div class="form-outline mb-4" >
                            <label for=""><h5>Visibility :</h5></label> <br>
                                <select id="type" v-model="FormData.private" class="form-control form-control-lg" required >
                                 <option disabled value="">Please Select</option>
                                    <option value=0>Public</option>
                                    <option value=1>Private</option>
                                   
                            </select>
                        </div>

                       

                        <div>
                            <button type="submit" class="btn btn-lg btn-block btn-outline-success" @click="postData"> Create Blog </button>
                            <button style = "margin-left: 50px;" type="cancle" class="btn btn-lg btn-block btn-outline-danger"  @click="to_home"> Cancel </button>
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
                private:null
            },

        }
    },  
    methods:{
        async postData(){
            // console.log(this.FormData)
            const formData = new FormData();
            formData.append('file', this.$refs.fileInput.files[0]);
            const title = this.FormData.title
            const description =this.FormData.description
            const visibility = this.FormData.private
            if(title && visibility) {
                const request_string=`${url}/api/add_post?title=${title}&description=${description}&private=${visibility}`
                // console.log(request_string)
                fetchfunction(request_string,{
                    method:"POST",
                    body:formData 
    
                },true).then(()=>{
                    
                    window.history.back();
                })
                .catch((err)=>{
                    alert(err.message)
                })

            }
            else{
                alert("Both Title and Visibility must be specified")
            }
            
            

        },
        to_home(){
            this.$router.push({name:"my_profile"})
        }

    },
}