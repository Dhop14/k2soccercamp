import { getRouteApi } from "@tanstack/react-router";

import type { RegistrationStatus } from "@/lib/registration-status.server";

const rootRoute = getRouteApi("__root__");

export function useRegistrationStatus(): RegistrationStatus {
  return rootRoute.useLoaderData();
}
