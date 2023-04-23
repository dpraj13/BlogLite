import store from "./vuex/index.js"


async function fetchfunction(url,init_obj,auth){

    if(auth === undefined){
        auth = false
    }
    if(auth == true){
         if(init_obj.headers === undefined){
            init_obj.headers = {
                "Authentication-Token":store.getters.get_token}

            }else{
                init_obj.headers["Authentication-Token"] = store.getters.get_token

            }
    }



    const response = await fetch(url,init_obj).catch(() =>{
        throw Error("Network Error: " + url)
    })
    if (response){
        if (response.ok){
            // console.log(response)
            const data = await response.json().catch(()=>{
                throw Error("backend response can not be converted into json")
            })
            if(data){
                //console.log(data)
                return data
            }}
        else{

            throw Error(response.statusText)
            }
    } 
}
    
export default fetchfunction