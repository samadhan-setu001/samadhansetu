import { adminClient, authenticatedUser, audit, fail, json, options, requireRole } from "../_shared/core.ts";

const temporaryPassword = () => `${crypto.randomUUID().slice(0, 8)}!V`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return options();
  if (req.method !== "POST") return fail("Method not allowed", 405);
  const auth = await authenticatedUser(req); if (auth.error) return auth.error;
  const denied = requireRole(auth.user!, "authority"); if (denied) return denied;
  const authorityId = auth.user!.id; const body = await req.json(); const { name, role, domain_id } = body;
  if (!name || !domain_id) return fail("name and domain_id are required");
  const admin = adminClient();
  const { data: authority } = await admin.from("authorities").select("id").eq("id", authorityId).single();
  if (!authority) return fail("Authority profile not found", 403);
  const { count } = await admin.from("officers").select("id", { count: "exact", head: true });
  const officerId = `OFF-${String((count ?? 0) + 1001).padStart(4, "0")}`;
  const email = `${officerId.toLowerCase()}@officers.vericity.invalid`;
  const password = temporaryPassword();
  const { data: created, error: createError } = await admin.auth.admin.createUser({ email, password, email_confirm: true, app_metadata: { role: "officer", authority_id: authorityId, domain_id }, user_metadata: { must_reset_password: true } });
  if (createError || !created.user) return fail(createError?.message ?? "Could not create officer", 400);
  const { error } = await admin.from("officers").insert({ id: created.user.id, officer_id: officerId, name, role, authority_id: authorityId, domain_id });
  if (error) { await admin.auth.admin.deleteUser(created.user.id); return fail(error.message, 400); }
  await audit(admin, "authority", authorityId, "officer_provisioned", "officer", created.user.id, { officer_id: officerId });
  return json({ officer_id: officerId, temporary_password: password, must_reset_password: true }, 201);
});
