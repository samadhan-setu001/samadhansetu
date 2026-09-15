"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RoleShell } from "@/components/layout/RoleShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/Input";
import { LiveCameraCapture } from "@/components/camera/LiveCameraCapture";
import { useRequireRole } from "@/lib/hooks/useRequireRole";
import {
  checkNearbyDuplicates,
  fetchDomains,
  fileComplaint,
  upvoteComplaint,
  getEvidenceUrl
} from "@/lib/api";
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

  const handleCapture = async (photoDataUrl: string, g: { lat: number; long: number }) => {
    setPhoto(photoDataUrl);
    setGeo(g);
    setErrorMessage(null);
    if (!domainId) return;

    try {
      const dupes = await checkNearbyDuplicates(domainId, g.lat, g.long);
      if (dupes.length) {
        setDuplicates(dupes);
        setStep("duplicates");
      } else {
        setStep("describe");
      }
    } catch {
      setStep("describe");
    }
  };

  const addProofToExisting = async (complaintId: string) => {
    if (!photo || !geo) return;
    setSubmitting(true);
    setErrorMessage(null);
    try {
      await upvoteComplaint(complaintId, photo, geo.lat, geo.long);
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
            Live photographic proof and location locking ensure high-priority municipal routing.
          </p>
        </div>

        {/* Progress Tracker */}
        <div className="flex items-center gap-2 mb-6 text-xs text-ink-muted">
          <span className={`font-semibold ${step === "domain" ? "text-civic font-bold" : ""}`}>1. Domain</span>
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

        {step === "capture" && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-ink">Capture Field Proof</p>
                <p className="text-xs text-ink-soft">
                  Category: <span className="font-semibold text-civic">{selectedDomain?.name}</span>
                </p>
              </div>
              <button
                onClick={() => setStep("domain")}
                className="text-xs text-civic hover:underline"
              >
                Change Category
              </button>
            </div>

            <LiveCameraCapture onCapture={handleCapture} />
          </Card>
        )}

        {step === "duplicates" && (
          <Card className="p-6">
            <p className="text-lg font-bold text-ink">Existing Reports Nearby</p>
            <p className="mt-1 text-xs text-ink-soft">
              We detected {duplicates.length} open report{duplicates.length > 1 ? "s" : ""} within 75m of your location. You can add your photo as reinforcement proof to speed up resolution.
            </p>

            <div className="mt-4 flex flex-col gap-3">
              {duplicates.map((d) => (
                <div key={d.id} className="flex items-center gap-3 rounded-xl border border-paper-line p-3 bg-paper">
                  <img
                    src={getEvidenceUrl(d.before_photo_url)}
                    alt=""
                    className="h-16 w-16 rounded-lg object-cover border border-paper-line"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-ink truncate">
                      {d.description || "Civic issue report"}
                    </p>
                    <p className="text-[11px] text-ink-soft">
                      {d.upvote_count} citizen{d.upvote_count === 1 ? "" : "s"} confirmed this
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => addProofToExisting(d.id)}
                    disabled={submitting}
                    className="text-xs"
                  >
                    Reinforce This
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-paper-line flex items-center justify-between">
              <button
                onClick={() => setStep("describe")}
                className="text-xs font-semibold text-civic hover:underline"
              >
                None of these match — File a new report anyway →
              </button>
            </div>
          </Card>
        )}

        {step === "describe" && (
          <Card className="p-6">
            <div className="mb-4 aspect-[4/3] w-full overflow-hidden rounded-xl border border-paper-line">
              {photo && <img src={photo} alt="Captured evidence" className="h-full w-full object-cover" />}
            </div>

            <div className="mb-4 p-3 rounded-lg bg-paper-subtle border border-paper-line text-xs flex justify-between">
              <span>Category: <strong>{selectedDomain?.name}</strong></span>
              <span>GPS: <strong>{geo?.lat.toFixed(4)}, {geo?.long.toFixed(4)}</strong></span>
            </div>

            <TextArea
              label="Description (Optional)"
              placeholder="Describe what needs fixing (e.g. Broken pavement near bus stop, hazardous after dark)..."
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
