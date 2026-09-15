import { createClient, SupabaseClient, User } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

export const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});
export const fail = (message: string, status = 400) => json({ error: message }, status);
export const options = () => new Response("ok", { headers: corsHeaders });

export function adminClient(): SupabaseClient {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function authenticatedUser(req: Request): Promise<{ user?: User; error?: Response }> {
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return { error: fail("Missing bearer token", 401) };
  const client = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await client.auth.getUser();
  return error || !data.user ? { error: fail("Invalid session", 401) } : { user: data.user };
}

export function requireRole(user: User, role: "citizen" | "authority" | "officer"): Response | undefined {
  return user.app_metadata?.role === role ? undefined : fail("Forbidden", 403);
}

export function validLocation(lat: unknown, long: unknown): boolean {
  return typeof lat === "number" && typeof long === "number" && Number.isFinite(lat) && Number.isFinite(long) && lat >= -90 && lat <= 90 && long >= -180 && long <= 180;
}

export function requestPath(req: Request): string[] {
  const marker = "/functions/v1/";
  const part = new URL(req.url).pathname.split(marker)[1] ?? "";
  return part.split("/").filter(Boolean);
}

export async function audit(admin: SupabaseClient, actorType: string, actorId: string | null, action: string, entityType: string, entityId: string | null, metadata: Record<string, unknown> = {}) {
  const { error } = await admin.from("audit_log").insert({ actor_type: actorType, actor_id: actorId, action, entity_type: entityType, entity_id: entityId, metadata });
  if (error) console.error("audit write failed", error.message);
}

export async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hmac(value: string): Promise<string> {
  const secret = Deno.env.get("HMAC_SECRET");
  if (!secret) throw new Error("HMAC_SECRET is not configured");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
