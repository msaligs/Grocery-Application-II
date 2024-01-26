export default {
    template:`
        <div>
            <p class="text-danger">{{error}}</p>
            Hello from Instructor
        </div>
        `,
    data(){
        return {
            error: this.$route.query.error || null
        }
    },
    beforeRouteUpdate(to, from, next) {
        this.error = to.query.error || null;
        next();
    }
}