import footerComp from "./components/footerComp.js"
import top_side from "./components/top_side.js"
import Main from "./components/Main.js"
import router from "./router/index.js"
import store from "./vuex/index.js"
import home from "./view/home.js"


Vue.component("top_side", top_side)
const vm = new Vue({
    template:`<div>
        
        <Main></Main>
        
    </div>`,
    el: "#app",
    router,
    store,
    data:{
        test: "hello"
    },
    components:{
        footerComp,
        Main,
        home,
        
        
    },

})
