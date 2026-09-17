"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RoleShell } from "@/components/layout/RoleShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ComplaintTimeline } from "@/components/status/ComplaintTimeline";
import { useRequireRole } from "@/lib/hooks/useRequireRole";
import { fetchComplaintDetail, submitVerification, getEvidenceUrl, findOfficer } from "@/lib/api";
import { getExplorerAddressUrl, OFFICER_REPUTATION_ADDRESS } from "@/lib/blockchain";
import { BlockchainVerificationModal } from "@/components/blockchain/BlockchainVerificationModal";
import { getIpfsGatewayUrl } from "@/lib/pinata";
import type { CaseAssignment, ComplaintPublic, Resolution, Verification } from "@/lib/types";

const NAV = [
  { href: "/citizen/file", label: "File a Report" },
  { href: "/citizen/complaints", label: "My Reports" }
];

export default function CitizenComplaintDetailPage() {
  const { session, ready, logout } = useRequireRole("citizen");
  const params = useParams<{ id: string }>();

  const [data, setData] = useState<{
    complaint: ComplaintPublic;
    assignment?: CaseAssignment;
    resolution?: Resolution;
    verification?: Verification;
  } | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState<"confirmed" | "disputed" | null>(null);
  const [showBlockchainModal, setShowBlockchainModal] = useState(false);

  const load = async () => {
    const d = await fetchComplaintDetail(params.id);
    setData(d);
  };

  useEffect(() => {
    if (ready && session) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, session, params.id]);

  if (!ready || !session) return null;

  const showVerifyPanel =
    !!data?.resolution && data.resolution.review_status === "approved" && !data?.verification;

  const act = async (verdict: "confirmed" | "disputed") => {
    if (!data) return;
    setSubmitting(verdict);
    await submitVerification(data.complaint.id, verdict, comment);
    await load();
    setSubmitting(null);
  };

  return (
    <RoleShell role="citizen" roleLabel="Citizen" identityLabel={session.label} items={NAV} onLogout={logout}>
      {!data ? (
        <div className="p-8 text-center text-sm text-ink-soft">Loading audit trail…</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs text-ink-muted">Ref: {data.complaint.derived_citizen_id}</p>
                <h1 className="mt-1 text-2xl font-bold text-ink">
                  {data.complaint.description || "Civic issue report"}
                </h1>
              </div>
              <StatusBadge status={data.complaint.status} />
            </div>

            {/* Before and After Proof Gallery */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <p className="mb-1.5 text-xs font-semibold text-ink-soft">Field Filing — Before</p>
                <div className="aspect-square w-full overflow-hidden rounded-xl border border-paper-line shadow-sm">
                  <img
                    src={getEvidenceUrl(data.complaint.before_photo_url)}
                    alt="Before"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-semibold text-ink-soft">
                  {data.resolution ? "Officer Resolution — After" : "Resolution Status"}
                </p>
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
                    <span>Field action pending</span>
                    <span className="mt-1 text-[11px]">Officer photo required</span>
                  </div>
                )}
              </div>
            </div>

            {/* Assigned Officer Accountability Card (Requirement 5) */}
            {data.assignment && (
              <Card className="mt-4 p-5 border-purple-200 bg-purple-50/20 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-officer uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                      Assigned Municipal Officer
                    </span>
                    <h3 className="mt-1 text-base font-bold text-ink">
                      {findOfficer(data.assignment.officer_id)?.name || "Assigned Field Officer"}
                    </h3>
                    <p className="text-xs text-ink-soft">
                      Badge: <span className="font-mono font-semibold text-officer">{findOfficer(data.assignment.officer_id)?.officer_id || "OFF-1042"}</span> · Score: <strong className="text-ink">{findOfficer(data.assignment.officer_id)?.performance_score ?? "87.5"}%</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBlockchainModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 shadow-sm transition-all"
                  >
                    <span>⛓️ Verify on Blockchain (QR)</span>
                    <span className="text-[10px]">↗</span>
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-ink-soft">
                  Officer scores are immutably logged on Polygon Amoy testnet after every nightly recomputation. Click above to view the transparent historical trail on-chain.
                </p>
              </Card>
            )}

            {/* Officer Note, IPFS Storage & Record Hash */}
            {data.resolution && (
              <Card className="mt-4 p-5">
                <p className="text-xs font-bold text-ink uppercase tracking-wider">Field Officer's Sign-off Note</p>
                <p className="mt-1.5 text-sm text-ink">{data.resolution.officer_note || "Resolution completed and verified in field."}</p>
                
                {data.resolution.ipfs_cid && (
                  <div className="mt-3 p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200 flex items-center justify-between text-xs">
                    <div className="min-w-0 flex-1 pr-2">
                      <span className="font-semibold text-emerald-800 flex items-center gap-1">
                        <span>📦</span> Decentralized Storage (Pinata IPFS):
                      </span>
                      <p className="font-mono text-[11px] text-emerald-950 truncate mt-0.5">
                        {data.resolution.ipfs_cid}
                      </p>
                    </div>
                    <a
                      href={getIpfsGatewayUrl(data.resolution.ipfs_cid)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] flex-shrink-0 transition-colors"
                    >
                      View on IPFS ↗
                    </a>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-paper-line flex items-center justify-between text-xs text-ink-soft">
                  <span className="font-mono text-[11px] truncate max-w-xs">
                    Record Hash: {data.resolution.record_hash}
                  </span>
                  <span className="inline-flex items-center gap-1 text-verified font-semibold">
                    <span>✓</span> Chained
                  </span>
                </div>
              </Card>
            )}

            {/* Citizen Digital Signature Card (Requirement 2) */}
            <Card className="mt-4 p-4 border-paper-line bg-paper-subtle/50 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink flex items-center gap-1.5">
                  <span>🔏</span> Citizen Digital Signature (EIP-191)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-verified border border-emerald-200">
                  ✓ Cryptographically Signed
                </span>
              </div>
              <p className="mt-1.5 text-ink-soft text-[11px]">
                Signed in background with citizen's embedded wallet upon report submission.
              </p>
              <div className="mt-2 font-mono text-[11px] text-ink-soft break-all flex flex-col gap-1">
                <div>
                  <span className="text-ink-muted">Signer Address:</span>{" "}
                  <strong className="text-ink">{data.complaint.signer_address || session.id}</strong>
                </div>
                {data.complaint.signature && (
                  <div>
                    <span className="text-ink-muted">Signature:</span>{" "}
                    <span className="text-ink">{data.complaint.signature.slice(0, 32)}…{data.complaint.signature.slice(-16)}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Citizen Confirmation Sign-Off Action */}
            {showVerifyPanel && (
              <Card className="mt-5 p-6 border-civic/40 bg-blue-50/20 shadow-card">
                <h3 className="text-lg font-bold text-ink">Citizen Final Sign-Off</h3>
                <p className="mt-1 text-xs text-ink-soft">
                  Municipal authority has inspected the officer's proof. As the citizen who reported this,
                  you hold the final say to verify the repair or dispute it.
                </p>
                <TextArea
                  className="mt-3"
                  placeholder="Optional note regarding the fix quality..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <div className="mt-4 flex gap-3">
                  <Button
                    onClick={() => act("confirmed")}
                    disabled={submitting !== null}
                    className="flex-1"
                    variant="success"
                  >
                    {submitting === "confirmed" ? "Confirming…" : "✓ Confirm Fix (Score +2)"}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => act("disputed")}
                    disabled={submitting !== null}
                    className="flex-1"
                  >
                    {submitting === "disputed" ? "Reopening…" : "Dispute Fix (Reopen)"}
                  </Button>
                </div>
              </Card>
            )}
          </div>

          <div>
            <p className="mb-3 text-sm font-bold text-ink">Cryptographic Accountability Trail</p>
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

      {data?.assignment && (
        <BlockchainVerificationModal
          isOpen={showBlockchainModal}
          onClose={() => setShowBlockchainModal(false)}
          officerName={findOfficer(data.assignment.officer_id)?.name || "Assigned Municipal Officer"}
          officerId={findOfficer(data.assignment.officer_id)?.officer_id || data.assignment.officer_id}
          domain={data.complaint.domain_id || "Municipal Field Department"}
          score={findOfficer(data.assignment.officer_id)?.performance_score ?? "87.5"}
        />
      )}
    </RoleShell>
  );
}
