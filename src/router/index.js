import { createRouter, createWebHistory } from "vue-router";
import { routers } from "./router";

const routes = routers;

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;