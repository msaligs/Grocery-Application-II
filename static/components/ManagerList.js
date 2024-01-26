export default{
    template:`
        <div class="container">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th scope="col">S.No</th>
                        <th scope="col">Manager ID</th>
                        <th scope="col">Name</th>
                        <th scope="col">UserName</th>
                        <th scope="col">Email</th>
                        <th scope="col">Mobile No</th>
                        <th scope="col">City</th>
                        <th scope="col">State</th>
                        <th scope="col">PIN </th>
                        <th scope="col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(manager,index) in managers" :key="manager.id">
                        <th scope="row">{{ index + 1}}</th>
                        <td>{{ manager.id }}</td>
                        <td>{{ manager.name }}</td>
                        <td>{{ manager.username }}</td>
                        <td>{{ manager.email }}</td>
                        <td>{{ manager.mobile }}</td>
                        <td>{{ manager.city }}</td>
                        <td>{{ manager.state }}</td>
                        <td>{{ manager.pin }}</td>
                        <td>
                            <button class="btn btn-info" @click="approve(manager.id,index)" v-if="!manager.active">Approve</button>
                        </td>
                    </tr>
                </tbody>
            </table >
        </div >  
    `,
    data(){
        return{
            token:localStorage.getItem('auth-token') || null,
            role:localStorage.getItem('role') || null,
            managers:[],
        }
    },
    async created(){
       const res = await fetch('/get_managers',{
            headers:{
                'Authentication-Token':this.token
            }
       })
       if(!res.ok){
              alert("Something went wrong");
              return;
       }
         const data = await res.json();
        this.managers = data;
    },
    methods:{
        async approve(id,index){
            const res = await fetch(`/approve_manager/${id}`,{
                method:'GET',
                headers:{
                    'Content-Type':'application/json',
                    'Authentication-Token':this.token
                },
            })
            if(!res.ok){
                alert("Something went wrong");
                return;
            }
            const data = await res.json();
            // if(data.status == 'success'){
                console.log(this.managers[index]);
                this.managers[index].active = true;
                // console.log(managers[index]);
                alert("Manager Approved");
                // this.$router.go();
            // }
        }
    }
    
    
    





}