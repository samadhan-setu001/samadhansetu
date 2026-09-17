import { adminClient, fail, json, options } from "../_shared/core.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return options();
  if (req.method !== "POST") return fail("Method not allowed", 405);
  const secret = Deno.env.get("CRON_SECRET");
  if (!secret || req.headers.get("x-cron-secret") !== secret) return fail("Unauthorized", 401);
  const admin = adminClient();
  const { data: officers, error } = await admin.from("officers").select("id, authority_id"); if (error) return fail(error.message, 500);
  for (const officer of officers ?? []) {
    const { data: assignments } = await admin.from("case_assignments").select("id, deadline, status, complaint_id").eq("officer_id", officer.id);
    const total = assignments?.length ?? 0; if (!total) continue;
    const resolved = assignments?.filter((a) => a.status === "resolved") ?? [];
    const ids = assignments?.map((a) => a.complaint_id) ?? [];
    const { data: resolutions } = ids.length ? await admin.from("resolutions").select("complaint_id, resolved_at").eq("officer_id", officer.id).in("complaint_id", ids) : { data: [] };
    const completedAt = new Map((resolutions ?? []).map((r) => [r.complaint_id, new Date(r.resolved_at)]));
    const onTime = resolved.filter((a) => !a.deadline || (completedAt.get(a.complaint_id) && completedAt.get(a.complaint_id)! <= new Date(a.deadline))).length / total;
    const reopened = (assignments?.filter((a) => a.status === "reopened").length ?? 0) / total;
    const { data: verified } = ids.length ? await admin.from("verifications").select("verdict").in("complaint_id", ids) : { data: [] };
    const confirmations = verified?.filter((v) => v.verdict === "confirmed").length ?? 0;
    const confirmedRate = verified?.length ? confirmations / verified.length : 0;
    const score = Math.max(0, Math.min(100, 100 * (0.4 * onTime + 0.4 * confirmedRate + 0.2 * (1 - reopened))));
    await admin.from("officers").update({ performance_score: score.toFixed(2) }).eq("id", officer.id);
    await admin.from("audit_log").insert({ actor_type: "system", action: "officer_score_recomputed", entity_type: "officer", entity_id: officer.id, metadata: { score } });
  }
  const { data: authorities } = await admin.from("authorities").select("id");
  for (const authority of authorities ?? []) {
    const { data: staff } = await admin.from("officers").select("performance_score").eq("authority_id", authority.id);
    if (staff?.length) {
      const average = staff.reduce((total, officer) => total + Number(officer.performance_score), 0) / staff.length;
      await admin.from("authorities").update({ performance_score: average.toFixed(2) }).eq("id", authority.id);
    }
  }

  // Merkle Root calculation from all resolution hash-chain records
  const { data: resolutionsData } = await admin.from("resolutions").select("record_hash").order("resolved_at", { ascending: true });
  const hashes = (resolutionsData ?? []).map((r) => r.record_hash).filter(Boolean);
  let merkleRoot = "0x0000000000000000000000000000000000000000000000000000000000000000";
  if (hashes.length > 0) {
    let current = [...hashes];
    while (current.length > 1) {
      const next: string[] = [];
      for (let i = 0; i < current.length; i += 2) {
        const a = current[i];
        const b = i + 1 < current.length ? current[i + 1] : current[i];
        const combined = a < b ? `${a}${b}` : `${b}${a}`;
        next.push(await sha256(combined));
      }
      current = next;
    }
    merkleRoot = `0x${current[0]}`;
  }
  await admin.from("audit_log").insert({
    actor_type: "system",
    action: "merkle_root_computed",
    entity_type: "resolution_tree",
    metadata: { merkle_root: merkleRoot, total_records: hashes.length }
  });

  return json({ ok: true, recomputed_at: new Date().toISOString(), merkle_root: merkleRoot, total_records: hashes.length });
});
