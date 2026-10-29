import { redirect } from "@tanstack/react-router";

import { getCurrentUser } from "../api/user.api";
import { login } from "../store/slice/authSlice";
import type { queryClient, store } from "../store/store";

export interface RouterContext {
  store: typeof store;
  queryClient: typeof queryClient;
}

export async function checkAuth({
  context,
}: {
  context: RouterContext;
}): Promise<void> {
  try {
    const { user } = await context.queryClient.fetchQuery({
      queryKey: ["currentUser"],
      queryFn: getCurrentUser,
    });
    context.store.dispatch(login(user));
  } catch {
    throw redirect({ to: "/auth" });
  }
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "An unexpected error occurred. Please try again.";
}
