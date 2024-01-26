import Home from "./components/Home.js"
import SectionDetails from "./components/SectionDetails.js"
import Login from "./components/Login.js"
import Register from "./components/Register.js"
import AdminHome from "./components/AdminHome.js"
import ManagerHome from "./components/ManagerHome.js"
import StudHome from "./components/StudHome.js"
import CartDetails from "./components/CartDetails.js"
import orderConfirmation from "./components/orderConfirmation.js"
import UserProfile from "./components/UserProfile.js"
import OrderDetails from "./components/OrderDetails.js"
import ManagerProducts from "./components/ManagerProducts.js"  
import ManagerList from "./components/ManagerList.js" 
import SectionRequest from "./components/SectionRequest.js"

const routes = [
    {name: 'home', path: '/', component: Home},
    {name: 'login', path: '/login', component: Login },
    {name: 'Register', path: '/register', component: Register},
    {name: 'SectionDetails', path: '/SectionDetails/:section_id', component: SectionDetails, props:true},
    {name: 'adminHome', path: '/adminHome', component: AdminHome},
    {name: 'ManagerHome', path: '/ManagerHome', component: ManagerHome},
    {name: 'StudHome', path: '/StudHome', component: StudHome},
    {name: 'CartDetails', path: '/CartDetails', component: CartDetails},
    {name: 'orderConfirmation', path: '/orderConfirmation', component: orderConfirmation, props: true,
        beforeEnter: (to, from, next) => {
            if (from.name !== null) {
            next();
            } else {
                next({ name: 'home' }); // redirect to home page if navigated directly
            }
        }
    },
    {name: 'UserProfile', path: '/UserProfile', component: UserProfile},
    {name: 'OrderDetails', path: '/OrderDetails', component: OrderDetails},
    {name: 'managerProducts', path: '/managerProducts/:manager_id', component: ManagerProducts, props:true},
    {name: 'managerList', path: '/managerList', component: ManagerList},
    {name: 'SectionRequest', path: '/SectionRequest', component: SectionRequest},

    
]



const router = new VueRouter({
    routes,
})

const publicPages = ['home', 'SectionDetails', 'Register']; // Add other public routes here

router.beforeEach((to, from, next) => {
    const is_login = localStorage.getItem('auth-token') || null;

    if (!is_login && !publicPages.includes(to.name) && to.name !== 'login') {
        next({ name: 'login', query: { redirect: from.fullPath } });
    } else {
        next();
    }
});

export default router