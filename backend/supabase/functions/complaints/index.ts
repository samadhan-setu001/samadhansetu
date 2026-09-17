import { adminClient, authenticatedUser, audit, fail, hmac, json, options, requestPath, requireRole, validLocation } from "../_shared/core.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return options();
  const auth = await authenticatedUser(req); if (auth.error) return auth.error;
  const user = auth.user!; const admin = adminClient(); const parts = requestPath(req).slice(1);

  if (req.method === "GET" && parts[0] === "nearby") {
    const url = new URL(req.url); const domainId = url.searchParams.get("domain_id"); const lat = Number(url.searchParams.get("lat")); const long = Number(url.searchParams.get("long"));
    if (!domainId || !validLocation(lat, long)) return fail("Valid domain_id, lat and long are required");
    const { data, error } = await admin.rpc("nearby_complaints", { p_domain_id: domainId, p_lat: lat, p_long: long });
    return error ? fail(error.message, 500) : json({ candidates: data });
  }
  const denied = requireRole(user, "citizen"); if (denied) return denied;
  if (req.method === "POST" && parts.length === 0) {
    const body = await req.json(); const { domain_id, description, before_photo_url, lat, long, gps_accuracy_meters, signature, signer_address } = body;
    if (!domain_id || !before_photo_url || !validLocation(lat, long)) return fail("domain_id, before_photo_url and valid location are required");
    if (typeof before_photo_url !== "string" || !before_photo_url.startsWith(`${user.id}/`)) return fail("Evidence must be an object path in your own storage folder");
    if (gps_accuracy_meters != null && (!Number.isFinite(gps_accuracy_meters) || gps_accuracy_meters > 50)) return fail("GPS accuracy must be 50 metres or better");
    const walletTarget = signer_address || user.id;
    const { error: walletError } = await admin.from("citizen_wallets").upsert({ wallet_id: walletTarget, wallet_address: signer_address || null }, { onConflict: "wallet_id", ignoreDuplicates: true });
    if (walletError) console.warn("citizen_wallets upsert warning:", walletError.message);
    const id = crypto.randomUUID(); const derived = await hmac(`${user.id}${id}`);
    const { data, error } = await admin.from("complaints").insert({ id, wallet_id: walletTarget, derived_citizen_id: derived, domain_id, description, before_photo_url, lat, long, signature: signature || null, signer_address: signer_address || null }).select("id, derived_citizen_id, status, created_at, signature, signer_address").single();
    if (error) return fail(error.message, 400);
    await audit(admin, "citizen", user.id, "complaint_created", "complaint", id, { domain_id, signature });
    return json({ complaint: data }, 201);
  }
  const complaintId = parts[0]; const action = parts[1];
  if (req.method === "POST" && complaintId && action === "upvote") {
    const { photo_url, lat, long } = await req.json(); if (!photo_url || !validLocation(lat, long)) return fail("photo_url and valid location are required");
    if (typeof photo_url !== "string" || !photo_url.startsWith(`${user.id}/`)) return fail("Evidence must be an object path in your own storage folder");
    const { data: complaint, error: readError } = await admin.from("complaints").select("id").eq("id", complaintId).single(); if (readError || !complaint) return fail("Complaint not found", 404);
    const derived = await hmac(`${user.id}${complaintId}`);
    const { error } = await admin.from("complaint_upvotes").insert({ complaint_id: complaintId, wallet_id: user.id, derived_citizen_id: derived, photo_url, lat, long });
    if (error) return fail(error.code === "23505" ? "You already added proof to this complaint" : error.message, 400);
    await admin.rpc("increment_upvote", { complaint_uuid: complaintId });
    await audit(admin, "citizen", user.id, "proof_added", "complaint", complaintId);
    return json({ ok: true }, 201);
  }
  if (req.method === "POST" && complaintId && action === "verify") {
    const { verdict, comment } = await req.json(); if (verdict !== "confirmed" && verdict !== "disputed") return fail("verdict must be confirmed or disputed");
    const { data: complaint } = await admin.from("complaints").select("id, wallet_id, status, derived_citizen_id").eq("id", complaintId).eq("wallet_id", user.id).single();
    if (!complaint) return fail("Complaint not found", 404);
    if (complaint.status !== "resolved") return fail("Only resolved complaints can be verified", 409);
    const { error } = await admin.from("verifications").insert({ complaint_id: complaintId, wallet_id: user.id, derived_citizen_id: complaint.derived_citizen_id, verdict, comment });
    if (error) return fail(error.code === "23505" ? "Complaint already verified" : error.message, 400);
    await admin.from("complaints").update({ status: verdict === "confirmed" ? "resolved" : "reopened" }).eq("id", complaintId);
    await admin.rpc("adjust_reputation", { target_wallet: user.id, delta: verdict === "confirmed" ? 2 : -6 });
    await audit(admin, "citizen", user.id, `resolution_${verdict}`, "complaint", complaintId);
    return json({ status: verdict === "confirmed" ? "resolved" : "reopened" });
  }
  return fail("Not found", 404);
});
