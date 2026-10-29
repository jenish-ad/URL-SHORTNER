import { createRoute } from "@tanstack/react-router";

import DashboardPage from "../pages/DashboardPage";
import { checkAuth } from "../utils/helper";
import { rootRoute } from "./routeTree";

export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
  beforeLoad: checkAuth,
});
