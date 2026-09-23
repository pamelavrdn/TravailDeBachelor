import { createRouter, createWebHistory } from "vue-router";
import HomePage from "./components/HomePage.vue";
import ProductList from "./components/ProductList.vue";
import ProductDetails from "./components/ProductDetails.vue";

const routes = [
  {
    path: "/",
    name: "HomePage",
    component: HomePage,
  },
  {
    path: "/:gender/categories/:categoryId/products",
    name: "CategoryProducts",
    component: ProductList,
    props: true,
  },
  {
    path: "/:gender/categories/:categoryId/products/:productId",
    name: "ProductDetails",
    component: ProductDetails,
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
