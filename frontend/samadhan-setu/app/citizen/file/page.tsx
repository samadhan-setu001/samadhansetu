"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RoleShell } from "@/components/layout/RoleShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LiveCameraCapture } from "@/components/camera/LiveCameraCapture";
import { useRequireRole } from "@/lib/hooks/useRequireRole";
import {
  checkNearbyDuplicates,
  fetchDomains,
  fileComplaint,
  upvoteComplaint,
  getEvidenceUrl,
  getDomainKey
} from "@/lib/api";
import { EvidenceImage } from "@/components/ui/EvidenceImage";
import type { ComplaintPublic, Domain } from "@/lib/types";

const NAV = [
  { href: "/citizen/file", label: "File a Report" },
  { href: "/citizen/complaints", label: "My Reports" }
];

type Step = "domain" | "capture" | "duplicates" | "describe" | "done";

const DOMAIN_ICONS: Record<string, string> = {
  Road: "🛣️",
  Streetlight: "💡",
  Water: "🚰",
  Waste: "🗑️"
};

export default function FileComplaintPage() {
  const { session, ready, logout } = useRequireRole("citizen");
  const router = useRouter();

  const [domains, setDomains] = useState<Domain[]>([]);
  const [step, setStep] = useState<Step>("domain");
  const [domainId, setDomainId] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [geo, setGeo] = useState<{ lat: number; long: number } | null>(null);
  const [duplicates, setDuplicates] = useState<ComplaintPublic[]>([]);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filed, setFiled] = useState<ComplaintPublic | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchDomains().then((d) => (Array.isArray(d) && d.length ? setDomains(d) : null));
  }, []);

  const displayDomains = domains.length
    ? domains
    : [
        { id: "964668bc-c9e0-4267-93eb-d707ef87c02b", name: "Road" },
        { id: "2c90948c-af75-4764-9700-60585ee2bde8", name: "Streetlight" },
        { id: "9017927e-8a0a-4766-8417-01795999fb2b", name: "Water" },
        { id: "05c17ded-aac7-4b96-a4fc-c977c7539b90", name: "Waste" }
      ];

  if (!ready || !session) return null;

  // Called when citizen takes live photo & acquires GPS coordinates
  const handleCapture = async (photoDataUrl: string, g: { lat: number; long: number }) => {
    setPhoto(photoDataUrl);
    setGeo(g);
    setErrorMessage(null);
    if (!domainId) return;

    try {
      // Check for complaints matching BOTH: same domain_id AND distance <= 75m
      const dupes = await checkNearbyDuplicates(domainId, g.lat, g.long);
      if (dupes.length > 0) {
        // Both location & domain match: present reinforcement option
        setDuplicates(dupes);
        setStep("duplicates");
      } else {
        // Location or domain does not match: proceed directly to new report
        setDuplicates([]);
        setStep("describe");
      }
    } catch {
      setDuplicates([]);
      setStep("describe");
    }
  };

  const addProofToExisting = async (complaintId: string) => {
    if (!photo || !geo || !domainId) return;
    const targetComplaint = duplicates.find((d) => d.id === complaintId);
    if (!targetComplaint || getDomainKey(targetComplaint.domain_id) !== getDomainKey(domainId)) {
      setErrorMessage("You can only reinforce a complaint that matches the selected category and location.");
      return;
    }
    setSubmitting(true);
    setErrorMessage(null);
    try {
      await upvoteComplaint(complaintId, photo, geo.lat, geo.long, domainId);
      router.push(`/citizen/complaints/${complaintId}`);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to add proof.");
    } finally {
      setSubmitting(false);
    }
  };

  const submit = async () => {
    if (!domainId || !photo || !geo) return;
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const record = await fileComplaint({
        domainId,
        description,
        photoDataUrl: photo,
        lat: geo.lat,
        long: geo.long
      });
      setFiled(record);
      setStep("done");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit complaint.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDomain = displayDomains.find((d) => d.id === domainId);

  return (
    <RoleShell
      role="citizen"
      roleLabel="Citizen"
      identityLabel={session.label}
      items={NAV}
      onLogout={logout}
    >
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink">File Civic Report</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Live photographic proof and location locking ensure authentic municipal routing.
          </p>
        </div>

        {/* Progress Tracker */}
        <div className="flex items-center gap-2 mb-6 text-xs text-ink-muted">
          <span className={`font-semibold ${step === "domain" ? "text-civic font-bold" : ""}`}>1. Category</span>
          <span>→</span>
          <span className={`font-semibold ${step === "capture" ? "text-civic font-bold" : ""}`}>2. Live Proof</span>
          <span>→</span>
          <span className={`font-semibold ${step === "describe" || step === "duplicates" ? "text-civic font-bold" : ""}`}>3. Review</span>
          <span>→</span>
          <span className={`font-semibold ${step === "done" ? "text-verified font-bold" : ""}`}>4. Confirmed</span>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-brick">
            {errorMessage}
          </div>
        )}

        {/* Step 1: Select Category / Domain */}
        {step === "domain" && (
          <Card className="p-6">
            <p className="text-sm font-semibold text-ink mb-1">Select Issue Category</p>
            <p className="text-xs text-ink-soft mb-4">Choose which municipal department owns this issue.</p>
            
            <div className="grid grid-cols-2 gap-3">
              {displayDomains.map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    setDomainId(d.id);
                    setStep("capture");
                  }}
                  className="flex items-center gap-3 p-4 rounded-xl border border-paper-line bg-paper-raised text-left hover:border-civic hover:bg-civic-soft/30 hover:shadow-sm transition-all"
                >
                  <span className="text-2xl">{DOMAIN_ICONS[d.name] || "📍"}</span>
                  <div>
                    <p className="text-sm font-bold text-ink">{d.name}</p>
                    <p className="text-[11px] text-ink-soft">Report {d.name.toLowerCase()} problem</p>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Step 2: Live Camera Scan & Real-Time GPS Lock */}
        {step === "capture" && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-ink">Capture Live Proof</p>
                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-ink-soft">
                  <span className="px-2 py-0.5 rounded bg-civic-soft text-civic font-semibold">
                    {selectedDomain?.name}
                  </span>
                  <span>·</span>
                  <span className="font-medium text-ink">
                    Live camera GPS lock
                  </span>
                </div>
              </div>
              <button
                onClick={() => setStep("domain")}
                className="text-xs text-civic hover:underline"
              >
                ← Change Category
              </button>
            </div>

            <LiveCameraCapture onCapture={handleCapture} />
          </Card>
        )}

        {/* Step 3 (Conditional): ONLY shown if BOTH Location (<=75m) and Domain Match */}
        {step === "duplicates" && (
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-ink">Existing Report Found Nearby</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                    Location & Domain Match
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-soft">
                  We found <span className="font-semibold text-civic">{duplicates.length} open report{duplicates.length > 1 ? "s" : ""}</span> in{" "}
                  <strong className="text-ink">{selectedDomain?.name}</strong> within 75m of your live GPS coordinates.
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 self-start sm:self-auto">
                <span>📍</span>
                <span>{duplicates.reduce((sum, d) => sum + (d.upvote_count || 0) + 1, 0)} Total Complaints & Proofs Filed Here</span>
              </div>
            </div>

            {/* Preview of newly captured photo that citizen can attach */}
            <div className="mb-4 p-3 rounded-xl bg-blue-50/40 border border-blue-200 flex items-center gap-3">
              {photo && (
                <img
                  src={photo}
                  alt="Your new evidence"
                  className="h-14 w-14 rounded-lg object-cover border border-blue-200 shadow-xs flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0 text-xs">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-ink">Your Live Captured Proof</p>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-semibold">Ready to Reinforce</span>
                </div>
                <p className="text-ink-soft text-[11px] mt-0.5">
                  GPS Locked: {geo?.lat.toFixed(5)}, {geo?.long.toFixed(5)} · Attaching your proof to this existing complaint accelerates municipal prioritization and dispatch.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {duplicates.map((d) => (
                <div key={d.id} className="rounded-xl border border-paper-line p-4 bg-paper hover:border-civic/40 transition-all shadow-xs">
                  <div className="flex items-start gap-3">
                    <EvidenceImage
                      src={d.before_photo_url}
                      domainId={d.domain_id}
                      alt=""
                      className="h-20 w-20 rounded-lg object-cover border border-paper-line flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <StatusBadge status={d.status} />
                        <span className="text-[10px] text-ink-muted">
                          Filed {new Date(d.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-ink line-clamp-2">
                        {d.description && d.description !== "null" ? d.description : `${selectedDomain?.name || "Civic"} issue report`}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                        <span className="inline-flex items-center gap-1 font-semibold text-civic bg-civic-soft/30 px-2 py-0.5 rounded">
                          👥 {(d.upvote_count || 0) + 1} proof{(d.upvote_count || 0) === 0 ? "" : "s"} filed on this issue
                        </span>
                        <span className="text-[10px] bg-emerald-50 text-verified font-medium px-2 py-0.5 rounded border border-emerald-200">
                          📍 Same Location (≤75m) & Category ({selectedDomain?.name})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-paper-line flex items-center justify-between gap-2">
                    <a
                      href={`/citizen/complaints/${d.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-ink-soft hover:text-civic flex items-center gap-1"
                    >
                      <span>🔍 View Report Status & Timeline</span>
                      <span className="text-[10px]">↗</span>
                    </a>
                    <Button
                      variant="primary"
                      onClick={() => addProofToExisting(d.id)}
                      disabled={submitting}
                      className="text-xs"
                    >
                      {submitting ? "Attaching Proof…" : "➕ Reinforce This Complaint (Attach My Live Proof)"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-paper-line flex items-center justify-between">
              <button
                onClick={() => setStep("describe")}
                className="text-xs font-semibold text-civic hover:underline"
              >
                My problem is different — File a new report anyway →
              </button>
            </div>
          </Card>
        )}

        {/* Step 3 (Direct if no match) / Step 4: Describe and Submit New Report */}
        {step === "describe" && (
          <Card className="p-6">
            <div className="mb-4 aspect-[4/3] w-full overflow-hidden rounded-xl border border-paper-line">
              {photo && <img src={photo} alt="Captured evidence" className="h-full w-full object-cover" />}
            </div>

            <div className="mb-4 p-3 rounded-lg bg-paper-subtle border border-paper-line text-xs flex flex-wrap justify-between gap-2">
              <div>
                <span className="text-ink-muted">Category:</span>{" "}
                <strong className="text-civic">{selectedDomain?.name}</strong>
              </div>
              <div>
                <span className="text-ink-muted">GPS:</span>{" "}
                <strong className="font-mono">{geo?.lat.toFixed(4)}, {geo?.long.toFixed(4)}</strong>
              </div>
            </div>

            <TextArea
              label="Describe the Issue"
              placeholder={`Describe the problem with this ${selectedDomain?.name.toLowerCase() || "spot"} (e.g. Broken pavement, large pothole, no water pressure, overflowing garbage)...`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="mt-6 flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setStep("capture")}
                disabled={submitting}
                className="flex-1"
              >
                Retake Photo
              </Button>
              <Button
                onClick={submit}
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? "Signing & Submitting…" : "Submit Official Report"}
              </Button>
            </div>
          </Card>
        )}

        {/* Step 4: Report Confirmed */}
        {step === "done" && filed && (
          <Card className="p-8 text-center shadow-card-hover">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-verified text-2xl flex items-center justify-center mx-auto mb-3">
              ✓
            </div>
            <h2 className="text-xl font-bold text-ink">Report Successfully Logged</h2>
            <p className="mt-2 text-xs text-ink-soft max-w-sm mx-auto">
              Your report has been cryptographically signed and routed to municipal authorities.
            </p>
            <div className="mt-3 p-2.5 rounded-lg bg-paper-subtle border border-paper-line font-mono text-xs text-ink">
              Reference: <strong>{filed.derived_citizen_id}</strong>
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <Button variant="secondary" onClick={() => router.push("/citizen/complaints")}>
                View My Reports
              </Button>
              <Button onClick={() => router.push(`/citizen/complaints/${filed.id}`)}>
                Track Progress
              </Button>
            </div>
          </Card>
        )}
      </div>
    </RoleShell>
  );
}
