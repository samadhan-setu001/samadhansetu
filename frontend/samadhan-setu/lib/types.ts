// Types mirror the schema in Samadhan_Setu_System_Design.md section 3.

export type ComplaintStatus =
  | "filed"
  | "assigned"
  | "in_progress"
  | "work_completed"
  | "under_review"
  | "resolved"
  | "reopened";

export type AssignmentStatus =
  | "assigned"
  | "accepted"
  | "in_progress"
  | "work_completed"
  | "authority_review"
  | "resolved"
  | "reopened";

export type ReviewStatus = "pending" | "approved" | "rejected" | "reassigned";
export type PriorityLevel = "low" | "normal" | "high" | "urgent";
export type VerificationVerdict = "confirmed" | "disputed";
export type AuthorityType = "in_house_officer" | "external_agency";
export type Role = "citizen" | "authority" | "officer";

export interface Domain {
  id: string;
  name: string;
}

export interface Authority {
  id: string;
  name: string;
  type: AuthorityType;
  domain_id: string;
  performance_score: number;
}

export interface Officer {
  id: string;
  officer_id: string; // human-readable login, e.g. OFF-1042
  name: string;
  role?: string;
  authority_id: string;
  domain_id: string;
  active: boolean;
  open_case_count?: number;
  performance_score?: number;
}

export interface ComplaintPublic {
  id: string;
  derived_citizen_id: string;
  domain_id: string;
  description: string | null;
  before_photo_url: string;
  lat: number;
  long: number;
  status: ComplaintStatus;
  assigned_authority_id: string | null;
  duplicate_of: string | null;
  upvote_count: number;
  created_at: string;
  signature?: string | null;
  signer_address?: string | null;
}

export interface CaseAssignment {
  id: string;
  complaint_id: string;
  officer_id: string;
  assigned_by: string;
  assigned_at: string;
  deadline: string | null;
  priority: PriorityLevel;
  status: AssignmentStatus;
}

export interface Resolution {
  id: string;
  complaint_id: string;
  officer_id: string | null;
  after_photo_url: string;
  after_photo_hash?: string;
  previous_hash?: string | null;
  ipfs_cid?: string | null;
  lat: number;
  long: number;
  resolved_at: string;
  officer_note: string | null;
  record_hash: string;
  review_status: ReviewStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
}

export interface Verification {
  id: string;
  complaint_id: string;
  derived_citizen_id: string;
  verdict: VerificationVerdict;
  comment: string | null;
  created_at: string;
}

export interface TimelineEvent {
  label: string;
  detail?: string;
  at: string;
  state: "done" | "current" | "pending" | "flagged";
}
