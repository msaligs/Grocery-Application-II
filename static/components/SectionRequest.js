export default {
    template: `
    <div class="container">
    <p class="alert alert-success" v-if="msg">{{msg}}</p>
        <table class="table table-striped">
            <thead>
            <tr>
                <th scope="col">S.No</th>
                <th scope="col">Request Type</th>
                <th scope="col">Section ID</th>
                <th scope="col">Name</th>
                <th scope="col">Image URL</th>
                <th scope="col">Manager ID</th>
                <th scope="col">Reason</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
            </tr>
            </thead>
            <tbody>
               <tr v-for="(request,index) in requests" :key="request.id" :class="{'table-danger':request.status === 'Rejected','table-success':request.status === 'Approved','table-primary':request.status === 'Pending'}">
                <th scope="row">{{ index +1 }}</th>
                <td><h5>
                        <span :class="{'badge text-bg-danger':request.request_type === 'Delete','badge text-bg-success':request.request_type === 'New',
                        'badge text-bg-secondary':request.request_type === 'Update'}">
                        {{ request.request_type }}</span>
                </h5></td>

                <td>{{ request.section_id }}</td>
                <td>{{ request.name }}</td>
                <td>{{ request.image_url }}</td>
                <td>{{ request.manager_id }}</td>
                <td>{{ request.reason }}</td>
                <td>{{ request.status }}</td>
                <td>
                    <button class="btn btn-primary" @click="approveRequest(request.id,index)" v-if="request.status == 'Pending'">Approve</button>
                    <button class="btn btn-danger" @click="rejectRequest(request.id,index)" v-if="request.status == 'Pending'">Reject</button>
                </td>
                </tr>
            </tbody>
        </table>
    </div>



    `,
    data() {
        return {
            requests: [],
            token: localStorage.getItem('auth-token') || null,
            role: localStorage.getItem('roles'),
            msg:localStorage.getItem('msg'),
        }
    },
    async created() {
        if (this.token) {
            const res = await fetch('/get_section_requests', {
                headers: {
                    'Authentication-Token': this.token
                }
            })
            if (!res.ok){
                throw Error(res.statusText)
            }
            const data = await res.json()
            // this.requests = data
            this.requests = data.sort((a, b) => a.status === 'Pending' ? -1 : 1);
            console.log(this.requests)
        }
    },
    methods:{
        async approveRequest(id,index){
            const res = await fetch(`/approve_section_request/${id}`, {
                method: 'GET',
                headers: {
                    'Authentication-Token': this.token
                },
            })
            if (!res.ok){
                throw Error(res.statusText)
            }
            const data = await res.json()
            this.requests[index] = 'Approved'
            this.msg = data.message
            localStorage.setItem('msg',this.msg)
            alert(this.msg)
        },

        async rejectRequest(id,index){
            const res = await fetch(`/reject_section_request/${id}`, {
                method: 'GET',
                headers: {
                    'Authentication-Token': this.token
                },
            })
            if (!res.ok){
                throw Error(res.statusText)
            }
            const data = await res.json()
            this.requests[index].status = 'Rejected'
            this.msg = data.message
            localStorage.setItem('msg',this.msg)
            alert(this.msg)
        }


    }
}