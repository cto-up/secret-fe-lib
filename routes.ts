import { type Component } from "vue";
import { type RouteRecordRaw } from "vue-router";

export function secretRoutes(MainLayout: Component): RouteRecordRaw {
  return {
    path: "/admin/secrets",
    component: MainLayout,
    children: [
      {
        path: "",
        component: () =>
          import("core-fe-lib/components-shadcn/layouts/PassthroughLayout.vue"),
        children: [
          {
            path: "",
            name: "admin-secrets",
            component: () => import("./components/SecretsAdminPage.vue"),
            meta: { requiresAuth: true, adminOnly: true },
          },
        ],
      },
    ],
  };
}
