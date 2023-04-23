export default {
    
    template : `<div>  
    <top_side v-if="this.$store.state.loggedin"></top_side>
    <router-view> </router-view> 
    </div>`
}