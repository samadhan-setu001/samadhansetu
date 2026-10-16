"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RoleShell } from "@/components/layout/RoleShell";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useRequireRole } from "@/lib/hooks/useRequireRole";
import { fetchMyComplaints, fetchAllComplaints } from "@/lib/api";
import { EvidenceImage } from "@/components/ui/EvidenceImage";
import type { ComplaintPublic } from "@/lib/types";

const NAV = [
  { href: "/citizen/file", label: "File a Report" },
  { href: "/citizen/complaints", label: "My Reports" }
];

export default function MyComplaintsPage() {
  const { session, ready, logout } = useRequireRole("citizen");
  const [myComplaints, setMyComplaints] = useState<ComplaintPublic[] | null>(null);
  const [allComplaints, setAllComplaints] = useState<ComplaintPublic[] | null>(null);
  const [viewTab, setViewTab] = useState<"mine" | "all">("all");

  useEffect(() => {
    if (ready && session) {
      fetchMyComplaints().then(setMyComplaints);
      fetchAllComplaints().then(setAllComplaints);
    }
  }, [ready, session]);

  if (!ready || !session) return null;

  const displayList = viewTab === "mine" ? myComplaints : allComplaints;

  return (
    <RoleShell role="citizen" roleLabel="Citizen" identityLabel={session.label} items={NAV} onLogout={logout}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Civic Complaints & Public Ledger</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Track reported issues through field investigation, action, and verified cryptographic sign-off.
          </p>
        </div>
        <Link href="/citizen/file">
          <Button>+ File New Report</Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex items-center gap-2 border-b border-paper-line pb-2">
        <button
          onClick={() => setViewTab("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            viewTab === "all"
              ? "bg-civic text-white shadow-xs"
              : "bg-paper-subtle text-ink-soft hover:text-ink"
          }`}
        >
          🌐 All City Reports ({allComplaints?.length ?? "…"})
        </button>
        <button
          onClick={() => setViewTab("mine")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            viewTab === "mine"
              ? "bg-civic text-white shadow-xs"
              : "bg-paper-subtle text-ink-soft hover:text-ink"
          }`}
        >
          👤 My Filed Reports ({myComplaints?.length ?? "…"})
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {displayList === null && (
          <div className="p-8 text-center text-sm text-ink-soft">Loading records…</div>
        )}

        {displayList && displayList.length === 0 && (
          <EmptyState
            title={viewTab === "mine" ? "No reports filed yet by you" : "No reports found in the city"}
            detail="When you photograph and report an issue in your city, it will appear here with an immutable cryptographic audit trail."
            action={
              <Link href="/citizen/file">
                <Button variant="primary">File a new report</Button>
              </Link>
            }
          />
        )}

        {displayList?.map((c) => (
          <Link key={c.id} href={`/citizen/complaints/${c.id}`}>
            <Card className="flex items-center gap-4 p-4 hover:border-civic/40 hover:shadow-card-hover transition-all">
              <EvidenceImage
                src={c.before_photo_url}
                domainId={c.domain_id}
                alt={c.description || "Civic report"}
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
