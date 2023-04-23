import url from "../config.js"
import fetchfunction from "../fetchfunc.js"

export default {
    template: `
    <div>
        <top_side></top_side>
        <div class="container-fluid">
            
            <div class="row">
                    
                <div class="col-5 offset-4" id="main">
                    <h2 style = "margin-top: 20%;">Upoad Image</h2>
                    <form style = "margin-top: 7%;">        
                       <input type="file" class="form-control" ref="fileInput"  placeholder="Profile Image"  id="inputGroupFile01">
                    </form><br />
                    <button type="submit"  class="btn btn-primary btn-md btn-block" @click="save">SAVE</button>
                    <button type="submit"  class="btn btn-danger btn-md btn-block" @click="cancelled">CANCEL</button>
                </div>
                    
                </div>    
            </div>        
        </div>
    </div>`,

    data(){
        return {
        }
    },  
    methods:{
        async save(){
            console.log(this.FormData)
            const formData = new FormData();
            formData.append('file', this.$refs.fileInput.files[0]);
            const request_string=`${url}/api/user/image`
            console.log(request_string)
            fetchfunction(request_string,{
                method:"PUT",
                body:formData 
            },true).then(()=>{
                
                this.$router.push({name:"my_profile"});
                location.reload(); 
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