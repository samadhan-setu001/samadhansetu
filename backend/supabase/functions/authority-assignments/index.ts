import { adminClient, authenticatedUser, audit, fail, json, options, requestPath, requireRole } from "../_shared/core.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return options();
  const auth = await authenticatedUser(req); if (auth.error) return auth.error;
  const denied = requireRole(auth.user!, "authority"); if (denied) return denied;
  const admin = adminClient(); const authorityId = auth.user!.id; const parts = requestPath(req).slice(1);
  if (req.method === "GET" && parts[0] === "suggestions") {
    const complaintId = new URL(req.url).searchParams.get("complaint_id"); if (!complaintId) return fail("complaint_id is required");
    const { data: complaint } = await admin.from("complaints").select("domain_id").eq("id", complaintId).single(); if (!complaint) return fail("Complaint not found", 404);
    const { data: officers, error } = await admin.from("officers").select("id, officer_id, name, role, performance_score").eq("authority_id", authorityId).eq("domain_id", complaint.domain_id).eq("active", true);
    if (error) return fail(error.message, 500);
    const ranked = await Promise.all((officers ?? []).map(async (o) => {
      const { data: cases, count } = await admin.from("case_assignments").select("assigned_at", { count: "exact" }).eq("officer_id", o.id).order("assigned_at", { ascending: false }).limit(1);
      const open = await admin.from("case_assignments").select("id", { count: "exact", head: true }).eq("officer_id", o.id).in("status", ["assigned", "accepted", "in_progress", "work_completed", "authority_review"]);
      const lastAssigned = cases?.[0]?.assigned_at ? new Date(cases[0].assigned_at).getTime() : 0;
      const daysSince = lastAssigned ? (Date.now() - lastAssigned) / 86_400_000 : 365;
      const inverseRecency = Math.min(daysSince / 30, 1);
      return { ...o, open_case_count: open.count ?? count ?? 0, score: 0.6 * Number(o.performance_score) - 0.3 * (open.count ?? count ?? 0) + 0.1 * inverseRecency };
    }));
    return json({ suggestions: ranked.sort((a, b) => b.score - a.score).slice(0, 3) });
  }
  if (req.method === "POST" && parts.length === 0) {
    const { complaint_id, officer_id, deadline, priority = "normal" } = await req.json(); if (!complaint_id || !officer_id) return fail("complaint_id and officer_id are required");
    const { data: officer } = await admin.from("officers").select("id, authority_id").eq("id", officer_id).single(); if (!officer || officer.authority_id !== authorityId) return fail("Officer is not managed by this authority", 403);
    const { data: complaint } = await admin.from("complaints").select("id, domain_id, status").eq("id", complaint_id).single(); if (!complaint) return fail("Complaint not found", 404);
    const { data: mapping } = await admin.from("domain_authority_map").select("authority_id").eq("authority_id", authorityId).eq("domain_id", complaint.domain_id).is("effective_to", null).maybeSingle();
    if (!mapping) return fail("Your authority is not currently responsible for this complaint domain", 403);
    const { data, error } = await admin.from("case_assignments").insert({ complaint_id, officer_id, assigned_by: authorityId, deadline, priority }).select().single();
    if (error) return fail(error.message, 400);
    await admin.from("complaints").update({ status: "assigned", assigned_authority_id: authorityId }).eq("id", complaint_id);
    await audit(admin, "authority", authorityId, "case_assigned", "case_assignment", data.id, { complaint_id, officer_id });
    return json({ assignment: data }, 201);
  }
  const assignmentId = parts[0];
  if (req.method === "POST" && assignmentId && parts[1] === "review") {
    const { decision } = await req.json(); if (!['approved', 'rejected', 'reassigned'].includes(decision)) return fail("Invalid decision");
    const { data: assignment } = await admin.from("case_assignments").select("id, complaint_id, assigned_by").eq("id", assignmentId).single(); if (!assignment || assignment.assigned_by !== authorityId) return fail("Assignment not found", 404);
    const { error } = await admin.from("resolutions").update({ review_status: decision, reviewed_by: authorityId, reviewed_at: new Date().toISOString() }).eq("complaint_id", assignment.complaint_id).eq("review_status", "pending");
    if (error) return fail(error.message, 400);
    const nextStatus = decision === "approved" ? "resolved" : "reopened";
    await admin.from("case_assignments").update({ status: decision === "approved" ? "resolved" : "reopened" }).eq("id", assignmentId);
    await admin.from("complaints").update({ status: nextStatus }).eq("id", assignment.complaint_id);
    await audit(admin, "authority", authorityId, `resolution_${decision}`, "case_assignment", assignmentId);
    return json({ status: nextStatus });
  }
  return fail("Not found", 404);
});
