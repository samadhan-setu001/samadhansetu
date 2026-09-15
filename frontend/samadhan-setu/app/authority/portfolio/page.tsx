"use client";

import { useEffect, useState } from "react";
import { RoleShell } from "@/components/layout/RoleShell";
import { Card } from "@/components/ui/Card";
import { useRequireRole } from "@/lib/hooks/useRequireRole";
import { fetchAuthority, fetchAuthorityQueue, fetchOfficersForAuthority } from "@/lib/api";
import type { Authority, ComplaintPublic, Officer } from "@/lib/types";

const NAV = [
  { href: "/authority/dashboard", label: "Queue" },
  { href: "/authority/officers", label: "Officers" },
  { href: "/authority/portfolio", label: "Portfolio" }
];

// Metrics mirror section 9 of the design doc. Once real resolution history
// exists, replace this client-side aggregation with the nightly
// score-recompute output (read straight off `authorities.performance_score`
// and `officers.performance_score`).
export default function PortfolioPage() {
  const { session, ready, logout } = useRequireRole("authority");
  const [authority, setAuthority] = useState<Authority | undefined>();
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [complaints, setComplaints] = useState<ComplaintPublic[]>([]);

  useEffect(() => {
    if (!ready || !session) return;
    fetchAuthority(session.id).then(setAuthority);
    fetchOfficersForAuthority(session.id).then(setOfficers);
    fetchAuthorityQueue(session.id).then(setComplaints);
  }, [ready, session]);

  if (!ready || !session) return null;

  const total = complaints.length;
  const resolved = complaints.filter((c) => c.status === "resolved").length;
  const reopened = complaints.filter((c) => c.status === "reopened").length;
  const pendingReview = complaints.filter((c) => c.status === "under_review").length;
  const confirmedRate = total ? Math.round((resolved / total) * 100) : 0;
  const reopenRate = total ? Math.round((reopened / total) * 100) : 0;

  return (
    <RoleShell role="authority" roleLabel="Authority dashboard" identityLabel={session.label} items={NAV} onLogout={logout}>
      <h1 className="font-display text-2xl text-ink">Portfolio</h1>
      <p className="mt-1 text-sm text-ink-soft">How {session.label} is performing overall.</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <Metric label="Performance score" value={`${authority?.performance_score ?? "—"}`} tone="steel" />
        <Metric label="Resolved" value={`${resolved} / ${total}`} tone="verified" />
        <Metric label="Pending your review" value={`${pendingReview}`} tone="signal" />
        <Metric label="Reopen rate" value={`${reopenRate}%`} tone="brick" />
      </div>

      <p className="mt-8 mb-3 text-sm font-medium text-ink-soft">Officers</p>
      <Card className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium">Officer</th>
              <th className="px-4 py-3 font-medium">Open cases</th>
              <th className="px-4 py-3 font-medium">Score</th>
            </tr>
          </thead>
          <tbody>
            {officers.map((o) => (
              <tr key={o.id} className="border-t border-paper-line">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{o.name}</p>
                  <p className="text-xs text-ink-soft">{o.officer_id}</p>
                </td>
                <td className="px-4 py-3 text-ink-soft">{o.open_case_count ?? 0}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 rounded-full bg-paper-line">
                      <div
                        className="h-1.5 rounded-full bg-verified"
                        style={{ width: `${o.performance_score ?? 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-ink-soft">{o.performance_score ?? "—"}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <p className="mt-2 text-xs text-ink-soft/70">
        Confirmed-resolution rate this period: {confirmedRate}%. Full on-time / reopen / confirmed
        breakdown recomputes nightly per section 9 once resolution history accumulates.
      </p>
    </RoleShell>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: "steel" | "verified" | "signal" | "brick" }) {
  const toneClass = {
    steel: "text-steel",
    verified: "text-verified",
    signal: "text-signal",
    brick: "text-brick"
  }[tone];
  return (
    <Card className="p-4">
      <p className="text-xs font-medium text-ink-soft">{label}</p>
      <p className={`mt-1 font-display text-2xl ${toneClass}`}>{value}</p>
    </Card>
  );
}
