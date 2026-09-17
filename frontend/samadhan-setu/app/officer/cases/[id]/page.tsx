"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RoleShell } from "@/components/layout/RoleShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LiveCameraCapture } from "@/components/camera/LiveCameraCapture";
import { ComplaintTimeline } from "@/components/status/ComplaintTimeline";
import { useRequireRole } from "@/lib/hooks/useRequireRole";
import { acceptCase, completeCase, fetchComplaintDetail, getEvidenceUrl } from "@/lib/api";
import { getIpfsGatewayUrl } from "@/lib/pinata";
import { getExplorerAddressUrl, OFFICER_REPUTATION_ADDRESS } from "@/lib/blockchain";
import { BlockchainVerificationModal } from "@/components/blockchain/BlockchainVerificationModal";
import type { CaseAssignment, ComplaintPublic, Resolution, Verification } from "@/lib/types";

const NAV = [{ href: "/officer/cases", label: "My Field Cases" }];

export default function OfficerCaseDetailPage() {
  const { session, ready, logout } = useRequireRole("officer");
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [data, setData] = useState<{
    complaint: ComplaintPublic;
    assignment?: CaseAssignment;
    resolution?: Resolution;
    verification?: Verification;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [note, setNote] = useState("");
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);
  const [afterGeo, setAfterGeo] = useState<{ lat: number; long: number } | null>(null);
  const [showBlockchainModal, setShowBlockchainModal] = useState(false);

  const load = async () => {
    setData(await fetchComplaintDetail(params.id));
  };

  useEffect(() => {
    if (ready && session) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, session, params.id]);

  if (!ready || !session) return null;

  const accept = async () => {
    if (!data?.assignment) return;
    setBusy(true);
    await acceptCase(data.assignment.id);
    await load();
    setBusy(false);
  };

  const submitCompletion = async () => {
    if (!data?.assignment || !afterPhoto || !afterGeo) return;
    setBusy(true);
    await completeCase({
      assignmentId: data.assignment.id,
      complaintId: data.complaint.id,
      officerId: session.id,
      photoDataUrl: afterPhoto,
      note,
      lat: afterGeo.lat,
      long: afterGeo.long
    });
    setBusy(false);
    setCapturing(false);
    router.push("/officer/cases");
  };

  const canAccept = data?.assignment?.status === "assigned";
  const canWork =
    data?.assignment?.status === "in_progress" ||
    data?.assignment?.status === "accepted" ||
    data?.assignment?.status === "reopened";

  return (
    <RoleShell role="officer" roleLabel="Field Officer Portal" identityLabel={session.label} items={NAV} onLogout={logout}>
      <button
        onClick={() => router.push("/officer/cases")}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-officer transition-colors"
      >
        ← Back to Assigned Cases
      </button>

      {!data ? (
        <div className="p-8 text-center text-sm text-ink-soft">Loading case details…</div>
      ) : (
        <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs text-ink-muted">Case ID: {data.complaint.derived_citizen_id}</p>
                <h1 className="mt-1 text-2xl font-bold text-ink">
                  {data.complaint.description || "Civic issue assignment"}
                </h1>
              </div>
              <StatusBadge status={data.complaint.status} />
            </div>

            <div className="mt-5">
              <p className="mb-1.5 text-xs font-semibold text-ink-soft">Citizen Field Report Proof</p>
              <div className="aspect-video w-full overflow-hidden rounded-xl border border-paper-line shadow-sm">
                <img
                  src={getEvidenceUrl(data.complaint.before_photo_url)}
                  alt="Before"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Accept Case Box */}
            {canAccept && (
              <Card className="mt-5 p-6 border-officer/30 shadow-card">
                <h3 className="text-lg font-bold text-ink">Accept Case Assignment</h3>
                <p className="mt-1 text-xs text-ink-soft">
                  Accepting changes the case status to In Progress and assigns accountability to your officer profile.
                </p>
                <Button onClick={accept} disabled={busy} className="mt-4 bg-officer hover:bg-purple-700">
                  {busy ? "Accepting Case…" : "Accept Case & Start Clock"}
                </Button>
              </Card>
            )}

            {/* Complete Case Action */}
            {canWork && !capturing && (
              <Card className="mt-5 p-6 border-emerald-200 bg-emerald-50/20 shadow-card">
                <h3 className="text-lg font-bold text-ink">Work Completed? Submit Proof</h3>
                <p className="mt-1 text-xs text-ink-soft">
                  Take an authenticated live after-photo and lock GPS coordinates to prove the fix.
                  The cryptographic hash is permanently sealed onto the ledger.
                </p>
                <Button onClick={() => setCapturing(true)} className="mt-4" variant="success">
                  📸 Capture Completion Proof
                </Button>
              </Card>
            )}

            {capturing && (
              <Card className="mt-5 p-6 border-paper-line shadow-card">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-bold text-ink">Field Resolution Evidence</h3>
                  <button
                    onClick={() => setCapturing(false)}
                    className="text-xs text-ink-soft hover:text-ink"
                  >
                    Cancel
                  </button>
                </div>

                {!afterPhoto ? (
                  <LiveCameraCapture
                    onCapture={(photo, geo) => {
                      setAfterPhoto(photo);
                      setAfterGeo(geo);
                    }}
                  />
                ) : (
                  <div>
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border border-paper-line shadow-sm">
                      <img src={afterPhoto} alt="Captured after-photo" className="h-full w-full object-cover" />
                    </div>

                    <div className="mt-4">
                      <TextArea
                        label="Resolution Note for Authority"
                        placeholder="Detail the repairs made (e.g. Asphalting completed, filled with high-grade cold mix)..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      />
                    </div>

                    <div className="mt-4 flex gap-3">
                      <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={() => {
                          setAfterPhoto(null);
                          setAfterGeo(null);
                        }}
                      >
                        Retake Photo
                      </Button>
                      <Button
                        className="flex-1"
                        variant="success"
                        onClick={submitCompletion}
                        disabled={busy}
                      >
                        {busy ? "Hashing & Submitting…" : "Seal & Submit Evidence"}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {data.resolution && (
              <Card className="mt-5 p-6">
                <h3 className="text-lg font-bold text-ink">Your Submitted Evidence</h3>
                <div className="mt-3 aspect-video w-full overflow-hidden rounded-xl border border-paper-line shadow-sm">
                  <img
                    src={getEvidenceUrl(data.resolution.after_photo_url)}
                    alt="After"
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="mt-3 text-sm text-ink">{data.resolution.officer_note || "Resolution completed."}</p>

                {data.resolution.ipfs_cid && (
                  <div className="mt-3 p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200 flex items-center justify-between text-xs">
                    <div className="min-w-0 flex-1 pr-2">
                      <span className="font-semibold text-emerald-800 flex items-center gap-1">
                        <span>📦</span> Pinned to Pinata (IPFS):
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
                      Gateway ↗
                    </a>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-paper-line flex items-center justify-between text-xs text-ink-soft">
                  <span className="font-mono text-[11px] truncate max-w-xs">
                    Record Hash: {data.resolution.record_hash}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowBlockchainModal(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded border border-purple-200 transition-colors cursor-pointer"
                  >
                    <span>⛓️ On-Chain Track Record (QR)</span>
                    <span className="text-[10px]">↗</span>
                  </button>
                </div>
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

      {session && (
        <BlockchainVerificationModal
          isOpen={showBlockchainModal}
          onClose={() => setShowBlockchainModal(false)}
          officerName={session.label || "Field Officer"}
          officerId={session.id}
          domain="Field Resolution Unit"
          score="92.0"
        />
      )}
    </RoleShell>
  );
}
