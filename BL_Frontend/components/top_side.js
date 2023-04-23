import store from "../vuex/index.js"
import fetchfunction from "../fetchfunc.js"
import url from "../config.js"



export default {
    template: `
      <div >
        <div class="container-fluid" style="position: static;">
          <div class="row">
            <div class="col-2 px-1  bg-dark position-fixed" id="sticky-sidebar" style="">
              <div class="nav flex-column flex-nowrap vh-100 overflow-auto text-white p-2">
            <h2 style="color: gold; margin: 10%; text-align: center;" class="h2" >BLOGLITE</h2> 


                <img id="my-pic" :src="P_image" class="img-thumbnail"  alt="">
                <!---<img src="no.png" class="img-fluid" alt="Phone image">--->


                <h2 style="color: white; text-align: center;"></h2>
                <button class="btn btn-outline-warning" style="margin: 10%;" @click="go_to_home">
                  <i class="bi bi-house"></i> 
                  <span class="d-none d-sm-inline-block">My Feed</span>
                </button>
                <button class="btn btn-outline-warning" style="margin: 10%;" @click="go_to_my_profile"> 
                    <i class="bi bi-person"></i> 
                    <span class="d-none d-sm-inline-block"> My Profile</span>
                </button>
                <button class="btn btn-outline-warning" style="margin: 10%;" @click="search"> 
                  <i class="bi bi-search"></i> 
                    <span class="d-none d-sm-inline-block">Search</span>
                </button>
                <button style="margin: 10%;" class="btn btn-outline-warning" @click="logout"> 
                   <i class="bi bi-box-arrow-left"></i>
                     <span class="d-none d-sm-inline-block">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        profile_image: null,
        user_data: null,
        error: false,
      };
    },
    methods: {
      logout() {
        const sure=confirm("Are you sure you want to Logout ?");
        if(sure) {
          this.$store.dispatch("logoutUser");
        }
        
      },
      go_to_home() {
        this.$router.push({ name: "home" });
      },
      go_to_my_profile() {
        this.$router.push({ name: "my_profile" });
      },
      search() {
        this.$router.push({ name: "search" });
      },
    },
    computed:{
       P_image(){
           if (this.profile_image!=null && this.profile_image!="no_image") {
             return this.profile_image
       }
       else{
        return "no.png";
       }
    }
  },
    mounted() {
      fetch(`${url}/api/user/image`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token":store.getters.get_token,
        },
      })
        .then((response) => {
          if (!response.ok) {
            this.profile_image ="no_image";
            // console.log("Response NOT OK");
          }
          
          return response.blob();

        })
        .then((imageBlob) => {
          if(this.profile_image=="no_image"){
            // console.log(this.profile_image)
            this.profile_image ="no_image";
          }
          else{
            this.profile_image = URL.createObjectURL(imageBlob);
          }
          
         
        })
        .catch((error) => {
          console.log(error);
          this.profile_image = null;
          this.error = true;
        });
    },
  };
  