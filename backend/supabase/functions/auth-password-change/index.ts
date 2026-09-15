import { adminClient, authenticatedUser, fail, json, options } from "../_shared/core.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return options();
  if (req.method !== "POST") return fail("Method not allowed", 405);
  const auth = await authenticatedUser(req); if (auth.error) return auth.error;
  const role = auth.user!.app_metadata?.role;
  if (role !== "authority" && role !== "officer") return fail("Forbidden", 403);
  const { password } = await req.json();
  if (typeof password !== "string" || password.length < 12) return fail("Password must be at least 12 characters");
  const admin = adminClient();
  const { error } = await admin.auth.admin.updateUserById(auth.user!.id, { password, user_metadata: { ...auth.user!.user_metadata, must_reset_password: false } });
  return error ? fail(error.message, 400) : json({ ok: true });
});
