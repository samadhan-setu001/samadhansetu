"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RoleShell } from "@/components/layout/RoleShell";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useRequireRole } from "@/lib/hooks/useRequireRole";
import { fetchOfficerCases, getEvidenceUrl } from "@/lib/api";
import type { CaseAssignment, ComplaintPublic } from "@/lib/types";

const NAV = [{ href: "/officer/cases", label: "My Field Cases" }];

const PRIORITY_BADGES: Record<string, string> = {
  urgent: "bg-rose-50 text-rose-700 border-rose-200",
  high: "bg-amber-50 text-amber-700 border-amber-200",
  normal: "bg-blue-50 text-blue-700 border-blue-200",
  low: "bg-slate-100 text-slate-700 border-slate-200"
};

export default function OfficerCasesPage() {
  const { session, ready, logout } = useRequireRole("officer");
  const [cases, setCases] = useState<{ complaint: ComplaintPublic; assignment: CaseAssignment }[] | null>(null);

  useEffect(() => {
    if (ready && session) fetchOfficerCases(session.id).then(setCases);
  }, [ready, session]);

  if (!ready || !session) return null;

  return (
    <RoleShell role="officer" roleLabel="Field Officer Portal" identityLabel={session.label} items={NAV} onLogout={logout}>
      <div>
        <h1 className="text-2xl font-bold text-ink">My Assigned Cases</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Active field assignments for <span className="font-mono font-bold text-officer">{session.label}</span>. Accept cases and submit tamper-proof after-photos.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {cases === null && (
          <div className="p-8 text-center text-sm text-ink-soft">Loading assignments…</div>
        )}
        {cases?.length === 0 && (
          <EmptyState
            title="No active cases assigned"
            detail="When your municipal authority dispatches work to your officer ID, it will appear here."
          />
        )}
        {cases?.map(({ complaint, assignment }) => (
          <Link key={complaint.id} href={`/officer/cases/${complaint.id}`}>
            <Card className="flex items-center gap-4 p-4 hover:border-officer/50 hover:shadow-card-hover transition-all">
              <img
                src={getEvidenceUrl(complaint.before_photo_url)}
                alt=""
                className="h-16 w-16 flex-shrink-0 rounded-lg object-cover border border-paper-line"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-ink truncate">
                  {complaint.description || "Civic issue assignment"}
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border uppercase tracking-wider ${
                      PRIORITY_BADGES[assignment.priority] || PRIORITY_BADGES.normal
                    }`}
                  >
                    {assignment.priority}
                  </span>
                  <span className="text-ink-soft font-mono text-[11px]">
                    Ref: {complaint.derived_citizen_id}
                  </span>
                </div>
              </div>
              <StatusBadge status={complaint.status} />
            </Card>
          </Link>
        ))}
      </div>
    </RoleShell>
  );
}
