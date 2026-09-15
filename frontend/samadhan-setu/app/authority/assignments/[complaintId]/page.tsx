"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RoleShell } from "@/components/layout/RoleShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge, ReviewBadge } from "@/components/ui/StatusBadge";
import { ComplaintTimeline } from "@/components/status/ComplaintTimeline";
import { useRequireRole } from "@/lib/hooks/useRequireRole";
import {
  createAssignment,
  fetchAssignmentSuggestions,
  fetchComplaintDetail,
  reviewResolution,
  getEvidenceUrl
} from "@/lib/api";
import type { CaseAssignment, ComplaintPublic, Officer, PriorityLevel, Resolution, Verification } from "@/lib/types";

const NAV = [
  { href: "/authority/dashboard", label: "Queue" },
  { href: "/authority/officers", label: "Officers" },
  { href: "/authority/portfolio", label: "Portfolio" }
];

const PRIORITIES: PriorityLevel[] = ["low", "normal", "high", "urgent"];

export default function AssignmentPage() {
  const { session, ready, logout } = useRequireRole("authority");
  const params = useParams<{ complaintId: string }>();
  const router = useRouter();

  const [data, setData] = useState<{
    complaint: ComplaintPublic;
    assignment?: CaseAssignment;
    resolution?: Resolution;
    verification?: Verification;
  } | null>(null);
  const [suggestions, setSuggestions] = useState<Officer[] | null>(null);
  const [priority, setPriority] = useState<PriorityLevel>("normal");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const d = await fetchComplaintDetail(params.complaintId);
    setData(d);
    if (!d.assignment) {
      setSuggestions(await fetchAssignmentSuggestions(params.complaintId));
    }
  };

  useEffect(() => {
    if (ready && session) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, session, params.complaintId]);

  if (!ready || !session) return null;

  const assign = async (officerId: string) => {
    setBusy(true);
    await createAssignment(params.complaintId, officerId, session.id, priority, null);
    await load();
    setBusy(false);
  };

  const review = async (decision: "approved" | "rejected" | "reassigned") => {
    setBusy(true);
    await reviewResolution(params.complaintId, decision, session.id);
    await load();
    setBusy(false);
  };

  const needsAssignment = data && !data.assignment;
  const needsReview =
    data?.resolution && data.resolution.review_status === "pending";

  return (
    <RoleShell role="authority" roleLabel="Authority Dashboard" identityLabel={session.label} items={NAV} onLogout={logout}>
      <button
        onClick={() => router.push("/authority/dashboard")}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-steel transition-colors"
      >
        ← Back to Queue
      </button>

      {!data ? (
        <div className="p-8 text-center text-sm text-ink-soft">Loading case details…</div>
      ) : (
        <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs text-ink-muted">Ref: {data.complaint.derived_citizen_id}</p>
                <h1 className="mt-1 text-2xl font-bold text-ink">
                  {data.complaint.description || "Civic Complaint"}
                </h1>
              </div>
              <StatusBadge status={data.complaint.status} />
            </div>

            {/* Before and After Proof Gallery */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <p className="mb-1.5 text-xs font-semibold text-ink-soft">Citizen Filing — Before</p>
                <div className="aspect-square w-full overflow-hidden rounded-xl border border-paper-line shadow-sm">
                  <img
                    src={getEvidenceUrl(data.complaint.before_photo_url)}
                    alt="Before"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-semibold text-ink-soft">Field Resolution — After</p>
                {data.resolution ? (
                  <div className="aspect-square w-full overflow-hidden rounded-xl border border-paper-line shadow-sm">
                    <img
                      src={getEvidenceUrl(data.resolution.after_photo_url)}
                      alt="After"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-square w-full flex-col items-center justify-center rounded-xl border border-dashed border-paper-line bg-paper-subtle p-4 text-center text-xs text-ink-muted">
                    <span>Awaiting field work</span>
                    <span className="mt-1 text-[11px]">Officer photo pending</span>
                  </div>
                )}
              </div>
            </div>

            {/* Assignment Box */}
            {needsAssignment && (
              <Card className="mt-6 p-6 border-steel/30 shadow-card">
                <h3 className="text-lg font-bold text-ink">Dispatch to Field Officer</h3>
                <p className="mt-1 text-xs text-ink-soft">
                  Officer suggestions are ranked by domain matching, workload, and performance score.
                </p>

                <div className="mt-4 flex items-center gap-2 text-xs font-medium">
                  <span className="text-ink-soft">Priority:</span>
                  {PRIORITIES.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition-all ${
                        priority === p ? "bg-steel text-white shadow-sm" : "bg-paper border border-paper-line text-ink-soft hover:text-ink"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <div className="mt-4 flex flex-col gap-2.5">
                  {suggestions?.map((o, i) => (
                    <div key={o.id} className="flex items-center justify-between rounded-xl border border-paper-line p-3.5 bg-paper hover:border-steel/40 transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-ink">{o.name}</span>
                          <span className="font-mono text-xs text-ink-soft">({o.officer_id})</span>
                          {i === 0 && (
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-verified border border-emerald-200">
                              ★ Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-ink-soft mt-0.5">
                          Score: <strong>{o.performance_score}</strong> · Open Cases: <strong>{o.open_case_count ?? 0}</strong>
                        </p>
                      </div>
                      <Button onClick={() => assign(o.id)} disabled={busy} className="text-xs px-3 py-1.5 bg-steel hover:bg-blue-800">
                        Dispatch
                      </Button>
                    </div>
                  ))}
                  {suggestions?.length === 0 && (
                    <div className="p-4 rounded-lg bg-paper-subtle text-xs text-ink-soft text-center">
                      No officers currently available in this domain. Add officers via the Officers tab.
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Review Resolution Section */}
            {data.resolution && (
              <Card className="mt-6 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-ink">Field Officer Evidence</h3>
                  <ReviewBadge status={data.resolution.review_status} />
                </div>
                <p className="mt-2 text-sm text-ink">{data.resolution.officer_note || "Officer reported completion."}</p>
                <div className="mt-3 pt-3 border-t border-paper-line text-xs font-mono text-ink-soft truncate">
                  SHA-256 Record Hash: {data.resolution.record_hash}
                </div>

                {needsReview && (
                  <div className="mt-5 flex gap-3">
                    <Button onClick={() => review("approved")} disabled={busy} className="flex-1" variant="success">
                      ✓ Approve Proof
                    </Button>
                    <Button variant="secondary" onClick={() => review("reassigned")} disabled={busy} className="flex-1">
                      Reassign
                    </Button>
                    <Button variant="danger" onClick={() => review("rejected")} disabled={busy} className="flex-1">
                      Reject
                    </Button>
                  </div>
                )}
              </Card>
            )}
          </div>

          <div>
            <p className="mb-3 text-sm font-bold text-ink">Accountability Trail</p>
            <Card className="p-6">
              <ComplaintTimeline
                complaint={data.complaint}
                assignment={data.assignment}
                resolution={data.resolution}
                verification={data.verification}
              />
            </Card>
          </div>
        </div>
      )}
    </RoleShell>
  );
}
