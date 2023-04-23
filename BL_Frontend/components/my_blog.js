import fetchfunction from "../fetchfunc.js"
import url from "../config.js"
import store from "../vuex/index.js"

export default {
    template: `
    
        <div class="card">
          
            <h2 class="card-header" align="center">{{this.title}}</h2>
            <div class="card-body " id="card_body" >
                 <img :src="blog_image" class="img-fluid" id="blog_img" alt="" align="center">
                 
            </div>
                <h5 class="card-header" align="center">Description : {{this.description}}</h5>
                <h5 class="card-header" align="center">Date Created: {{this.date}}</h5>
                <h5 v-if="isprivate" class="card-header" align="center">Visibility: Private</h5>
                <h5 v-else class="card-header" align="center">Visibility: Public</h5>
                
              <div class="container" style=" margin: 1%; text-align: center;" >
                <div class="btn-group" role="group" aria-label="Basic mixed styles example" >
                    <button type="button" class="btn btn-danger btn-md" @click ="edit_blog" ><i class=" bi bi-pen"></i>
                    <span class="d-none d-sm-inline-block"> Edit Blog Details</span></button>

                    <button type="button" class="btn btn-warning btn-md" @click="delete_blog(); " > <i class="bi bi-trash"></i> 
                    <span class="d-none d-sm-inline-block">  Delete </span></button>

                    <button type="button" class="btn btn-success btn-md" @click = "export_pdf" > <i class="bi bi-file-earmark-pdf"></i>
                    <span class="d-none d-sm-inline-block">Download PDF </span> </button>
                </div>
            </div>
            
        </div>
    `,
    props: ["blog_id","myProp"],
    data(){
        return {
            post_data:null,
            blog_image:null,
            post_id:null,
            title:null,
            description:null,
            date:null,
            private:null,
        }
    },
    methods:{
      edit_blog(){
            this.$router.push({name:"edit_blog" ,params:{ post_id:this.post_id}})
        },
      delete_blog(){
        const sure=confirm("Are you sure you want to delete this Post?");
        if(sure){
          
          fetchfunction(`${url}/api/post/${this.post_id}`,{
            method:"DELETE",
               },true).then(()=>{
          this.$router.push({name:"my_profile"});
          // alert("Deleted successfully")
          location.reload();
            
        })
        .catch((err)=>{
            alert(err.message)
            alert('Failed to delete task', 'error')
        })
        }
        
      },
      async export_pdf(){
        //dear CHATGPT complete this method
        const thisurl = url;
        try {
          const response = await fetch(`${thisurl}/api/export/${this.post_id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": store.getters.get_token,
            },
          });
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          const pdf_name=this.title+".pdf"
          link.setAttribute('download', pdf_name);
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (error) {
          console.error(error);
          alert(error.message);
        }
      
      },
        
    },
    computed:{
            isprivate(){
              if(this.private==1){
                return true;
              }
              else{
                return false;
              }
            },

    },
    beforeMount(){
        // console.log(this.Blogdata);
        fetchfunction(`${url}/api/post/${this.blog_id}`,{}
        ,true)
        .then((data)=>{
            this.post_data = data;
            this.post_id=data.id
            this.title = data.title;
            this.description = data.description;
            const dateString = data.date;
            const dateObject = new Date(dateString);
            const formattedDate = dateObject.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            this.date = formattedDate;
            this.private=data.private;
            // console.log(this.post_id)
        })
        .catch((err)=>
        {this.error=err.message

        })
      },
    mounted(){
        fetch(`${url}/api/image?post_id=${this.blog_id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token":store.getters.get_token,
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to fetch blog image.");
            }
            return response.blob();
          })
          .then((imageBlob) => {
            this.blog_image = URL.createObjectURL(imageBlob);
          })
          .catch((error) => {
            console.error(error);
            this.error = true;
          });
      },


}