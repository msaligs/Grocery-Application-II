export default {
    template: `
        <div class="container mt-5">
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-body">
                            <i class="bi bi-arrow-left" @click="$router.go(-1)"></i>
                        <h3 class="card-title text-center mb-4">Cart Details</h3>
                        <div class="text-center" v-if="cart_items.length == 0">

                            <p class="text-info">Your cart is empty.</p>
                        </div>
                        <table class="table table-bordered table-striped text-center" v-if="cart_items.length >0">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(item, index) in cart_items" :key=index>
                                <td>{{ item.product_name }}</td>
                                <td>{{ item.quantity }}</td>
                                <td>{{ item.product_price }}</td>
                                <td>{{ parseFloat((item.quantity * item.product_price).toFixed(2)) }}</td>
                                <td><button class="btn btn-danger btn-sm" @click="removeItemFromCart(item.product_id)">Remove</button></td>
                        </tr>



                        <tr>
                            <td colspan="2"></td>
                            <td><strong>Total Amount: </strong></td>
                            <td><strong>{{ total_amount }} </strong></td>

                            <td></td>
                        </tr>
                    </tbody>
                </table>
                <div class="text-center">

                    <a href="/" class="btn btn-secondary">Continue Shopping</a>


                    <!-- <a href="/place_order" class="btn btn-primary">Place Order</a> -->

                    <button type="button" v-if="cart_items.length >0"  @click="get_user_address" class="btn btn-primary px-5" data-bs-toggle="modal" data-bs-target="#deleteConfirmationModal">
                    Place Order
                </button>

                <!-- model code goes here -->
                <!-- Define the modal for each section -->

                <div class="modal" id="deleteConfirmationModal">
                    <!-- ... Modal content as in your original code ... -->
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Confirm Address</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <p class="mb-0"><strong>Name</strong> : {{ user_address.name }}</p>
                                <p class="mb-0"><strong>Mobile</strong> : {{ user_address.mobile }}, <strong>Email</strong> : {{ user_address.email }}</p>

                                <p class="mb-0"><strong>Address</strong> : {{ user_address.address }}</p>
                                <p class="mb-0"><strong>City</strong> :{{ user_address.city }}, <strong>State</strong> : {{ user_address.state }}</p>
                                <p class="mb-0"><strong>PIN</strong> :{{ user_address.pin }}</p><br>

                                    <p class="text-info"><i>To change the address go to profile and update address.</i></p>

                            </div>

                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>

                                <!-- Use a link with proper URL for the Delete action -->
                                <button type="button" class="btn btn-primary" @click="place_order" data-bs-dismiss="modal">Confirm</button>

                        </div>
                    </div>
                </div>
            </div>


            <!-- model codes ends here -->
        </div>
                        
                        </div>
                    </div >
                </div >
            </div >
        </div >

    `
    ,
    data() {
        return {
            'token': localStorage.getItem('auth-token') || null,
            'msg': localStorage.getItem('msg') || null,
            cart_items: [],
            order_response:{},
            user_address: {
                name: '',
                mobile: '',
                email: '',
                address: '',
                city: '',
                state: '',
                pin: '',
              }
        }
    },
    async created() {
        if (!this.token) {
            this.$router.push({ name: 'login' })
        }
        const res = await fetch('/get_cart_details', {
            headers: {
                'Authentication-Token': this.token
            }
        })
        if (!res.ok) {
            throw new Error(`Something is not good, status: ${res.status}`)
        }
        const data = await res.json()
        this.cart_items = data;
    },

    computed: {
        total_amount() {
            if (!this.cart_items) {
                return 0; // If cart_items is not yet populated, return 0
            }

            // Calculate the total amount by summing up product prices * quantities
            let total =  this.cart_items.reduce((total, item) => {
                return total + (item.product_price * item.quantity);
            }, 0);

            return parseFloat(total).toFixed(2);
        }
    },
    methods: {

        async get_user_address() {
            if (this.cart_items.length > 0) {
                const res = await fetch('/user_address', {
                    headers: {
                        'Authentication-Token': this.token
                    }
                })
                if (!res.ok) {
                    throw new Error(`Something is not good, status: ${res.status}`)
                }
                const data = await res.json()
                this.user_address = data
            }
            else {
                alert("cart is empty");
            }
        },

        // order placing function
        async place_order() {
            try {
              const res = await fetch('/place_order', {
                method: 'GET',
                headers: {
                  'Authentication-Token': this.token
                },
              });
          
              if (!res.ok) {
                throw new Error(`Something is not good, status: ${res.status}`);
              }
          
              if (res.status === 200) {
                const data = await res.json();
                this.order_response = data;
                this.$router.push({
                  name: 'orderConfirmation',
                  params: {
                    user_address: this.user_address,
                    order_id: this.order_response.order_id,
                    order_details: this.order_response.order_details,
                    total_amount: this.order_response.total_amount,
                  },
                });
              }
            } catch (error) {
                console.log(error)
              if (error.response) {
                if (error.response.status === 409) {
                  // Handle conflict error
                  const errorMessage = error.response.data.error;
                  alert(errorMessage);
                } else {
                  // Handle other errors
                  console.error(error.response.data.error);
                  alert('An error occurred1111. Please try again.');
                }
              } else {
                // Handle other errors
                console.error('Error setting up the requesttttt', error.message);
                alert('An error occurred. Please try again.');
              }
            }
          },
          
    
        async removeItemFromCart(product_id) {
            try {
                const res = await fetch(`/remove_from_cart/${product_id}`, {
                    method: 'GET',
                    headers: {
                        'Authentication-Token': this.token,
                    },
                })

                if (!res.ok) {
                    throw new Error(`Something went wrong, status: ${res.status}`);
                }
                const data = await res.json();
                alert(data.message);
                this.$router.go(0)
            }
            catch (error) {
                this.msg = error;
            };
        }
    }
    




}