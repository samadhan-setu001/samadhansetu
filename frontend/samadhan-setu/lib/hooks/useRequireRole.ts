"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthRole } from "./useAuthRole";
import type { Role } from "../types";

/**
 * Client-side stand-in for the layout-level route guard described in
 * section 10 ("each of the three route groups checks app_metadata.role in
 * a layout-level guard... redirects anyone without the matching role").
 * Swap for a server-side check against the Supabase session once wired up.
 */
export function useRequireRole(role: Role) {
  const { session, ready, logout } = useAuthRole();
  const router = useRouter();

  useEffect(() => {
    if (ready && (!session || session.role !== role)) {
      router.replace(`/${role}/login`);
    }
  }, [ready, session, role, router]);

  return { session, ready, logout };
}
