import fetchfunction from "../fetchfunc.js"
import url from "../config.js"
import router from "../router/index.js"

const store = new Vuex.Store({

    state:{
        loggedin : localStorage.getItem("token") ? true : false,
        id:localStorage.getItem("id") ,
        username:localStorage.getItem("username") ,
        name:localStorage.getItem("name"),
        email:localStorage.getItem("email"),
        

    },
    getters:{
        get_token(state){
            if(state.loggedin === true){
                return localStorage.getItem("token")
            }else{
                return null
            }
        }

    },
    mutations:{
        login(state){
            state.loggedin = true
            router.push({name:"home"})
        },
        logout(state){
            state.loggedin = false
            router.push({name:"login"})
        },
        setUserData(state, userData) {
            state.id = userData.id
            state.username = userData.username
            state.name = userData.name
            state.email = userData.email
            // console.log(state.id, state.username, state.name, state.email)
          },
        // setUserData(userData) {
        //     const id=userData.id
        //     localStorage.setItem("id",id)
        //     localStorage.setItem("username",userData.username)
        //     localStorage.setItem("name",userData.name)
        //     localStorage.setItem("email",userData.email)
        //     // state.id = userData.id
        //     // state.username = userData.username
        //     // state.name = userData.name
        //     // state.email = userData.email
        //     // console.log(state.id, state.username, state.name, state.email)
        //   }


    },
    actions:{
        async loginUser(context,user){
        const response1 = fetchfunction(`${url}/login?include_auth_token`,{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
            },
            body:JSON.stringify({email:user.email,password:user.password})
        })
        
        response1.then((data)=>{
            // console.log(data)
            const token = data.response.user.authentication_token
            localStorage.setItem("token",token)
            context.dispatch('fetchUserData',token)
            context.commit('login')
           
        })   
        .catch((err)=>{   
            // console.log("below is error")
            // console.log(err)
            alert("wrong credentials")
            // document.getElementById("wrong").innerHTML = "Wrong Credentials";
        })
        

        },
        async fetchUserData(context,token) {
            // const token = context.getters.get_token
            // console.log(token)
            if (!token) {
              return
            }
        
            try {
              const response = await fetchfunction(`${url}/api/user`, {
                headers: {
                    "Authentication-Token":token
                }
              })
        
              const userData = await response
            //   console.log(userData)
              context.commit('setUserData', userData)
            } catch (error) {
              console.error(error)
            }
          },


        logoutUser(context){
            localStorage.removeItem("token")
            localStorage.removeItem("id")
            localStorage.removeItem("name")
            localStorage.removeItem("username")
            localStorage.removeItem("email")

            context.commit('logout')
            


        }
    },
})

export default store