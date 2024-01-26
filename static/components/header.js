export default {
    template: `
    <div class="container-fluid" >
        <div class="row">
            <div class="container-fluid d-flex justify-content-between align-items-center">
                <!-- Website Title -->
                <a class="navbar-brand align-middle ps-5 bg-light" >
                    <img src="https://placehold.co/50" alt="Logo" width="50" height="50"
                        class="d-inline-block align-top">
                    <span class="fs-1 fw-semibold ps-5">IITM Grocery Store</span>
                </a>

                <!-- Icons and Buttons -->
                <div class="d-flex align-items-center" style="list-style-type: none;">
 
                        <!-- Cart Icon -->
                        <li href="#" class="me-3 btn " v-if="is_login && $route.name !== 'CartDetails' && role == 'user'">
                            <router-link class="btn btn-primary" to="/CartDetails">
                                <i class="bi bi-cart"></i>Cart
                            
                            </router-link>
                                                     
                        </li>   

                        <!-- Profile Icon -->
                        
                        <li class="nav-item dropdown me-3" v-if="is_login">

                            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="bi bi-person-circle"></i>
                            </a>
                                <ul class="dropdown-menu p-3 lh-lg">
                                    <li>
                                        <router-link class="nav-link active" aria-current="page" to="/UserProfile">
                                            My Profile
                                        </router-link>
                                    </li>
                                    <li v-if="role == 'user'">
                                        <router-link class="nav-link active" aria-current="page" to="/OrderDetails">
                                            Order History
                                        </router-link>
                                    </li>
                                    <li>
                                        <hr/>
                                        <button class="nav-link" @click="logout">Logout</button>
                                    </li>
                                </ul>

                        </li>

                        <!-- Login/Logout Button -->
                        <li class="nav-item" v-if="!is_login && $route.name !== 'login'">
                            <router-link class="btn btn-primary" to="/login">Login</router-link>
                        </li>

                </div>
            </div>
        </div>

        <div class="row" >
            <nav class="navbar navbar-expand-md navbar-light " :class="{'bg-danger': role == 'admin','bg-warning': role == 'manager','bg-primary': role == 'user','bg-secondary': role == null}">
                <div class="container-fluid">
                    <a class="navbar-brand" >SRM</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                        aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>

                    <div class="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                            <!-- Your list items go here -->
                            <li class="nav-item">
                                <router-link class="nav-link active" aria-current="page" to="/">Home</router-link>
                            </li>

                            <li class="nav-item" v-if="role == 'admin' || role == 'manager' ">
                                <router-link class="nav-link active" aria-current="page" :to="{ name: 'SectionDetails',params :{section_id:1}}">Products</router-link>
                            </li>

                            <li class="nav-item" v-if="role == 'manager' ">
                                <router-link class="nav-link active" aria-current="page" :to="{ name: 'managerProducts',params :{manager_id:-1}}"> MyProducts</router-link>
                            </li>

                            <li class="nav-item" v-if="role == 'admin' ">
                                <router-link class="nav-link active" aria-current="page" :to="{ name: 'managerList'}"> Managers</router-link>
                            </li>
                            <li class="nav-item" v-if="role == 'admin' ">
                                <router-link class="nav-link active" aria-current="page" :to="{ name: 'SectionRequest'}">Sections Request</router-link>
                            </li>

                        <!--    <li class="nav-item dropdown" v-if="role == 'admin'">
                                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
                                    aria-expanded="false">
                                    Manager
                                </a>
                                <ul class="dropdown-menu">
                                    <li>
                                        <router-link class="nav-link active" aria-current="page" to="/managerList">
                                            All Managers
                                        </router-link>
                                    </li>
                                    <li>
                                        <router-link class="nav-link active" aria-current="page" to="/managerList">
                                        InActive Managers
                                        </router-link>
                                    </li>

                                </ul>
                            </li> -->
                        </ul>

                    <!--    <form class="d-flex" role="search">
                            <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
                            <button class="btn btn-outline-success" type="submit">Search</button>
                        </form>-->
                    </div>
                </div>
            </nav>
        </div>
    </div>

  `,
    data() {
        return {
            is_login: localStorage.getItem('auth-token') || null,
            role: localStorage.getItem('roles') || null,
            products: [],
        }
    },

    methods: {
        logout() {
            localStorage.removeItem('auth-token')
            localStorage.removeItem('roles')
            // this.$router.replace('/')
            window.location.href = '/';
        },
        // navigateToCart() {
        //     this.$router.push('CartDetails'); 
        // }
    },
   

}