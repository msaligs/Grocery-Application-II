export default {
    template: `
        <div class="container mt-5">
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-body">
                            <h3 class="card-title text-center mb-4">Order Confirmation</h3>
                            
                            <!-- Congratulations Message -->
                            <div class="mb-3">
                                <h5 class="text-success fw-semibold">Congratulations!</h5>
                                <p>Thank you for placing your order. Your order is confirmed, and order no is<span class="fw-semibold"> {{ order_id }}</span></p>
                            </div>

                            <!-- Order Details -->
                            <div class="mb-3">
                                <h5>Order Details</h5>


                                <table class="table table-bordered table-striped text-center">
                                    <thead>
                                        <tr>
                                            <th>S No</th>
                                            <th>Name</th>
                                            <th>Brand</th>
                                            <th>Quantity</th>
                                            <th>Price</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(item, index) in order_details" :key=index>
                                            <td>{{ index +1 }}</td>
                                            <td>{{ item.product_name }}</td>
                                            <td>{{ item.brand }}</td>
                                            <td>{{ item.quantity }}</td>
                                            <td>{{ item.product_price }}</td>
                                            <td>{{ item.total_price }}</td>
                                        </tr>
                                        <tr>
                                            <td colspan="2"></td>
                                            <td colspan="2"><strong>Total Amount: </strong></td>
                                            <td colspan="2"><strong>{{ total_amount }} </strong></td>
                                            
                                            <td></td>
                                        </tr>
                            
                                    </tbody>
                                </table>


                            </div>



                            <!-- Delivery Address -->
                            <div class="mb-3">
                                <h5>Delivery Address</h5>
                                <p class="ps-5">
                                   <span class="fw-semibold">Name: </span> {{ user_address.name }}<br>
                                   <span class="fw-semibold">Email: </span> {{ user_address.email }}<br>
                                   <span class="fw-semibold">Mobile: </span> {{ user_address.mobile }}<br>
                                   <span class="fw-semibold">Address: </span>{{ user_address.address }}, {{ user_address.city }},<br>
                                   <span class="ps-5"> {{ user_address.state }} - {{ user_address.pin }} </span>
                                </p>
                            </div>


                            <!-- Continue Shopping Button -->
                            <div class="text-center">
                                <a href="/" class="btn btn-secondary">Continue Shopping</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    props: ['user_address', 'order_id', 'order_details', 'total_amount'],

    data() {
        return {
            'token': localStorage.getItem('auth-token'),
           
            error: null
        };
    },
};
