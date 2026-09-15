import type { ComplaintStatus, VerificationVerdict, ReviewStatus } from "@/lib/types";

const STATUS_META: Record<ComplaintStatus, { label: string; tone: string; dot: string }> = {
  filed: {
    label: "Filed",
    tone: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-400"
  },
  assigned: {
    label: "Assigned",
    tone: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500"
  },
  in_progress: {
    label: "In Progress",
    tone: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500"
  },
  work_completed: {
    label: "Work Completed",
    tone: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500"
  },
  under_review: {
    label: "Authority Review",
    tone: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-500"
  },
  resolved: {
    label: "Verified Fixed",
    tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500"
  },
  reopened: {
    label: "Reopened / Disputed",
    tone: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500"
  }
};

export function StatusBadge({ status }: { status: ComplaintStatus }) {
  const meta = STATUS_META[status] || STATUS_META.filed;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${meta.tone}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

export function VerdictBadge({ verdict }: { verdict: VerificationVerdict }) {
  const isConfirmed = verdict === "confirmed";
  const tone = isConfirmed
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-rose-50 text-rose-700 border-rose-200";
  const dot = isConfirmed ? "bg-emerald-500" : "bg-rose-500";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${tone}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {isConfirmed ? "Confirmed by Citizen" : "Disputed by Citizen"}
    </span>
  );
}

export function ReviewBadge({ status }: { status: ReviewStatus }) {
  const meta: Record<ReviewStatus, { label: string; tone: string; dot: string }> = {
    pending: {
      label: "Pending Review",
      tone: "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-500"
    },
    approved: {
      label: "Authority Approved",
      tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500"
    },
    rejected: {
      label: "Rejected",
      tone: "bg-rose-50 text-rose-700 border-rose-200",
      dot: "bg-rose-500"
    },
    reassigned: {
      label: "Reassigned",
      tone: "bg-purple-50 text-purple-700 border-purple-200",
      dot: "bg-purple-500"
    }
  };
  const m = meta[status] || meta.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${m.tone}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}
