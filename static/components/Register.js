export default {
  template: `
  <div class="container login-container" style="max-width:500px">
  <div class="card card-login mx-auto">
    <div class="card-body bg-light m-3">
      <h3 class="text-center">Register</h3>
      <form>
        <p class="text-danger">{{ error }}</p>
        <div class="form-group" style="margin-bottom:20px">
          <label for="name">Full Name</label>
          <input type="text" class="form-control" id="name" v-model="cred.name" placeholder="Enter your Full Name">
        </div>
        <div class="form-group" style="margin-bottom:20px">
          <label for="username">Username</label>
          <input type="text" class="form-control" id="username" v-model="cred.username" placeholder="Enter your Username">
        </div>
        <div class="form-group" style="margin-bottom:20px">
          <label for="email">Email</label>
          <input type="email" class="form-control" id="email" v-model="cred.email" placeholder="Enter your Email">
        </div>
        <div class="form-group" style="margin-bottom:20px">
          <label for="password">Password</label>
          <input type="password" class="form-control" id="password" v-model="cred.password" placeholder="Enter your password">
        </div>
        <div class="form-group" style="margin-bottom:20px">
          <label for="mobile">Mobile</label>
          <input type="text" class="form-control" id="mobile" v-model="cred.mobile" placeholder="Enter your Mobile Number">
        </div>
        <div class="form-group" style="margin-bottom:20px">
          <label for="address">Address</label>
          <input type="text" class="form-control" id="address" v-model="cred.address" placeholder="Enter your Address">
        </div>
        <div class="form-group" style="margin-bottom:20px">
          <label for="city">City</label>
          <input type="text" class="form-control" id="city" v-model="cred.city" placeholder="Enter your City">
        </div>
        <div class="form-group" style="margin-bottom:20px">
          <label for="state">State</label>
          <input type="text" class="form-control" id="state" v-model="cred.state" placeholder="Enter your State">
        </div>
        <div class="form-group" style="margin-bottom:20px">
          <label for="pin">PIN</label>
          <input type="text" class="form-control" id="pin" v-model="cred.pin" placeholder="Enter your PIN">
        </div>
        <!-- Add other fields as needed -->

        <div class="form-group" style="margin-bottom:20px">
          <label for="role">Role</label>
          <select class="form-control" id="role" v-model="cred.role" >
            <option value="user">User</option>
            <option value="manager">Store Manager</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary btn-block" @click="register">Register</button>
        <!-- Link to login page -->
        <router-link to="/login" class="btn btn-link btn-block">Login</router-link>
      </form>
    </div>
  </div>
</div>

  `,
  data() {
    return {
      cred: {
        name: "",
        username: "",
        email: "",
        password: "",
        mobile: "",
        address: "",
        city: "",
        state: "",
        pin: "",
        role: "user",
      },
      msg: localStorage.getItem("msg") || null,
    };
  },
  methods: {
    async register() {
      // console.log(JSON.stringify(this.cred));
      const res = await fetch("/api/user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.cred),
        })
      if (!res.ok) {
        throw new Error(`Something is not good, status: ${res.status}`)
      }
      const data = await res.json();
      this.msg = data.message;
      localStorage.setItem("error", this.error);
      this.$router.push("/login");

     
    },
  },
};
