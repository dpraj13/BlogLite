import fetchfunction from "../fetchfunc.js"
import url from "../config.js"
import store from "../vuex/index.js"

export default {
    template: `
    
        <div class="card" >
            
            <router-link :to="{ name: 'public_user', params: { username:this.username } }">
                          <h2 class="card-header" align="center"   ><button class="btn btn-outline-dark btn-md" type="button" >{{this.username}}</button> 
                          </h2> 
                          
            </router-link>
            <h2 class="card-header" align="center">{{this.title}}</h2>
            <div class="card-body"  id="card_body">
                 <img :src="blog_image" class="img-fluid" id="blog_img" alt="" >
                 
            </div>
                <h5 class="card-header" align="center">Description : {{this.description}}</h5>
                <h5 class="card-header" align="center">Date Created: {{this.date}}</h5>
                <h5 class="card-header" align="center" >
                <button class="btn btn-outline-danger btn-md" @click = "export_pdf"> <i class="bi bi-file-earmark-pdf"></i> Download PDF</button>
                </h5>
                
               

        </div>
    `,
    
    props: ["blog_id","myProp"],
    data(){
        return {
            post_data:null,
            username:null,
            title:null,
            description:null,
            date:null,
            blog_image:null,
        }
    },
    methods:{
      async export_pdf(){
        //dear CHATGPT complete this method
        const thisurl = url;
        try {
          const response = await fetch(`${thisurl}/api/export/${this.blog_id}`, {
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
        
    },
    beforeMount(){
        // console.log(this.Blogdata);
        fetchfunction(`${url}/api/free_post/${this.blog_id}`,{}
        ,true)
        .then((data)=>{
            // console.log(data)
            this.title = data.title;
            this.description = data.description;
            const dateString = data.date;
            const dateObject = new Date(dateString);
            const formattedDate = dateObject.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            this.date = formattedDate;
            this.username=data.username;
            // console.log(this.post_data)
        })
        .catch((err)=>
        {this.error=err.message

        })},
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