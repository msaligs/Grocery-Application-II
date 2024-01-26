export default {
    template:`
        <div class="text-info">
            <p class="text-danger">{{error}} </p>    
            Hello from Student DashBoard
        </div>
        `,
    data() {
        return {
            error: this.$route.query.error || null
        }
    },
    beforeRouteUpdate(to, from, next) {
        this.error = to.query.error || null;
        next();
    }
}