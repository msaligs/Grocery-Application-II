import Header from "./components/header.js"
import router from "./router.js"

new Vue({
    el: "#app",
    components: {
        "my-header": Header
    },
    template: `
    <div>
        <my-header :key="has_changed"/>
        <router-view  class="m-3" />
    </div>
    
    `,
    router,
   
    data(){
        return {
            has_changed:false,
        }
    },
    watch: {
        $route(to, from){
            this.has_changed = !this.has_changed
        }
    }
    
})
