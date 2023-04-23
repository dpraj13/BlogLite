import home from "../view/home.js";
import login from "../view/login.js"
import register from "../view/register.js"
import create_blog from "../view/create_blog.js";
import my_profile from "../view/my_profile.js"
import edit_profile_image from "../view/edit_profile_image.js"
import edit_blog from "../view/edit_blog.js"
import public_user from "../view/public_user.js"
import search from "../view/search.js"
import followed_page from "../view/followed_page.js"
import followed_by from "../view/followed_by.js"
import import_page  from "../view/import_page.js";
// import create_log from "../view/create_log.js";
// import log_page from "../view/log_page.js";
// import edit_tracker from "../view/edit_tracker.js"



const routes = [
    {path: '/', name: 'home', component: home},
    {path: '/login', name: 'login', component: login},
    {path: '/register', name: 'register', component: register},
    {path: '/my_profile', name: 'my_profile', component:my_profile},
    {path: '/create_blog', name: 'create_blog', component: create_blog},
    {path: '/edit_profile_image', name: 'edit_profile_image', component: edit_profile_image},
    {path: '/edit_blog/:post_id', name: 'edit_blog', component: edit_blog},
    {path: '/public_user/:username', name: 'public_user', component: public_user},
    {path: '/search', name: 'search', component: search},
    {path: '/followed_page', name: 'followed_page', component: followed_page},
    {path: '/followed_by', name: 'followed_by', component: followed_by},
    {path: '/import_page', name: 'import_page', component: import_page},

    // {path: '/create_log/:tracker_id', name: 'create_log', component: create_blog},
    // {path: '/log_page/:tracker_type/:tracker_id', name: 'log_page', component: log_page},
    // {path: '/edit_tracker/:tracker_id', name: 'edit_tracker', component: edit_tracker},
    
    // {path: '/edit_log/:tracker_id/:log_id', name: 'edit_log', component: create_log},

    
]
const router = new VueRouter({
    routes,
})

export default router