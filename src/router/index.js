import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "chat",
      component: () => import("../views/chat/index.vue"),
    },
    {
      path: "/test",
      name: "test",
      component: () => import("../views/chat/test.vue"),
    },
  ],
});

export default router;
