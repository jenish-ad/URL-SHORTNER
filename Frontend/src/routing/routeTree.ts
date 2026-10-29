import { createRootRouteWithContext } from "@tanstack/react-router";

import RootLayout from "../RootLayout";
import type { RouterContext } from "../utils/helper";

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});
