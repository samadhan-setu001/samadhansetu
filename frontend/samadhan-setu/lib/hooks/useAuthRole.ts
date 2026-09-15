"use client";

import { useCallback, useEffect, useState } from "react";
import type { Role } from "../types";

export interface Session {
  role: Role;
  id: string; // wallet_id | authority_id | officer's supabase id
  label: string; // display name / officer ID / authority name
}

const KEY = "samadhansetu.session";

/**
 * Lightweight client-side session, standing in for reading Supabase's
 * `app_metadata.role` claim off the JWT (section 5). Once real Supabase
 * Auth is wired in, replace this with `supabase.auth.getSession()` /
 * `onAuthStateChange`, and read `role` from `session.user.app_metadata`.
 */
export function useAuthRole() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    if (raw) {
      try {
        setSession(JSON.parse(raw));
      } catch {
        /* ignore corrupt session */
      }
    }
    setReady(true);
  }, []);

  const login = useCallback((s: Session) => {
    localStorage.setItem(KEY, JSON.stringify(s));
    setSession(s);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(KEY);
    setSession(null);
  }, []);

  return { session, ready, login, logout };
}
