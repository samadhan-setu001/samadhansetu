import { adminClient, authenticatedUser, audit, fail, json, options } from "../_shared/core.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return options();
  if (req.method !== "POST") return fail("Method not allowed", 405);
  const auth = await authenticatedUser(req); if (auth.error) return auth.error;
  if (["authority", "officer"].includes(auth.user!.app_metadata?.role)) return fail("This endpoint is only for citizens", 403);
  const admin = adminClient();
  const body = await req.json().catch(() => ({}));
  const walletAddress = body?.wallet_address || auth.user!.id;
  const phone = body?.phone || auth.user!.phone || null;

  const { error: roleError } = await admin.auth.admin.updateUserById(auth.user!.id, { app_metadata: { ...auth.user!.app_metadata, role: "citizen" } });
  if (roleError) return fail(roleError.message, 500);

  const { error } = await admin.from("citizen_wallets").upsert(
    { wallet_id: walletAddress, wallet_address: walletAddress, phone: phone },
    { onConflict: "wallet_id" }
  );
  if (error) console.warn("citizen_wallets hook upsert note:", error.message);

  await audit(admin, "citizen", auth.user!.id, "wallet_initialized", "citizen_wallet", walletAddress, { wallet_address: walletAddress, phone });
  return json({ wallet_id: walletAddress, created: true });
});
