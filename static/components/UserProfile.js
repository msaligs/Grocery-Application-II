export default {
    template: `
      <div class="container mt-5">
        <p>{{ msg }}</p>
        <div class="card mx-auto" style="max-width: 400px;">
        <h5 class="card-title text-center">User Details</h5>
          <img :src="user.profile_image || 'https://placehold.co/30'" width="80px" height="80px" class="card-img-top  rounded-circle" alt="User Image">
          <div class="card-body">
            <ul class="list-group list-group-flush">
              <li class="list-group-item"><strong>Name:</strong> {{ user.name }}</li>
              <li class="list-group-item"><strong>Username:</strong> {{ user.username }}</li>
              <li class="list-group-item"><strong>Email:</strong> {{ user.email }}</li>
              <li class="list-group-item"><strong>Mobile:</strong> {{ user.mobile || 'N/A' }}</li>
              <li class="list-group-item"><strong>Address:</strong> {{ user.address || 'N/A' }}</li>
              <li class="list-group-item"><strong>City:</strong> {{ user.city || 'N/A' }}</li>
              <li class="list-group-item"><strong>State:</strong> {{ user.state || 'N/A' }}</li>
              <li class="list-group-item"><strong>PIN:</strong> {{ user.pin || 'N/A' }}</li>
              <!-- Add other fields as needed -->
            </ul>

            <!-- Update Profile Modal -->
            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#updateProfileModal">
              Update Profile
            </button>
            
            <!-- Modal -->
            <div class="modal fade" id="updateProfileModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="updateProfileModalLabel" aria-hidden="true">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h1 class="modal-title fs-5" id="updateProfileModalLabel">Update Profile</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                    <form>
                      <!-- Add fields with user data prepopulated -->
                      <div class="mb-3">
                        <label for="updateName" class="form-label">Name</label>
                        <input type="text" class="form-control" id="updateName" v-model="user.name">
                      </div>
                      <div class="mb-3">
                        <label for="updateMobile" class="form-label">Mobile</label>
                        <input type="text" class="form-control" id="updateMobile" v-model="user.mobile">
                      </div>
                      <div class="mb-3">
                        <label for="updateAddress" class="form-label">Address</label>
                        <input type="text" class="form-control" id="updateAddress" v-model="user.address">
                      </div>
                      <div class="mb-3">
                        <label for="updateCity" class="form-label">City</label>
                        <input type="text" class="form-control" id="updateCity" v-model="user.city">
                      </div>
                      <div class="mb-3">
                        <label for="updateState" class="form-label">State</label>
                        <input type="text" class="form-control" id="updateState" v-model="user.state">
                      </div>
                      <div class="mb-3">
                        <label for="updatePin" class="form-label">PIN</label>
                        <input type="text" class="form-control" id="updatePin" v-model="user.pin">
                      </div>
                      <!-- Add other fields as needed -->
            
                      <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="submit" class="btn btn-primary" data-bs-dismiss="modal" @click="updateDetails">Save Changes</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
            


          </div>
        </div>
      </div>
    `,
    data() {
      return {
        token: localStorage.getItem('auth-token') || null,
        user: {},
        msg:null,
      };
    },
    async mounted() {
      try {
        const res = await fetch('/api/user', {
          method: 'GET',
          headers: {
            'Authentication-Token': this.token
          },
        });
  
        if (!res.ok) {
          throw new Error(`Something went wrong, status: ${res.status}`);
        }
  
        const data = await res.json();
        this.user = data; // Set the user data in the component's data
        console.log(this.user)
      } catch (error) {
        // Handle error accordingly, e.g., redirect to login page
        this.$router.push('/login');
      }
    },
    methods: {
        async updateDetails() {
            try {
                const res = await fetch('/api/user', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.token
                    },
                    body: JSON.stringify(this.user)
                })
                if (!res.ok) {
                    throw new Error(`Something went wrong, status: ${res.status}`)
                }
                const data = await res.json()
                this.user = data
                this.msg = res.message
                // this.$router.push('/UserProfile')
                window.location.reload();
            } catch (error) {
                console.error(error)
            }
        }
      },
    
  };
  