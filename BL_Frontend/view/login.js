export default{
    template:`


    <div id="login_page">

        <section class="vh-100">
            <div class="container py-5 h-100">
                
                <div class="row d-flex align-items-center justify-content-center h-100">
                    <h1 class="text-center" >Welcome to BlogLite</h1>
                    <div class="col-md-8 col-lg-7 col-xl-6">
                    <img src="icon.png"
                        class="img-fluid" alt="Phone image">
                    </div>
                    <div class="col-md-7 col-lg-5 col-xl-5 offset-xl-1">
                    <h3>Login</h3>
                    <form>
                        <!-- Email input -->
                        <div class="form-outline mb-4">
                            <input type="email"  class="form-control form-control-lg" placeholder="Email address" v-model="user.email" required/>
                        
                        </div>
            
                        <!-- Password input -->
                        <div class="form-outline mb-4">
                            <input type="password"  class="form-control form-control-lg" placeholder="Password" v-model="user.password" required/>
                        
                        </div>
                        <p id = "wrong" class="text-danger" ></p>
                        <!-- Submit button -->
                        <button type="submit" class="btn btn-primary btn-lg btn-block" @click="login(user)">Sign in</button>
            
                        <div class="divider d-flex align-items-center my-4">
                            <p class="text-center fw-bold mx-3 mb-0 text-muted">Don't have an account?</p>
                            <router-link id ="li" :to="{name:'register'}" style="text-decoration: none;">Sign Up</router-link>
                        </div>
                
                
                

    
                    </form>
                </div>
            </div>
            </div>
        </section>
        

    </div>
    
    `,
    data(){
        return{
            user:{
                email:null,
                password:null
            }
        }
    },

    methods:{
        login(user){
            this.$store.dispatch('loginUser',user)

        },
        

    }
}