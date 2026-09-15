import type {
  Authority,
  CaseAssignment,
  ComplaintPublic,
  Domain,
  Officer,
  Resolution,
  Verification
} from "./types";

// In-memory stand-in for the Postgres schema in section 3 of the design doc.
// Only used while NEXT_PUBLIC_SUPABASE_URL / ANON_KEY are unset — see lib/api.ts.
// Resets on full page reload; persists across client-side navigation.

export const domains: Domain[] = [
  { id: "dom-road", name: "Road" },
  { id: "dom-streetlight", name: "Streetlight" },
  { id: "dom-water", name: "Water" },
  { id: "dom-waste", name: "Waste" }
];

export const authorities: Authority[] = [
  { id: "auth-pwd", name: "Public Works Department", type: "in_house_officer", domain_id: "dom-road", performance_score: 78 },
  { id: "auth-electric", name: "Municipal Electric Board", type: "in_house_officer", domain_id: "dom-streetlight", performance_score: 65 },
  { id: "auth-water", name: "City Water Utility", type: "in_house_officer", domain_id: "dom-water", performance_score: 82 },
  { id: "auth-waste", name: "SwachhCorp (contracted)", type: "external_agency", domain_id: "dom-waste", performance_score: 71 }
];

export const officers: Officer[] = [
  { id: "off-1001", officer_id: "OFF-1001", name: "R. Kumar", authority_id: "auth-pwd", domain_id: "dom-road", active: true, open_case_count: 1, performance_score: 92 },
  { id: "off-1002", officer_id: "OFF-1002", name: "MR RAHUL", authority_id: "auth-pwd", domain_id: "dom-road", active: true, open_case_count: 0, performance_score: 50 },
  { id: "off-1003", officer_id: "OFF-1003", name: "MR DEV", authority_id: "auth-electric", domain_id: "dom-streetlight", active: true, open_case_count: 1, performance_score: 50 },
  { id: "off-1004", officer_id: "OFF-1004", name: "Test Officer", authority_id: "auth-pwd", domain_id: "dom-road", active: true, open_case_count: 0, performance_score: 50 },
  { id: "off-1", officer_id: "OFF-1042", name: "R. Nair", authority_id: "auth-pwd", domain_id: "dom-road", active: true, open_case_count: 2, performance_score: 84 },
  { id: "off-2", officer_id: "OFF-1043", name: "S. Verma", authority_id: "auth-pwd", domain_id: "dom-road", active: true, open_case_count: 4, performance_score: 71 },
  { id: "off-3", officer_id: "OFF-2011", name: "A. Iyer", authority_id: "auth-electric", domain_id: "dom-streetlight", active: true, open_case_count: 1, performance_score: 90 },
  { id: "off-4", officer_id: "OFF-3050", name: "K. Das", authority_id: "auth-water", domain_id: "dom-water", active: true, open_case_count: 3, performance_score: 66 }
];

export const complaints: ComplaintPublic[] = [
  {
    id: "c-1001",
    derived_citizen_id: "7f3a9c2e1b",
    domain_id: "dom-road",
    description: "Deep pothole widening after last week's rain, cars swerving into the bike lane.",
    before_photo_url: "https://images.unsplash.com/photo-1584467541268-b040f83be3fd?w=800&q=80",
    lat: 28.6692,
    long: 77.4538,
    status: "under_review",
    assigned_authority_id: "auth-pwd",
    duplicate_of: null,
    upvote_count: 6,
    created_at: daysAgo(6)
  },
  {
    id: "c-1002",
    derived_citizen_id: "2b8e77aa4d",
    domain_id: "dom-streetlight",
    description: "Three streetlights dark in a row outside the community park — unsafe after 8pm.",
    before_photo_url: "https://images.unsplash.com/photo-1542332213-31f87348057f?w=800&q=80",
    lat: 28.6448,
    long: 77.216,
    status: "assigned",
    assigned_authority_id: "auth-electric",
    duplicate_of: null,
    upvote_count: 3,
    created_at: daysAgo(3)
  },
  {
    id: "c-1003",
    derived_citizen_id: "9c14f0d3aa",
    domain_id: "dom-waste",
    description: "Overflowing bin at the market corner, not collected in over a week.",
    before_photo_url: "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=800&q=80",
    lat: 28.6139,
    long: 77.209,
    status: "resolved",
    assigned_authority_id: "auth-waste",
    duplicate_of: null,
    upvote_count: 11,
    created_at: daysAgo(12)
  },
  {
    id: "c-1004",
    derived_citizen_id: "5e21ab6c90",
    domain_id: "dom-water",
    description: "Visible leak from a main line, pooling water on the footpath.",
    before_photo_url: "https://images.unsplash.com/photo-1583912267550-d6c2ac3196c0?w=800&q=80",
    lat: 28.7041,
    long: 77.1025,
    status: "filed",
    assigned_authority_id: null,
    duplicate_of: null,
    upvote_count: 1,
    created_at: daysAgo(1)
  },
  {
    id: "c-1005",
    derived_citizen_id: "3d0f8b2c11",
    domain_id: "dom-road",
    description: "Faded zebra crossing near the school gate needs repainting.",
    before_photo_url: "https://images.unsplash.com/photo-1519500528435-f5641bee5a3c?w=800&q=80",
    lat: 28.5921,
    long: 77.049,
    status: "reopened",
    assigned_authority_id: "auth-pwd",
    duplicate_of: null,
    upvote_count: 2,
    created_at: daysAgo(9)
  }
];

export const caseAssignments: CaseAssignment[] = [
  { id: "ca-1001", complaint_id: "c-1001", officer_id: "off-1001", assigned_by: "auth-pwd", assigned_at: daysAgo(1), deadline: daysAgo(-2), priority: "urgent", status: "assigned" },
  { id: "ca-1003", complaint_id: "c-1002", officer_id: "off-1003", assigned_by: "auth-electric", assigned_at: daysAgo(2), deadline: daysAgo(-3), priority: "high", status: "assigned" },
  { id: "ca-1", complaint_id: "c-1001", officer_id: "off-1", assigned_by: "auth-pwd", assigned_at: daysAgo(5), deadline: daysAgo(-2), priority: "high", status: "authority_review" },
  { id: "ca-2", complaint_id: "c-1002", officer_id: "off-3", assigned_by: "auth-electric", assigned_at: daysAgo(2), deadline: daysAgo(-3), priority: "normal", status: "assigned" },
  { id: "ca-3", complaint_id: "c-1005", officer_id: "off-2", assigned_by: "auth-pwd", assigned_at: daysAgo(8), deadline: daysAgo(-1), priority: "low", status: "reopened" }
];

export const resolutions: Resolution[] = [
  {
    id: "res-1",
    complaint_id: "c-1001",
    officer_id: "off-1",
    after_photo_url: "https://images.unsplash.com/photo-1508615070457-7baeba4003ab?w=800&q=80",
    lat: 28.6692,
    long: 77.4538,
    resolved_at: daysAgo(1),
    officer_note: "Pothole filled and compacted, area cordoned overnight to cure.",
    record_hash: "8f14e45fceea167a5a36dedd4bea2543fceea1678f14e45fa36dedd4bea2543",
    review_status: "pending",
    reviewed_by: null,
    reviewed_at: null
  },
  {
    id: "res-2",
    complaint_id: "c-1003",
    officer_id: "off-4",
    after_photo_url: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&q=80",
    lat: 28.6139,
    long: 77.209,
    resolved_at: daysAgo(10),
    officer_note: "Bin cleared, extra pickup scheduled for the block.",
    record_hash: "3c59dc048e8850243be8079a5c74d079a5c74d04958a92d7dbf49b3684a3c59",
    review_status: "approved",
    reviewed_by: "auth-waste",
    reviewed_at: daysAgo(9)
  }
];

export const verifications: Verification[] = [
  {
    id: "ver-1",
    complaint_id: "c-1003",
    derived_citizen_id: "9c14f0d3aa",
    verdict: "confirmed",
    comment: "Corner is clean now, thank you.",
    created_at: daysAgo(8)
  },
  {
    id: "ver-2",
    complaint_id: "c-1005",
    derived_citizen_id: "3d0f8b2c11",
    verdict: "disputed",
    comment: "Paint job was never actually done, crossing is still faded.",
    created_at: daysAgo(1)
  }
];

// Citizen state for the currently "logged in" wallet in mock mode.
export const currentWallet = {
  wallet_id: "wallet-demo-0001",
  reputation_score: 58,
  filed_complaint_ids: ["c-1001", "c-1004"]
};

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export function findDomain(id: string): Domain | undefined {
  return domains.find((d) => d.id === id);
}
export function findAuthority(id: string | null): Authority | undefined {
  return id ? authorities.find((a) => a.id === id) : undefined;
}
export function findOfficer(id: string | null): Officer | undefined {
  return id ? officers.find((o) => o.id === id) : undefined;
}
