export const routers = [
  {
    path: "/",
    name: "editor",
    component: () => import("@/views/Editor/Index.vue"),
  },
];