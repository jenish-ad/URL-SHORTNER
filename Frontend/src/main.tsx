import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import "./index.css";
import { authRoute } from "./routing/auth.route";
import { dashboardRoute } from "./routing/dashboard";
import { homePageRoute } from "./routing/homepage";
import { rootRoute } from "./routing/routeTree";
import store, { queryClient } from "./store/store";

const routeTree = rootRoute.addChildren([homePageRoute, authRoute, dashboardRoute]);

const router = createRouter({ routeTree, context: { queryClient, store } });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element was not found.");
}

createRoot(root).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </Provider>,
);
