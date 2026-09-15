"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RoleShell } from "@/components/layout/RoleShell";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useRequireRole } from "@/lib/hooks/useRequireRole";
import { fetchMyComplaints, getEvidenceUrl } from "@/lib/api";
import type { ComplaintPublic } from "@/lib/types";

const NAV = [
  { href: "/citizen/file", label: "File a Report" },
  { href: "/citizen/complaints", label: "My Reports" }
];

export default function MyComplaintsPage() {
  const { session, ready, logout } = useRequireRole("citizen");
  const [complaints, setComplaints] = useState<ComplaintPublic[] | null>(null);

  useEffect(() => {
    if (ready && session) fetchMyComplaints().then(setComplaints);
  }, [ready, session]);

  if (!ready || !session) return null;

  return (
    <RoleShell role="citizen" roleLabel="Citizen" identityLabel={session.label} items={NAV} onLogout={logout}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">My Civic Reports</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Track filed complaints through investigation, field action, and final sign-off.
          </p>
        </div>
        <Link href="/citizen/file">
          <Button>+ File New Report</Button>
        </Link>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {complaints === null && (
          <div className="p-8 text-center text-sm text-ink-soft">Loading your records…</div>
        )}

        {complaints && complaints.length === 0 && (
          <EmptyState
            title="No reports filed yet"
            detail="When you photograph and report an issue in your city, it will appear here with a cryptographic audit trail."
            action={
              <Link href="/citizen/file">
                <Button variant="primary">File your first report</Button>
              </Link>
            }
          />
        )}

        {complaints?.map((c) => (
          <Link key={c.id} href={`/citizen/complaints/${c.id}`}>
            <Card className="flex items-center gap-4 p-4 hover:border-civic/40 hover:shadow-card-hover transition-all">
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
                      <span className="text-civic font-medium">{c.upvote_count} confirmations</span>
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
