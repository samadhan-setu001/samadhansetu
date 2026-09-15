import type { CaseAssignment, ComplaintPublic, Resolution, Verification } from "@/lib/types";

/**
 * Renders the lifecycle from section 7.1 (filed -> assigned -> in_progress ->
 * work_completed -> under_review -> resolved, with reopened branches) as a
 * vertical accountability trail, so a citizen can see exactly who touched
 * their complaint and when — without ever seeing anyone's identity.
 */
export function ComplaintTimeline({
  complaint,
  assignment,
  resolution,
  verification
}: {
  complaint: ComplaintPublic;
  assignment?: CaseAssignment;
  resolution?: Resolution;
  verification?: Verification;
}) {
  type Step = { label: string; detail?: string; at?: string; state: "done" | "current" | "pending" | "flagged" };

  const steps: Step[] = [
    {
      label: "Filed",
      detail: "Live photo + GPS captured",
      at: complaint.created_at,
      state: "done"
    },
    {
      label: "Assigned",
      detail: assignment ? `Routed to a field officer` : "Waiting on the responsible authority",
      at: assignment?.assigned_at,
      state: assignment ? "done" : complaint.status === "filed" ? "current" : "pending"
    },
    {
      label: "Work in progress",
      detail: assignment?.status === "in_progress" ? "Officer accepted the case" : undefined,
      state:
        resolution || ["in_progress", "work_completed", "under_review", "resolved"].includes(complaint.status)
          ? "done"
          : assignment
          ? "current"
          : "pending"
    },
    {
      label: "Completion evidence submitted",
      detail: resolution ? "Live after-photo + GPS recorded, hash-chained" : undefined,
      at: resolution?.resolved_at,
      state: resolution ? "done" : "pending"
    },
    {
      label: "Authority review",
      detail: resolution
        ? resolution.review_status === "pending"
          ? "Awaiting sign-off"
          : `Marked ${resolution.review_status}`
        : undefined,
      at: resolution?.reviewed_at ?? undefined,
      state:
        resolution?.review_status === "approved"
          ? "done"
          : resolution?.review_status === "rejected"
          ? "flagged"
          : resolution
          ? "current"
          : "pending"
    },
    {
      label: verification?.verdict === "disputed" ? "Reopened by citizen" : "Confirmed by citizen",
      detail: verification?.comment ?? (complaint.status === "resolved" ? "Case closed" : "Your call once evidence is in"),
      at: verification?.created_at,
      state: verification ? (verification.verdict === "confirmed" ? "done" : "flagged") : "pending"
    }
  ];

  return (
    <ol className="relative border-l border-paper-line pl-6">
      {steps.map((step, i) => (
        <li key={i} className="mb-7 last:mb-0">
          <span
            className={[
              "absolute -left-[7px] mt-1 h-3 w-3 rounded-full border-2 border-paper-raised",
              step.state === "done" && "bg-verified",
              step.state === "current" && "bg-signal",
              step.state === "flagged" && "bg-brick",
              step.state === "pending" && "bg-ink/20"
            ]
              .filter(Boolean)
              .join(" ")}
          />
          <p className={`text-sm font-medium ${step.state === "pending" ? "text-ink-soft/50" : "text-ink"}`}>
            {step.label}
          </p>
          {step.detail && <p className="mt-0.5 text-sm text-ink-soft">{step.detail}</p>}
          {step.at && (
            <p className="mt-0.5 text-xs text-ink-soft/60">
              {new Date(step.at).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit"
              })}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
