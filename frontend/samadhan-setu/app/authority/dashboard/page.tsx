"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RoleShell } from "@/components/layout/RoleShell";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useRequireRole } from "@/lib/hooks/useRequireRole";
import { fetchAuthorityQueue, getEvidenceUrl } from "@/lib/api";
import type { ComplaintPublic, ComplaintStatus } from "@/lib/types";

const NAV = [
  { href: "/authority/dashboard", label: "Queue" },
  { href: "/authority/officers", label: "Officers" },
  { href: "/authority/portfolio", label: "Portfolio" }
];

const FILTERS: { label: string; statuses: ComplaintStatus[] | null }[] = [
  { label: "All Cases", statuses: null },
  { label: "Needs Assignment", statuses: ["filed"] },
  { label: "In The Field", statuses: ["assigned", "in_progress"] },
  { label: "Needs Review", statuses: ["under_review", "work_completed"] },
  { label: "Reopened / Disputed", statuses: ["reopened"] }
];

export default function AuthorityDashboardPage() {
  const { session, ready, logout } = useRequireRole("authority");
  const [complaints, setComplaints] = useState<ComplaintPublic[] | null>(null);
  const [filter, setFilter] = useState(0);

  useEffect(() => {
    if (ready && session) fetchAuthorityQueue(session.id).then(setComplaints);
  }, [ready, session]);

  const filtered = useMemo(() => {
    if (!complaints) return null;
    const statuses = FILTERS[filter].statuses;
    return statuses ? complaints.filter((c) => statuses.includes(c.status)) : complaints;
  }, [complaints, filter]);

  if (!ready || !session) return null;

  return (
    <RoleShell role="authority" roleLabel="Authority Dashboard" identityLabel={session.label} items={NAV} onLogout={logout}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Municipal Complaint Queue</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Domain oversight for <span className="font-semibold text-steel">{session.label}</span>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/authority/officers"
            className="px-3 py-1.5 rounded-lg border border-paper-line bg-paper-raised text-xs font-semibold text-ink hover:border-steel transition-colors"
          >
            Manage Officers →
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f, i) => {
          const active = filter === i;
          return (
            <button
              key={f.label}
              onClick={() => setFilter(i)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                active
                  ? "bg-steel text-white shadow-sm"
                  : "bg-paper-raised text-ink-soft border border-paper-line hover:border-slate-300"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Queue List */}
      <div className="mt-6 flex flex-col gap-3">
        {filtered === null && (
          <div className="p-8 text-center text-sm text-ink-soft">Loading incoming complaints…</div>
        )}

        {filtered?.length === 0 && (
          <EmptyState
            title="Queue is clear"
            detail="No complaints matching this filter are currently pending for your authority."
          />
        )}

        {filtered?.map((c) => (
          <Link key={c.id} href={`/authority/assignments/${c.id}`}>
            <Card className="flex items-center gap-4 p-4 hover:border-steel/50 hover:shadow-card-hover transition-all">
              <img
                src={getEvidenceUrl(c.before_photo_url)}
                alt=""
                className="h-16 w-16 flex-shrink-0 rounded-lg object-cover border border-paper-line"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-ink truncate">
                  {c.description || "Civic issue report"}
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs text-ink-soft">
                  <span>Filed {new Date(c.created_at).toLocaleDateString()}</span>
                  <span>·</span>
                  <span className="font-mono text-[11px] text-ink-muted">Ref: {c.derived_citizen_id}</span>
                  {c.upvote_count > 0 && (
                    <>
                      <span>·</span>
                      <span className="text-civic font-medium">{c.upvote_count} citizen confirmations</span>
                    </>
                  )}
                </div>
              </div>
              <StatusBadge status={c.status} />
            </Card>
          </Link>
        ))}
      </div>
    </RoleShell>
  );
}
