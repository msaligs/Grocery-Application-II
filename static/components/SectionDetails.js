export default{
    template: `
    <div class="container">
      <div class="row">
      <button type="button" class="btn btn-primary my-3" @click="getSections" style="width:200px;" data-bs-toggle="modal" data-bs-target="#productsearchModal"> Search Product </button>

  <!-- model code goes here -->
  <!-- Define the modal for each section -->

  <div class="modal" id="productsearchModal">
      <!-- ... Modal content as in your original code ... -->
      <div class="modal-dialog">
          <div class="modal-content">
              <div class="modal-header">
                  <h5 class="modal-title">choose filters</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                    <!-- -----------------------------form to apply search filter -----------------------   -->
              <form >
              <div class="row mb-3">
                <div class="col-md-6">
                  <label for="name" class="form-label">Name:</label>
                  <input type="text" class="form-control" v-model="filters.name" id="name">
                </div>
        
                <div class="col-md-6">
                  <label for="brand" class="form-label">Brand:</label>
                  <input type="text" class="form-control" v-model="filters.brand" id="brand">
                </div>
              </div>
        
              <div class="row mb-3">
                <div class="col-md-6">
                  <label for="price" class="form-label">Maximum Price:</label>
                  <input type="number" class="form-control" v-model="filters.price" id="price">
                </div>
        
            <!--    <div class="col-md-6">
                  <label for="manufacturing_date" class="form-label">Manufacturing Date:</label>
                  <input type="date" class="form-control" v-model="filters.manufacturing_date" id="manufacturing_date">
                </div>
              </div>
        
              <div class="row mb-3">
                <div class="col-md-6">
                  <label for="expiry_date" class="form-label">Expiry Date:</label>
                  <input type="date" class="form-control" v-model="filters.expiry_date" id="expiry_date">
                </div>
        -->
                <div class="col-md-6" v-if="role == 'admin' ">
                  <label for="stock" class="form-label">Stock:</label>
                  <select class="form-select" id="stock" v-model="filters.stock">
                    <option value="100plus">More than 100</option>
                    <option value="100minus">Less than 100</option>
                    <option value="10minus">Less than 10</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>
        
              <div class="row mb-3">
                <div class="col-md-6">
                  <label for="section_id" class="form-label">Section:</label>
                  <select class="form-select" id="section_id" v-model="filters.section_id">
                    <!-- Add options for sections -->
                    <option value="">Based on Section</option>
                    <option v-for="section in sections" :key="section.id" :value="section.id">{{ section.name }}</option>

                  </select>
                </div>
        
            <!--    <div class="col-md-6" v-if="role == 'manager' ">
                  <label for="manager_id" class="form-label">Manager:</label>
                  <input type="radio" id="manager_id" name="manager_id" value="1" v-model="filters.manager_id">
                </div>
                -->
              </div>
            </form>


                  
              </div>

              <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>

                  <!-- Use a link with proper URL for the Delete action -->
                  <button type="button" class="btn btn-primary" @click="searchProducts" data-bs-dismiss="modal">apply filters</button>

          </div>
      </div>
  </div>
</div>


<!-- model codes ends here -->
      
    </div>
    <div class="row justify-content-center">
      <p v-if="products.length ==0"> No Product Found </p>

      <div class="col-sm-6 col-md-4 col-lg-3" v-else v-for="(prod, index) in products" :key="index">

        <div class="card h-100 border shadow-sm" style="border: 1px solid #3a773f;">
          <img src="https://placehold.co/200" class="card-img-top" alt="image" style="object-fit: cover; height: 200px;">
          <div class="card-body" style="background-color:#d0b045; color: #333333;">
            <h5 class="card-title">{{ prod.name }}</h5>
            <p class="card-text">
              <strong>Brand:</strong> {{ prod.brand }}<br>
              <strong>Manufacturing Date:</strong> {{ prod.manufacturing_date }}<br>
              <strong>Expiration Date:</strong> {{ prod.expiry_date }}<br>
              <strong>Price:</strong> {{ prod.price }}
            </p>
          </div>
          <div class="card-footer m-0 p-1" style="background-color:#2c3e50;">
              <div class="d-flex justify-content-center align-items-center" v-if="role !== 'manager' && role !== 'admin'" >
                <div v-if="prod.stock > 0">
                  <label for="quantity" class="text-light">Quantity:</label>
                  <input type="number" id="quantity" class="form-control" style="width:60px"  v-model="selectedQuantity[prod.id]" min="1" max="10" />
              
                  <button class="btn btn-primary" v-if="cartItems.includes(prod.id)" @click="addToCart(prod.id)">Update</button>
                  <button class="btn btn-primary" v-else @click="addToCart(prod.id)">Add to Cart</button>
                </div>
                <div v-else>
                  <p class="text-danger">Out of Stock</p>
                </div>
              </div>

              <div v-if="role == 'manager'">
                            
              <!--    <button class="btn btn-danger" s>Delete</button>
                  <button type="button" class="btn btn-secondary" data-bs-toggle="modal" :data-bs-target="'#updatesectionmodel' + index"> Update </button>
              -->
              </div>
          </div>
        </div>
      </div>
    </div>



    <nav aria-label="Page navigation example" class="mt-4">
      <ul class="pagination justify-content-center">

        <li class="page-item" v-for="page in total_pages" :key="page">
          <!--<button class="page-link" @click.prevent="fetchPage(page)" >{{ page }}</button> -->
          <button class="page-link" :class="{ 'active': page === current_page }" @click.prevent="fetchPage(page)">{{ page }}</button>

        </li>

      </ul>
    </nav>
  </div>
    `,



    data() {
        return {
          products: [],
          selectedQuantity: {},
          token: localStorage.getItem('auth-token') || null,
          role: localStorage.getItem('roles') || null,
          msg: localStorage.getItem('msg') || null,
          section_name: '',
          cartItems :[],

          // pagination
          total_pages: 0,
          current_page: 1,

          // storing the applied filters
          filters: {
            name: '',
            brand: '',
            price: '',
            manufacturing_date: '',
            expiry_date: '',
            section_id:'',
            
            manager_id: '',
            stock: '',
            active: '',
          },
          //  section name filter form
          sections: [],
          
        };
      },

      
    props: ['section_id'],
    async created() {
      try {
        const params = new URLSearchParams({
          section_id: this.section_id,
          page: 1
        });
    
        const response = await fetch(`/api/products?${params.toString()}`);
    
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        const data = await response.json();
    
        this.products = data.products;
        this.total_pages = data.total_pages;
    
        if (this.products.length > 0) {
          this.products.forEach(prod => {
            this.$set(this.selectedQuantity, prod.id, 1);
          });
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }

        if(this.role !== 'admin' && this.role !== 'manager') {
            if (this.token){
              const res = await fetch('/get_cart_details',{
                headers:{
                  'Authentication-Token': this.token
                }
              })
              if(!res.ok){
                throw Error("something is not right there")
              }
              const data = await res.json()
              // console.log(data)
              this.cartItems = data.map(item => item.product_id)

            }
        }
    },
    methods: {
      async addToCart(product_id) {
         // if user is logged in make a get request to /add_to_cart with product_id
          // else redirect to login page
          if (this.token) {
            try {
            const quantity = this.selectedQuantity[product_id] || 1;
            const res =  await fetch(`/add_to_cart/${product_id}/${quantity}`, {
              method: 'GET',
              headers: {
                'Authentication-Token': this.token,
              },
            })

              if (!res.ok) {
                throw new Error(`Something went wrong, status: ${res.status}`);
              }
              const data = await res.json();
              if (!this.cartItems.includes(product_id)) {
                this.cartItems.push(product_id);
                 }
              this.msg = data.message;
              alert(data.message);
            }
            catch(error) {
              console.error(error);
              this.msg = error;
            };

          } else {
            this.$router.push({ name: 'login', query: { redirect: this.$route.fullPath } });
          }
      },

      async fetchPage(page) {
        const sectionId = this.section_id;
        // Make a fetch request to get products based on section_id
        fetch(`/api/products?section_id=${sectionId}&page=${page}`)
            .then(response => response.json())
            .then(data => {
            // Update the products data in your component
            this.products = [...data.products];
            this.total_pages = data.total_pages;
            this.current_page= page;
            this.products.forEach(prod => {
              this.$set(this.selectedQuantity, prod.id, 1);
            });
            })
            .catch(error => {
            console.error('Error fetching products:', error);
            });
      },
      async getSections() {
        try {
          const res = await fetch('/api/sections', {
            headers: {
              'Authentication-Token': this.token,
            },
          });

          if (!res.ok) {
            throw new Error(`Something went wrong, status: ${res.status}`);
          }

          const data = await res.json();
          this.sections = [...data];
        } catch (error) {
          console.error(error);
          this.msg = error;
        } 

      },

      async searchProducts() {
        try {
          // generate url based on the values in filters
          let url;
          if (this.token){
            url = '/api/secure_products?';
          }
          else{
            url = '/api/products?';
          }
          for (const [key, value] of Object.entries(this.filters)) {
            if (value) {
              url += `${key}=${value}&`;
            }
            }
          url += `page=1&per_page=100`;

          const res = await fetch(url, {
            method: 'get',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': this.token,
            },
          });

          if (!res.ok) {
            throw new Error(`Something went wrong, status: ${res.status}`);
          }
          if(res.status === 204){
            alert("No products found")
          }
          const data = await res.json();
          this.products = [...data.products];
          this.total_pages = data.total_pages;
          this.products.forEach(prod => {
            this.$set(this.selectedQuantity, prod.id, 1);
          });
        } catch (error) {
          console.error(error);
          this.msg = error;
        }


  }
    }

};