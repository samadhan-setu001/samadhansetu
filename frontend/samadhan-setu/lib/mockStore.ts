import type {
  Authority,
  CaseAssignment,
  ComplaintProof,
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
  { id: "off-4", officer_id: "OFF-3050", name: "K. Das", authority_id: "auth-water", domain_id: "dom-water", active: true, open_case_count: 3, performance_score: 66 },
  { id: "off-5", officer_id: "OFF-4001", name: "V. Sharma", authority_id: "auth-waste", domain_id: "dom-waste", active: true, open_case_count: 1, performance_score: 75 }
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
    before_photo_url: "https://images.unsplash.com/photo-1527066579998-dbbae57f45ce?w=800&q=80",
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
    before_photo_url: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&q=80",
    lat: 28.5921,
    long: 77.049,
    status: "reopened",
    assigned_authority_id: "auth-pwd",
    duplicate_of: null,
    upvote_count: 2,
    created_at: daysAgo(9)
  },
  {
    id: "c-1006",
    derived_citizen_id: "8c91a03f44",
    domain_id: "dom-road",
    description: "Deep pothole and waterlogging reported during diagnostic test run — hazard to two-wheelers.",
    before_photo_url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80",
    lat: 28.4504,
    long: 76.9886,
    status: "filed",
    assigned_authority_id: "auth-pwd",
    duplicate_of: null,
    upvote_count: 4,
    created_at: daysAgo(0)
  },
  {
    id: "c-1007",
    derived_citizen_id: "3e449b10cc",
    domain_id: "dom-streetlight",
    description: "Streetlight short circuit and failure outside block C gate during evening inspection.",
    before_photo_url: "https://images.unsplash.com/photo-1542332213-31f87348057f?w=800&q=80",
    lat: 28.4521,
    long: 76.9912,
    status: "assigned",
    assigned_authority_id: "auth-electric",
    duplicate_of: null,
    upvote_count: 2,
    created_at: daysAgo(0)
  },
  {
    id: "c-test-101",
    derived_citizen_id: "7f3a9c2e1b",
    domain_id: "dom-road",
    description: "Test pothole report (Automated test run case — verified & resolved)",
    before_photo_url: "https://images.unsplash.com/photo-1584467541268-b040f83be3fd?w=800&q=80",
    lat: 28.6692,
    long: 77.4538,
    status: "resolved",
    assigned_authority_id: "auth-pwd",
    duplicate_of: null,
    upvote_count: 8,
    created_at: daysAgo(0)
  }
];

export const caseAssignments: CaseAssignment[] = [
  { id: "ca-1001", complaint_id: "c-1001", officer_id: "off-1001", assigned_by: "auth-pwd", assigned_at: daysAgo(1), deadline: daysAgo(-2), priority: "urgent", status: "assigned" },
  { id: "ca-1003", complaint_id: "c-1002", officer_id: "off-1003", assigned_by: "auth-electric", assigned_at: daysAgo(2), deadline: daysAgo(-3), priority: "high", status: "assigned" },
  { id: "ca-1", complaint_id: "c-1001", officer_id: "off-1", assigned_by: "auth-pwd", assigned_at: daysAgo(5), deadline: daysAgo(-2), priority: "high", status: "authority_review" },
  { id: "ca-2", complaint_id: "c-1002", officer_id: "off-3", assigned_by: "auth-electric", assigned_at: daysAgo(2), deadline: daysAgo(-3), priority: "normal", status: "assigned" },
  { id: "ca-3", complaint_id: "c-1005", officer_id: "off-2", assigned_by: "auth-pwd", assigned_at: daysAgo(8), deadline: daysAgo(-1), priority: "low", status: "reopened" },
  { id: "ca-4", complaint_id: "c-1003", officer_id: "off-5", assigned_by: "auth-waste", assigned_at: daysAgo(11), deadline: daysAgo(-1), priority: "high", status: "resolved" },
  { id: "ca-1007", complaint_id: "c-1007", officer_id: "off-1003", assigned_by: "auth-electric", assigned_at: daysAgo(0), deadline: daysAgo(-2), priority: "high", status: "assigned" },
  { id: "ca-test-101", complaint_id: "c-test-101", officer_id: "off-1", assigned_by: "auth-pwd", assigned_at: daysAgo(0), deadline: daysAgo(-2), priority: "high", status: "resolved" }
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
  },
  {
    id: "res-test-101",
    complaint_id: "c-test-101",
    officer_id: "off-1",
    after_photo_url: "https://images.unsplash.com/photo-1508615070457-7baeba4003ab?w=800&q=80",
    lat: 28.6692,
    long: 77.4538,
    resolved_at: daysAgo(0),
    officer_note: "Pothole filled with asphalt, compaction verified on site.",
    record_hash: "9a21b34fedc1029384758bca120934857bca1029384758bca120934857bca102",
    review_status: "approved",
    reviewed_by: "auth-pwd",
    reviewed_at: daysAgo(0)
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
  },
  {
    id: "ver-test-101",
    complaint_id: "c-test-101",
    derived_citizen_id: "7f3a9c2e1b",
    verdict: "confirmed",
    comment: "Looks great! Repair confirmed by citizen during test run.",
    created_at: daysAgo(0)
  }
];

export const complaintProofs: ComplaintProof[] = [
  {
    id: "prf-1",
    complaint_id: "c-1001",
    derived_citizen_id: "e4a3b198ff",
    photo_url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80",
    lat: 28.6693,
    long: 77.4539,
    created_at: daysAgo(4)
  }
];

// Citizen state for the currently "logged in" wallet in mock mode.
export const currentWallet = {
  wallet_id: "wallet-demo-0001",
  reputation_score: 58,
  filed_complaint_ids: ["c-1001", "c-1004", "c-1006", "c-1007", "c-test-101"]
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
  if (!id) return undefined;
  const lower = id.toLowerCase();
  return authorities.find(
    (a) => a.id.toLowerCase() === lower || a.domain_id.toLowerCase() === lower
  );
}

export function findOfficer(id: string | null): Officer | undefined {
  if (!id) return undefined;
  const lower = id.toLowerCase();
  return officers.find(
    (o) => o.id.toLowerCase() === lower || o.officer_id.toLowerCase() === lower
  );
}

// ─────────────────────────────────────────────────────────────────────────
// BROWSER LOCALSTORAGE PERSISTENCE
// ─────────────────────────────────────────────────────────────────────────

const STORAGE_PREFIX = "vericity_mock_";

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveMockStore() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_PREFIX + "complaints", JSON.stringify(complaints));
    localStorage.setItem(STORAGE_PREFIX + "assignments", JSON.stringify(caseAssignments));
    localStorage.setItem(STORAGE_PREFIX + "resolutions", JSON.stringify(resolutions));
    localStorage.setItem(STORAGE_PREFIX + "verifications", JSON.stringify(verifications));
    localStorage.setItem(STORAGE_PREFIX + "proofs", JSON.stringify(complaintProofs));
    localStorage.setItem(STORAGE_PREFIX + "wallet_ids", JSON.stringify(currentWallet.filed_complaint_ids));
  } catch (e) {
    console.warn("Storage save failed:", e);
  }
}

const DEFAULT_COMPLAINTS = [...complaints];
const DEFAULT_ASSIGNMENTS = [...caseAssignments];
const DEFAULT_RESOLUTIONS = [...resolutions];
const DEFAULT_VERIFICATIONS = [...verifications];
const DEFAULT_WALLET_IDS = [...currentWallet.filed_complaint_ids];

export function hydrateMockStore() {
  if (typeof window === "undefined") return;
  try {
    const savedComplaints = loadFromStorage<ComplaintPublic[] | null>("complaints", null);
    if (savedComplaints && Array.isArray(savedComplaints) && savedComplaints.length) {
      // Heal broken photo URLs from old cache
      for (const sc of savedComplaints) {
        if (sc.before_photo_url?.includes("1583912267550-d6c2ac3196c0")) {
          sc.before_photo_url = "https://images.unsplash.com/photo-1527066579998-dbbae57f45ce?w=800&q=80";
        }
        if (sc.before_photo_url?.includes("1519500528435-f5641bee5a3c")) {
          sc.before_photo_url = "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&q=80";
        }
        if (sc.before_photo_url === "data:image/jpeg;base64,/9j/4AAQSkZJRg==") {
          sc.before_photo_url = "https://images.unsplash.com/photo-1584467541268-b040f83be3fd?w=800&q=80";
        }
      }
      // Merge: preserve saved complaints, but also include any default complaints that are missing
      const seen = new Set(savedComplaints.map((c) => c.id));
      for (const dc of DEFAULT_COMPLAINTS) {
        if (!seen.has(dc.id)) {
          savedComplaints.push(dc);
          seen.add(dc.id);
        }
      }
      complaints.length = 0;
      complaints.push(...savedComplaints);
    }

    const savedAssignments = loadFromStorage<CaseAssignment[] | null>("assignments", null);
    if (savedAssignments && Array.isArray(savedAssignments) && savedAssignments.length) {
      const seen = new Set(savedAssignments.map((a) => a.id));
      for (const da of DEFAULT_ASSIGNMENTS) {
        if (!seen.has(da.id)) {
          savedAssignments.push(da);
          seen.add(da.id);
        }
      }
      caseAssignments.length = 0;
      caseAssignments.push(...savedAssignments);
    }

    const savedResolutions = loadFromStorage<Resolution[] | null>("resolutions", null);
    if (savedResolutions && Array.isArray(savedResolutions) && savedResolutions.length) {
      const seen = new Set(savedResolutions.map((r) => r.id));
      for (const dr of DEFAULT_RESOLUTIONS) {
        if (!seen.has(dr.id)) {
          savedResolutions.push(dr);
          seen.add(dr.id);
        }
      }
      resolutions.length = 0;
      resolutions.push(...savedResolutions);
    }

    const savedVerifications = loadFromStorage<Verification[] | null>("verifications", null);
    if (savedVerifications && Array.isArray(savedVerifications) && savedVerifications.length) {
      const seen = new Set(savedVerifications.map((v) => v.id));
      for (const dv of DEFAULT_VERIFICATIONS) {
        if (!seen.has(dv.id)) {
          savedVerifications.push(dv);
          seen.add(dv.id);
        }
      }
      verifications.length = 0;
      verifications.push(...savedVerifications);
    }

    const savedProofs = loadFromStorage<ComplaintProof[] | null>("proofs", null);
    if (savedProofs && Array.isArray(savedProofs) && savedProofs.length) {
      complaintProofs.length = 0;
      complaintProofs.push(...savedProofs);
    }

    const savedWalletIds = loadFromStorage<string[] | null>("wallet_ids", null);
    if (savedWalletIds && Array.isArray(savedWalletIds) && savedWalletIds.length) {
      currentWallet.filed_complaint_ids = Array.from(
        new Set([...currentWallet.filed_complaint_ids, ...savedWalletIds, ...DEFAULT_WALLET_IDS])
      );
    }
  } catch (e) {
    console.warn("Hydrate mock store failed:", e);
  }
}

// Auto-hydrate when loaded in the browser
if (typeof window !== "undefined") {
  hydrateMockStore();
}

