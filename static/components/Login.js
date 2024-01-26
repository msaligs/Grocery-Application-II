export default {
    template: `
      </div>
        <div class="container login-container" style="max-width:500px">
            <div class="card card-login mx-auto">
                <div class="card-body bg-light m-3">
                    <h3 class="text-center">Login</h3>
                    <form>
                        <p class="text-info">{{msg}}</p>
                        <div class="form-group" style="margin-bottom:20px">
                            <label for="email">Email</label>
                            <input type="email" class="form-control" id="email" v-model="cred.email" placeholder="Enter your Email">
                        </div>
                        <div class="form-group" style="margin-bottom:20px">
                            <label for="password">Password</label>
                            <input type="password" class="form-control" id="password" v-model="cred.password" placeholder="Enter your password">
                        </div>
                        <button type="submit" class="btn btn-primary btn-block" @click="login">Login</button>
                        <router-link to="/register" class="btn btn-link btn-block">Register</router-link>
                    </form>
                </div>
            </div>

        </div>
      </div>
    `,
    data() {
      return {
        cred: {
          email: null,
          password: null,
        },
        msg: this.$route.query.msg || null,
      };
    },
  
    methods: {
      async login() {
        if (!this.cred.email) {
          this.msg = "Email Address Not Provided.";
          return;
        }
        if (!this.cred.password) {
          this.msg = "Password not Provided.";
          return;
        }
  
        const res = await fetch('/user-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.cred),
        });

        const data = await res.json();
        if (res.ok) {
          localStorage.setItem('auth-token', data.token);
          localStorage.setItem('roles', data.roles);  
          // this.$router.push({ name: 'home', path: '/' });
          
          // if (data.roles.includes('admin')) {
          //   const redirect = this.$route.query.redirect || '/adminHome';
          //   this.$router.push(redirect);
          // } else if (data.roles.includes('manager')) {
          //   const redirect = this.$route.query.redirect || '/ManagerHome';
          //   this.$router.push(redirect);
          // // } else if (data.roles.includes('stud')) {
          // //   this.$router.push({ name: 'StudHome', path: '/StudHome' });
          // } else {
            const redirect = this.$route.query.redirect || '/';
            this.$router.push(redirect);
          // }
        } else {
          this.msg = data.message;
        }
      }
    },
  };
  