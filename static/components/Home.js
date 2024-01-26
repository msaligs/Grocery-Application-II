export default{
    template: `

        <div>
            <div class="container mt-4">
            <!----------------------------------------- Filter Dropdown ---------------------------->
            <div class="row" v-if="role == 'admin'">
                <div class="col-md-6">
                    <label for="filterDropdown" class="form-label">Filter by Role:</label>
                    <select class="form-select" v-model="selectedFilter" @change="applyFilter">
                        <option value="null">Apply Filter </option>
                        <option value="true">Active Sections</option>
                        <option value="false">Deactive Sections</option>
                    </select>
                </div>

            </div>

            <div class="row" v-if="role !== 'admin' && role !== 'manager' ">
                <div class="col-md-6">
                    <label for="sectionName" class="form-label">Search Section </label>
                    <input type="text" class="form-control" id="sectionName" placeholder="Enter Section Name" v-model="searchSection">
                    <button class="btn btn-primary mt-2" @click="searchSectionByName">Search</button>
                </div>

            </div>

            <!------------------------------------------------------ Create New Section ----------------------------------->
           <div class="row justify-content-center" v-if="role == 'admin' || role == 'manager'">
            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createsectionmodel"> Create New Section </button>

            <div class="modal" id="createsectionmodel">
                    <!-- ... Modal content as in your original code ... -->
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Create New Section</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <label name="name" class="form-label">Section Name</label>
                                <input type="text" class="form-control" id="name" v-model="createSection.name" required>
                                <label name="image_url" class="form-label">Image Url</label>
                                <input type="text" class="form-control" id="image_url" v-model="createSection.image_url" required>
                            </div>

                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>

                                <!-- Use a link with proper URL for the Delete action -->
                                <button type="button" class="btn btn-primary" @click="request_create_section" data-bs-dismiss="modal">Confirm</button>

                        </div>
                    </div>
                </div>
            </div>
            </div>


            <!-- model codes ends here --------------------------->





            <!------------------------------------------------------ Sections Display ----------------------------------->
            <div class="row justify-content-center">
                <div class="col-sm-6 col-md-4 col-lg-3" v-for="(section,index) in sections" :key="index">
                <div class="card p-1 m-2" style="width:300px">
                    <img src="https://placehold.co/250x150" class="card-img-top" alt="...">
                    <div class="card-body">
                        <router-link :to="{ name: 'SectionDetails', params: { section_id: section.id }}" v-if="role !== 'admin' && role !== 'manager' ">
                            <h5 class="card-title p-4 fw-bold">{{ section.name }}</h5>
                        </router-link>
                        <h5 class="card-title p-4 fw-bold" v-if="role == 'admin' || role == 'manager' ">{{ section.name }}</h5>
                    </div>
                    <div class="card-footer m-0 p-1 justify-content-center align-items-center"" style="background-color:#2c3e50;" >

                        <div v-if="role == 'admin'">
                            <button class="btn btn-primary" @click="activate_section(section.id,index)" v-if="activeSections.includes(section.id)" >Activate</button>
                            <button class="btn btn-danger" @click="request_delete_section(section.id,index)" v-if="! activeSections.includes(section.id)" >Delete</button>
                            <button type="button" class="btn btn-secondary" data-bs-toggle="modal" :data-bs-target="'#updatesectionmodel' + index" v-if="!activeSections.includes(section.id)"> Update </button>
                        </div>
                            
                        <div v-if="role == 'manager'">
                            
                            <button class="btn btn-danger" @click="request_delete_section(section.id,index)">Delete</button>
                            <button type="button" class="btn btn-secondary" data-bs-toggle="modal" :data-bs-target="'#updatesectionmodel' + index"> Update </button>
                        
                        </div>
                        <!--               ------------------------------------------------------------         -->

                <!----------------------------------------- model code goes here ---------------------------------------------->

                <div class="modal" :id="'updatesectionmodel' + index">
                    <!-- ... Modal content as in your original code ... -->
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Update Section</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <label name="name" class="form-label">Section Name</label>
                                <input type="text" class="form-control" id="name" v-model="sections[index].name" required>
                                <label name="image_url" class="form-label">Image Url</label>
                                <input type="text" class="form-control" id="image_url" v-model="sections[index].image_url" required>
                            </div>

                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>

                                <!-- Use a link with proper URL for the Delete action -->
                                <button type="button" class="btn btn-primary" @click="request_update_section(section.id,index)" data-bs-dismiss="modal">Confirm</button>

                        </div>
                    </div>
                </div>
            </div>


            <!-- model codes ends here -->
                        
                        <!--               ------------------------------------------------------------         -->






                    </div>
                </div>
                </div>
            </div>
            </div>
        </div>
    `,
    data() {
        return {
            sections: [],
            sectionToUpdate: {
                name: '',
                image_url: '',
            },
            msg: localStorage.getItem('msg') || null,
            'token': localStorage.getItem('auth-token') || null,
            role: localStorage.getItem('roles') || null,
            selectedFilter: null,
            activeSections: [],
            createSection: {
                name: '',
                image_url: '',
            },
            searchSection: '',
        }
    },
    async mounted() {
        try {
            const res = await fetch('/api/sections')

            if (!res.ok) {
                throw new Error(`Something is not good, status: ${res.status}`)
            }
            const data = await res.json()
            this.sections = data;
            this.$set(this, 'sections', data);
            this.activeSections = data.filter(item => item.active).map(item => item.id);
        }
        catch (error) {
            this.msg = error.message
        }

    },
    methods: {
        async applyFilter() {
            if (this.role == 'admin') {
                let url;
                if (this.selectedFilter == 'true') {
                    url = '/api/secure_sections?active=true'
                    this.activeSection = true
                }
                else if (this.selectedFilter == 'false') {
                    url = '/api/secure_sections?active=false'
                    this.activeSection = false
                }
                else {
                    url = '/api/secure_sections'
                    this.activeSection = true
                }
                try {
                    const res = await fetch(url, {
                        headers: {
                            'Authentication-Token': this.token,
                        }
                    })

                    if (!res.ok) {
                        throw new Error(`Something is not good, status: ${res.status}`)
                    }
                    const data = await res.json()
                    this.activeSections = data.filter(item => !item.active).map(item => item.id);
                    // this.sections = data;
                    // this.$set(this, 'sections', data);
                    this.sections = [...data];
                }
                catch (error) {
                    this.msg = error.message
                }
            }
        },

        async activate_section(section_id, index) {
            if (this.role == 'admin') {
                try {
                    const res = await fetch(`/activate/section/${section_id}`, {
                        headers: {
                            'Authentication-Token': this.token
                        }
                    })
                    if (!res.ok) {
                        throw new Error(`Something is not good, status: ${res.status}`)
                    }
                    const data = await res.json()
                    // this.$set(this.sections, index, { ...this.sections[index], active: true });
                    this.index += 1;
                    this.activeSections = this.activeSections.filter(id => id !== section_id);


                    alert(data.message)

                }
                catch (error) {
                    this.msg = error.message
                }
            }
        },

        async request_delete_section(section_id) {
            if (this.role == 'admin' || this.role == 'manager') {
                try {
                    const res = await fetch(`/request/delete/section/${section_id}`, {
                        headers: {
                            'Authentication-Token': this.token
                        }
                    })
                    if (!res.ok) {
                        throw new Error(`Something is not good, status: ${res.status}`)
                    }
                    const data = await res.json()
                    alert(data.message)
                    this.$router.go(0);
                }
                catch (error) {
                    this.msg = error.message
                }
            }
        },

        async request_update_section(section_id,index) {
            if (this.role == 'admin' || this.role == 'manager') {
                try {
                    const res = await fetch(`/request/update/section/${section_id}`, {
                        method: 'POST',
                        headers: {
                            'Authentication-Token': this.token,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(this.sections[index])
                    });
                    
                    if (!res.ok) {
                        throw new Error(`Something is not good, status: ${res.status}`)
                    }
                    const data = await res.json()
                    alert(data.message)
                    this.$router.go(0);
                }
                catch (error) {
                    this.msg = error.message
                }
            }
        },
        async request_create_section() {
            if (this.role == 'admin' || this.role == 'manager') {
                try {
                    const res = await fetch('/request/create/section', {
                        method: 'POST',
                        headers: {
                            'Authentication-Token': this.token,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(this.createSection)
                    });
                    if (!res.ok) {
                        throw new Error(`Something is not good, status: ${res.status}`)
                    }
                    const data = await res.json()
                    alert(data.message)
                    this.$router.go(0);
                }
                catch (error) {
                    this.msg = error.message
                }
            }
        },
        async searchSectionByName() {
            if (this.role !== 'admin' && this.role !== 'manager') {
                try {
                    const res = await fetch(`/api/sections?name=${this.searchSection}`)
                    if (!res.ok) {
                        throw new Error(`Something is not good, status: ${res.status}`)
                    }
                    if(res.status == 204){
                        alert('Section Not Found')
                    }
                    const data = await res.json()
                    this.sections = data;
                    this.$set(this, 'sections', data);
                }
                catch (error) {
                    this.msg = error.message
                }
            }
        }




    }

}