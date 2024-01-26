export default{
    template: `
        <div class="container mt-5">
            <h2>Order History</h2>
            <div v-if="orders.length === 0">
                <p>No orders found.</p>
            </div>
            <div v-else>
                <div v-for="order in orders" :key="order.order_id" class="card mb-3">
                    <div class="card-body">
                        <h5 class="card-title">Order ID: {{ order.order_id }}</h5>
                        <p class="card-text">Order Date: {{ order.order_date }}</p>
                        <p class="card-text">Total Amount: {{ order.total_amount.toFixed(2) }}</p>
                        <button type="button" class="btn btn-primary" @click="orderItems(order.order_id)" data-bs-toggle="modal" data-bs-target="#orderDetailsModal">
                            View Order Details
                        </button>
                    </div>
                </div>
                

                <!-- Modal -->
                <div class="modal fade" id="orderDetailsModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="orderDetailsModalLabel" aria-hidden="true">
                  <div class="modal-dialog modal-lg"> <!-- Added modal-lg for a larger modal -->
                    <div class="modal-content">
                      <div class="modal-header">
                        <h1 class="modal-title fs-5" id="orderDetailsModalLabel">Order Details</h1>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                      </div>
                      <div class="modal-body">
                
                        <!-- Display order items for the selected order -->
                        <div class="table-responsive"> <!-- Added table-responsive for small screens -->
                          <table class="table table-striped table-bordered">
                            <thead>
                              <tr>
                                <th>Product Id</th>
                                <th>Product Name</th>
                                <th>Brand</th>
                                <th>Manufacturing Date</th>
                                <th>Expiry Date</th>
                                <th>Quantity</th>
                                <th>Price</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="(item,index) in OrderItems" :key="index">
                                <td>{{ index +1 }}</td>
                                <td>{{ item.prod_name }}</td>
                                <td>{{ item.brand }}</td>
                                <td>{{ item.manufacturing_date }}</td>
                                <td>{{ item.expiry_date }}</td>
                                <td>{{ item.quantity }}</td>
                                <td>{{ item.price }}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                
                      </div>
                      <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
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
      orders: [],
      OrderItems: [],
      msg: null,
    };
  },
  async mounted() {
    try {
      const res = await fetch('/order_history', {
        method: 'GET',
        headers: {
          'Authentication-Token': this.token,
        },
      });

      if (!res.ok) {
        throw new Error(`Something went wrong, status: ${res.status}`);
      }

      const data = await res.json();
      this.orders = data;
    } catch (error) {
      console.error(error);
      this.$router.push('/login');
    }
  },

    methods: {
        async orderItems(orderId) {
            try {
                const res = await fetch(`/order_items/${orderId}`, {
                method: 'GET',
                headers: {
                    'Authentication-Token': this.token,
                },
                });

                if (!res.ok) {
                throw new Error(`Something went wrong, status: ${res.status}`);
                }

                const data = await res.json();
                this.OrderItems = data;
            }
        catch (error) {
            this.msg = error;
            // this.$router.push('OrderDetails');
        }
    }
    }

}