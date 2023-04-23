import fetchfunction from "../fetchfunc.js"
import url from "../config.js"

export default{
    template:
    `<div>
    <section class="vh-100">
    <div class="container py-5 h-100">
        
        <div class="row d-flex align-items-center justify-content-center h-100">
            <h1 class="text-center" >Welcome to BlogLite</h1>
            <div class="col-md-8 col-lg-7 col-xl-6">
            <img src="icon.png"
                class="img-fluid" alt="Phone image">
            </div>
            <div class="col-md-7 col-lg-5 col-xl-5 offset-xl-1">
            <h3>Sign Up</h3>
            <form>
                <!-- Email input -->
                <div class="form-outline mb-4">
                <input type="text"  class="form-control form-control-lg"   v-model="form_data.name" placeholder="Name" required/>
                
                </div>
    
                <!-- Username input -->
                <div class="form-outline mb-4">
                <input type="text"  class="form-control form-control-lg" placeholder="Choose Unique Username"  v-model="form_data.username" required/>

                </div>
                
                <div class="form-outline mb-4">
                <input type="email"  class="form-control form-control-lg" placeholder="Email address" v-model="form_data.email" required/>
                
                </div>

                <!-- Password input -->
                <div class="form-outline mb-4">
                <input type="password" id="form1Example23" class="form-control form-control-lg" placeholder="Password" v-model="form_data.password" required/>
                
                </div>
                <p id = "exist" class="text-danger" ></p>
                <!-- Submit button -->
                <button type="submit" class="btn btn-primary btn-lg btn-block" @click="register">Sign Up</button>

    
                <div class="divider d-flex align-items-center my-4">
                <p class="text-center fw-bold mx-3 mb-0 text-muted">Already have an account?</p>
                <router-link id ="li" :to="{name:'login'}" style="text-decoration: none;">Login</router-link>
                </div>
                
            </form>
        </div>
    </div>
    </div>
</section>

    </div>`,
    data(){
        return{
            form_data:{
                name:null,
                username:null,
                email:null,
                password:null,
            }
        }
    },
    methods:{
        register(){
            const res = fetchfunction(`${url}/api/user/register`,{

                method:"POST",
                headers:{
                    'Content-Type':'application/json',
                },
                body: JSON.stringify(this.form_data)},false)


                //this.$router.push({name:"login"})

                res
                .then((data)=>{
                    
                    this.$router.push({name:"login"})

                })
                .catch((err)=>{
                    document.getElementById("exist").innerHTML = "Account already exist";
                    console.log(err)

                })


        }

    }

}