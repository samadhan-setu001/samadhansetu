import { adminClient, authenticatedUser, audit, fail, json, options, requestPath, requireRole, sha256, validLocation } from "../_shared/core.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return options();
  if (req.method !== "POST") return fail("Method not allowed", 405);
  const auth = await authenticatedUser(req); if (auth.error) return auth.error;
  const denied = requireRole(auth.user!, "officer"); if (denied) return denied;
  const officerId = auth.user!.id; const admin = adminClient(); const parts = requestPath(req).slice(1);
  const assignmentId = parts[0]; const action = parts[1]; if (!assignmentId || !action) return fail("Not found", 404);
  const { data: assignment } = await admin.from("case_assignments").select("id, complaint_id, officer_id, status").eq("id", assignmentId).single();
  if (!assignment || assignment.officer_id !== officerId) return fail("Assignment not found", 404);
  if (action === "accept") {
    if (!["assigned", "accepted"].includes(assignment.status)) return fail("Case cannot be accepted in its current state", 409);
    await admin.from("case_assignments").update({ status: "in_progress" }).eq("id", assignmentId);
    await admin.from("complaints").update({ status: "in_progress" }).eq("id", assignment.complaint_id);
    await audit(admin, "officer", officerId, "case_accepted", "case_assignment", assignmentId);
    return json({ status: "in_progress" });
  }
  if (action === "complete") {
    const { after_photo_url, after_photo_hash, ipfs_cid, lat, long, officer_note, gps_accuracy_meters, captured_at } = await req.json();
    if (!after_photo_url || !after_photo_hash || !validLocation(lat, long)) return fail("after_photo_url, after_photo_hash and valid location are required");
    if (typeof after_photo_url !== "string" || !after_photo_url.startsWith(`${officerId}/`)) return fail("Evidence must be an object path in your own storage folder");
    if (gps_accuracy_meters != null && (!Number.isFinite(gps_accuracy_meters) || gps_accuracy_meters > 50)) return fail("GPS accuracy must be 50 metres or better");
    const resolvedAt = captured_at ?? new Date().toISOString();
    if (Math.abs(Date.now() - new Date(resolvedAt).getTime()) > 120_000) return fail("Capture time must be within two minutes of server time");
    const { data: last } = await admin.from("resolutions").select("record_hash").eq("complaint_id", assignment.complaint_id).order("resolved_at", { ascending: false }).limit(1).maybeSingle();
    const previousHash = last?.record_hash ?? "GENESIS";
    const recordHash = await sha256(`${assignment.complaint_id}${officerId}${after_photo_hash}${lat}${long}${resolvedAt}${previousHash}`);
    const { data, error } = await admin.from("resolutions").insert({ complaint_id: assignment.complaint_id, officer_id: officerId, after_photo_url, after_photo_hash, ipfs_cid: ipfs_cid || null, lat, long, resolved_at: resolvedAt, officer_note, previous_hash: previousHash, record_hash: recordHash }).select().single();
    if (error) return fail(error.message, 400);
    await admin.from("case_assignments").update({ status: "authority_review" }).eq("id", assignmentId);
    await admin.from("complaints").update({ status: "under_review" }).eq("id", assignment.complaint_id);
    await audit(admin, "officer", officerId, "resolution_submitted", "resolution", data.id, { assignment_id: assignmentId, record_hash: recordHash, ipfs_cid });
    return json({ resolution: data }, 201);
  }
  return fail("Not found", 404);
});
