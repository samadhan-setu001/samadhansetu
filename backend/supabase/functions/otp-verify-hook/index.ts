import { adminClient, authenticatedUser, audit, fail, json, options } from "../_shared/core.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return options();
  if (req.method !== "POST") return fail("Method not allowed", 405);
  const auth = await authenticatedUser(req); if (auth.error) return auth.error;
  if (["authority", "officer"].includes(auth.user!.app_metadata?.role)) return fail("This endpoint is only for citizens", 403);
  const admin = adminClient();
  const { error: roleError } = await admin.auth.admin.updateUserById(auth.user!.id, { app_metadata: { ...auth.user!.app_metadata, role: "citizen" } });
  if (roleError) return fail(roleError.message, 500);
  const { error } = await admin.from("citizen_wallets").upsert({ wallet_id: auth.user!.id }, { onConflict: "wallet_id", ignoreDuplicates: true });
  if (error) return fail(error.message, 500);
  await audit(admin, "citizen", auth.user!.id, "wallet_initialized", "citizen_wallet", auth.user!.id);
  return json({ wallet_id: auth.user!.id, created: true });
});
