export default {
    template: `
    <div class="container">
    <!-- --------------------------- add product model ------------------------ -->
    <button class="btn btn-warning"data-bs-toggle="modal" @click="getSections" data-bs-target="#NewProductModal">Add New Product</button>

    <!-- model code goes here -->

        <div class="modal" id="NewProductModal">
            <!-- ... Modal content as in your original code ... -->
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add New Product</i></h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                      <select class="form-select" v-model="product.section_id">
                        <option :value="null" selected>Choose Section</option>
                        <option v-for="section in sections" :key="section.id" :value="section.id">{{ section.name }}</option>
                      </select>

                      <label name="name" class="form-label">Product Name</label>
                      <input type="text" class="form-control" id="name" v-model="product.name" required>

                      <label name="brand" class="form-label">Product Brand</label>
                      <input type="text" class="form-control" id="brand" v-model="product.brand" required>

                      <label name="manufacturing_date" class="form-label">Manufacturing Date</label>
                      <input type="date" class="form-control" id="manufacturing_date" v-model="product.manufacturing_date" required>

                      <label name="expiry_date" class="form-label">Expiry Date</label>
                      <input type="date" class="form-control" id="expiry_date" v-model="product.expiry_date" required>

                      <label name="price" class="form-label">Product Price</label>
                      <input type="text" class="form-control" id="price" v-model="product.price" required>

                      <label name="stock" class="form-label">Product Stock</label>
                      <input type="text" class="form-control" id="stock" v-model="product.stock" required>

                      <label name="image_url" class="form-label">Image Url</label>
                      <input type="text" class="form-control" id="image_url" v-model="product.image_url" required>
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>

                        <button type="button" class="btn btn-primary" @click="addProduct" data-bs-dismiss="modal">Confirm</button>

                </div>
            </div>
        </div>
    </div>


    <!-- model codes ends here -->
            <!-- ------------------------------update model ---------------- -->
    <table class="table table-striped">
      <thead>
        <tr>
          <th scope="col">ID</th>
          <th scope="col">Name</th>
          <th scope="col">Brand</th>
          <th scope="col">Manufacturing Date</th>
          <th scope="col">Expiry Date</th>
          <th scope="col">Price</th>
          <th scope="col">Stock</th>
          <th scope="col">Image URL</th>
          <th scope="col">Manager ID</th>
          <th scope="col">Section ID</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(product,index) in products" :key="product.id">
          <th scope="row">{{ index +1 }}</th>
          <td>{{ product.name }}</td>
          <td>{{ product.brand }}</td>
          <td>{{ product.manufacturing_date }}</td>
          <td>{{ product.expiry_date }}</td>
          <td>{{ product.price }}</td>
          <td>{{ product.stock }}</td>
          <td>{{ product.image_url }}</td>
          <td>{{ product.manager_id }}</td>
          <td>{{ product.section_id }}</td>
          <td>
            <button class="btn btn-warning"data-bs-toggle="modal" :data-bs-target="'#updateProductModal' + product.id">Update</button>
            <button class="btn btn-danger" @click="deleteProduct(product.id,index)">Delete</button>


            <!-- ------------------------------update model ---------------- -->

        <!-- model code goes here -->

        <div class="modal" :id="'updateProductModal' + product.id">
            <!-- ... Modal content as in your original code ... -->
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Update Product:  <i>{{ product.name }}</i></h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                      <label name="name" class="form-label">Product Name</label>
                      <input type="text" class="form-control" id="name" v-model="products[index].name" required>

                      <label name="brand" class="form-label">Product Brand</label>
                      <input type="text" class="form-control" id="brand" v-model="products[index].brand" required>

                      <label name="price" class="form-label">Product Price</label>
                      <input type="text" class="form-control" id="price" v-model="products[index].price" required>

                      <label name="stock" class="form-label">Product Stock</label>
                      <input type="text" class="form-control" id="stock" v-model="products[index].stock" required>

                      <label name="image_url" class="form-label">Image Url</label>
                      <input type="text" class="form-control" id="image_url" v-model="products[index].image_url" required>
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>

                        <button type="button" class="btn btn-primary" @click="updateProduct(product.id,index)" data-bs-dismiss="modal">Confirm</button>

                </div>
            </div>
        </div>
    </div>


    <!-- model codes ends here -->
            <!-- ------------------------------update model ---------------- -->
          </td>
        </tr>
      </tbody>
    </table>
  </div>

    `,
    data() {
        return {
            token: localStorage.getItem('auth-token') || null,
            roles: localStorage.getItem('roles') || null,
            msg :localStorage.getItem('msg') || null,
            products: [],
            sections: [],
            product: {
                name: '',
                brand: '',
                manufacturing_date: '',
                expiry_date: '',
                price: '',
                stock: '',
                image_url: '',
                section_id: null,
            },
        };
      },
    props: ['manager_id'],
    async created() {
        const manager_id = this.manager_id;
        let url = `/api/secure_products?manager_id=${manager_id}&`;

        url += `page=1&per_page=200`;
        // Make a fetch request to get products based on section_id
        fetch(url,{
            headers:{
              'Authentication-Token': this.token
            }
          
        })
            .then(response => response.json())
            .then(data => {
            // Update the products data in your component
            this.products = data.products;
            })
            .catch(error => {
            console.error('Error fetching products:', error);
            });
    },



      methods: {
        async updateProduct(productId,index) {
          // Add logic to handle updating product
          const res = await fetch(`/api/secure_products/${productId}`,{
            method:'PUT',
            headers:{
              'Authentication-Token':this.token,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.products[index])
          })
          if(!res.ok){
            throw Error("Something is not good")
          }
          const data = await res.json()
          this.products[index] = data.product
          alert(data.message)
        },
        async deleteProduct(productId,index) {
          // Add logic to handle deleting product
            const res = await fetch(`/api/secure_products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authentication-Token': this.token
                }
            })
            if (!res.ok) {
                throw new Error('Something went wrong');
            }
            const data = await res.json();
            this.products.splice(index, 1);
            alert(data.message)


        },
        async getSections() {
          try {
            const res = await fetch('/api/sections');
  
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
        async addProduct() {
          const res = await fetch('/api/secure_products', {
            method: 'POST',
            headers: {
              'Authentication-Token': this.token,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.product),
          });
          if (!res.ok) {
            if (res.status === 401) {
              alert('You are not authorized to add a product');
            } else if (res.status >= 500) {
              alert('Server error, please try again later ');
            }
            throw new Error('Something went wrong');
          }
          const data = await res.json();
          this.products.push(data.product);
          alert(data.message)
        },
      }



}