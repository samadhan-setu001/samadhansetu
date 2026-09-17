"use client";

import { useEffect, useState } from "react";
import { RoleShell } from "@/components/layout/RoleShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { useRequireRole } from "@/lib/hooks/useRequireRole";
import { fetchAuthority, fetchOfficersForAuthority, provisionOfficer, fetchDomains } from "@/lib/api";
import { getExplorerAddressUrl, OFFICER_REPUTATION_ADDRESS } from "@/lib/blockchain";
import { BlockchainVerificationModal } from "@/components/blockchain/BlockchainVerificationModal";
import type { Officer, Domain } from "@/lib/types";

const NAV = [
  { href: "/authority/dashboard", label: "Queue" },
  { href: "/authority/officers", label: "Officers" },
  { href: "/authority/portfolio", label: "Portfolio" }
];

export default function OfficersPage() {
  const { session, ready, logout } = useRequireRole("authority");
  const [officers, setOfficers] = useState<Officer[] | null>(null);
  const [selectedOfficerForModal, setSelectedOfficerForModal] = useState<Officer | null>(null);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [domainId, setDomainId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ officer: Officer; tempPassword: string } | null>(null);

  const load = async () => {
    if (!session) return;
    try {
      const [authority, officerList, domainList] = await Promise.all([
        fetchAuthority(session.id),
        fetchOfficersForAuthority(session.id),
        fetchDomains()
      ]);
      setDomains(domainList || []);
      const resolvedDomain = authority?.domain_id || (domainList?.[0]?.id ?? null);
      setDomainId(resolvedDomain);
      setOfficers(officerList || []);
    } catch (err: any) {
      console.error("Failed to load officers:", err);
    }
  };

  useEffect(() => {
    if (ready && session) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, session]);

  if (!ready || !session) return null;

  const submit = async () => {
    setError(null);
    if (!name.trim()) {
      setError("Please enter the officer's full name.");
      return;
    }
    const targetDomain = domainId || domains[0]?.id;
    if (!targetDomain) {
      setError("No department domain found to attach officer.");
      return;
    }

    setCreating(true);
    try {
      const result = await provisionOfficer(session.id, targetDomain, name.trim(), role.trim() || "Field Technician");
      setCreated(result);
      setName("");
      setRole("");
      setOfficers((prev) => (prev ? [result.officer, ...prev] : [result.officer]));
    } catch (err: any) {
      setError(err.message || "Failed to provision officer.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <RoleShell role="authority" roleLabel="Authority Dashboard" identityLabel={session.label} items={NAV} onLogout={logout}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Field Officers</h1>
          <p className="mt-1 text-sm text-ink-soft">Authorized personnel provisioned under {session.label}.</p>
        </div>
        <Button onClick={() => { setShowForm((s) => !s); setError(null); }}>
          {showForm ? "Close Form" : "+ Provision New Officer"}
        </Button>
      </div>

      {showForm && (
        <Card className="mt-6 max-w-lg p-6 border-steel/30 shadow-card">
          {created ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-verified flex items-center justify-center font-bold text-xs">✓</span>
                <p className="text-base font-bold text-ink">Officer Successfully Provisioned</p>
              </div>
              <p className="text-xs text-ink-soft mb-4">
                Share these credentials with the field officer. They can log in immediately via the Officer Portal.
              </p>
              <div className="rounded-xl bg-paper p-4 font-mono text-xs border border-paper-line flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-ink-soft">Officer Name:</span>
                  <span className="font-bold text-ink">{created.officer.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ink-soft">Officer ID:</span>
                  <span className="font-bold text-officer px-2 py-0.5 rounded bg-purple-50 border border-purple-200">
                    {created.officer.officer_id}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ink-soft">Temporary Password:</span>
                  <span className="font-bold text-ink px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                    {created.tempPassword}
                  </span>
                </div>
              </div>
              <Button
                variant="secondary"
                className="mt-4"
                onClick={() => {
                  setCreated(null);
                  setShowForm(false);
                }}
              >
                Done
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-bold text-ink">Provision Field Officer</h3>
              <p className="text-xs text-ink-soft">
                Creates an officer account with an official ID and temporary password.
              </p>

              <Input
                label="Officer Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rajesh Nair"
              />

              <Input
                label="Role / Designation"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Senior Asphalt Specialist"
              />

              {domains.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-ink">Department Domain</label>
                  <select
                    className="rounded-lg border border-paper-line bg-paper-raised px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-steel/30"
                    value={domainId || ""}
                    onChange={(e) => setDomainId(e.target.value)}
                  >
                    {domains.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {error && <p className="text-xs font-semibold text-brick">{error}</p>}

              <Button onClick={submit} disabled={creating || !name.trim()} className="mt-2 bg-steel hover:bg-blue-800">
                {creating ? "Provisioning Officer…" : "Generate Officer Account"}
              </Button>
            </div>
          )}
        </Card>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {officers === null && <p className="text-sm text-ink-soft">Loading officers…</p>}
        {officers?.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3">
            <EmptyState title="No officers registered yet" detail="Provision your first officer to start dispatching cases." />
          </div>
        )}
        {officers?.map((o) => (
          <Card key={o.id} className="p-5 hover:border-steel/40 transition-all">
            <div className="flex items-center justify-between">
              <p className="font-bold text-sm text-ink">{o.name}</p>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  o.active ? "bg-emerald-50 text-verified border border-emerald-200" : "bg-slate-100 text-slate-500"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${o.active ? "bg-verified" : "bg-slate-400"}`} />
                {o.active ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="font-mono text-xs font-semibold text-officer mt-1">{o.officer_id}</p>
            <p className="text-xs text-ink-soft">{o.role || "Field Technician"}</p>
            <div className="mt-4 pt-3 border-t border-paper-line flex items-center justify-between text-xs text-ink-soft">
              <span>Cases: <strong>{o.open_case_count ?? 0} active</strong></span>
              <span>Performance: <strong>{o.performance_score ?? "50"}%</strong></span>
            </div>
            <div className="mt-2.5 pt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedOfficerForModal(o)}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-md border border-purple-200 transition-colors shadow-2xs"
                title={`Verify ${o.name}'s historical scores with QR on Polygon Amoy`}
              >
                <span>⛓️ Verify on Blockchain (QR)</span>
                <span className="text-[10px]">↗</span>
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Interactive Blockchain Verification & QR Code Modal */}
      <BlockchainVerificationModal
        isOpen={Boolean(selectedOfficerForModal)}
        onClose={() => setSelectedOfficerForModal(null)}
        officerName={selectedOfficerForModal?.name}
        officerId={selectedOfficerForModal?.officer_id}
        domain={selectedOfficerForModal?.role || "Municipal Officer"}
        score={selectedOfficerForModal?.performance_score ?? "50"}
      />
    </RoleShell>
  );
}
