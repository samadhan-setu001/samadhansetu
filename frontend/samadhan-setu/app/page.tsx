import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const roles = [
  {
    href: "/citizen/login",
    tag: "Citizen Portal",
    tagHindi: "नागरिक पोर्टल",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    borderAccent: "border-b-4 border-b-blue-600",
    accent: "hover:border-blue-500/60 hover:shadow-card-hover",
    iconBg: "bg-blue-50 text-blue-600",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Report & Verify",
    body: "Snap a live, GPS-locked photo of an issue — potholes, broken streetlights, water leaks, or waste — and follow it until it's verifiably fixed. Your identity stays completely private.",
    cta: "Go to Citizen Portal"
  },
  {
    href: "/authority/login",
    tag: "Authority Dashboard",
    tagHindi: "प्राधिकरण डैशबोर्ड",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
    borderAccent: "border-b-4 border-b-emerald-600",
    accent: "hover:border-emerald-500/60 hover:shadow-card-hover",
    iconBg: "bg-emerald-50 text-emerald-700",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    title: "Route & Review Proof",
    body: "Manage the domain complaint queue, get ranked officer recommendations, dispatch work, and sign off only after examining immutable photographic proof of resolution.",
    cta: "Access Authority Dashboard"
  },
  {
    href: "/officer/login",
    tag: "Officer Field Portal",
    tagHindi: "अधिकारी फील्ड पोर्टल",
    badge: "bg-amber-50 text-amber-800 border-amber-200",
    borderAccent: "border-b-4 border-b-amber-500",
    accent: "hover:border-amber-500/60 hover:shadow-card-hover",
    iconBg: "bg-amber-50 text-amber-600",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Execute & Prove Work",
    body: "Accept assigned cases in the field, resolve the civic issue, and submit a live after-photo with timestamp and GPS — attributed to your authenticated identity and sealed forever.",
    cta: "Launch Officer Portal"
  }
];

const lifecycleSteps = [
  {
    step: "01",
    title: "Live GPS Capture",
    desc: "Citizen snaps a live, camera-only photo with GPS lock. No gallery uploads. Duplicate check scans 75m radius."
  },
  {
    step: "02",
    title: "Intelligent Routing",
    desc: "Automatically routed to the responsible municipal authority (Road, Streetlight, Water, Waste) for officer assignment."
  },
  {
    step: "03",
    title: "Field Proof & Hash Chain",
    desc: "Officer fixes the issue and submits live after-photo. System creates a SHA-256 cryptographic hash chained to previous resolution."
  },
  {
    step: "04",
    title: "Citizen Sign-Off",
    desc: "The citizen who reported holds the ultimate authority: confirm resolution (+2 reputation) or dispute it to reopen (-6 reputation)."
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans selection:bg-amber-200">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b border-paper-line bg-paper-raised/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3">
          <Logo size="md" showWordmark={true} />
          
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-ink-soft">
            <Link href="/" className="text-civic hover:text-civic-hover transition-colors">Home</Link>
            <Link href="/citizen/login" className="hover:text-ink transition-colors">Report an Issue</Link>
            <Link href="/citizen/complaints" className="hover:text-ink transition-colors">Track Status</Link>
            <Link href="/authority/login" className="hover:text-ink transition-colors">Authority Portal</Link>
            <Link href="/officer/login" className="hover:text-ink transition-colors">Officer Portal</Link>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-verified-soft text-verified text-xs font-semibold border border-verified-border">
              <span className="h-2 w-2 rounded-full bg-verified animate-pulse" />
              Live Cryptographic Ledger
            </div>
            <Link
              href="/citizen/login"
              className="inline-flex items-center justify-center rounded-lg bg-civic px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-civic-hover transition-colors"
            >
              Sign In →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Illuminated Parliament Background */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-20 bg-slate-950 text-white">
        {/* Background Image & Warm Atmospheric Overlays */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-75"
          style={{ backgroundImage: `url('/parliament-bg.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/45 to-slate-950/85" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 text-center z-10">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-black/40 backdrop-blur-md px-4 py-1.5 text-xs font-medium text-amber-200 shadow-lg">
            <span className="h-2 w-2 rounded-full bg-[#FF9933] animate-pulse" />
            <span>Connecting Localities · Resolution-Driven · Tamper-Proof Record</span>
          </div>

          {/* Main Title (Chosen by User) */}
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-5xl md:text-5xl sm:leading-tight drop-shadow-lg">
            From Issue to Action: Every Civic Problem Verifiably Resolved
          </h1>

          {/* Hindi Line (Chosen by User) */}
          <p className="mt-3 text-lg sm:text-2xl font-bold text-amber-300 drop-shadow">
            समाधान सेतु: हर समस्या का त्वरित एवं प्रमाणित समाधान
          </p>

          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-slate-200 leading-relaxed drop-shadow">
            A transparent, tamper-proof platform connecting citizens with municipal authorities and field officers.
          </p>

          {/* Action CTA */}
          <div className="mt-8 flex justify-center">
            <Link
              href="/citizen/login"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#FF9933] hover:bg-[#e68525] px-8 py-3.5 text-sm font-bold text-slate-950 shadow-xl transition-all"
            >
              <span>File a Civic Report</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>

          {/* 3 Portal Cards (Concept 2 Clean White Cards) */}
          <div className="mt-12 grid gap-5 md:grid-cols-3 text-left">
            {roles.map((role) => (
              <Link
                key={role.href}
                href={role.href}
                className={`group flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-6 shadow-xl hover:shadow-2xl transition-all duration-200 ${role.borderAccent} hover:-translate-y-0.5`}
              >
                <div>
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${role.iconBg}`}>
                      {role.icon}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {role.tag}
                      </h3>
                      <p className="text-[11px] font-medium text-slate-500">
                        {role.tagHindi}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3.5 text-xs leading-relaxed text-slate-600">
                    {role.body}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                  <span>{role.cta}</span>
                  <span className="transform transition-transform group-hover:translate-x-1">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Lifecycle Walkthrough */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-civic">Audit Trail Architecture</h2>
            <p className="mt-2 text-3xl font-extrabold text-ink">How Verification Works</p>
            <p className="mt-3 text-sm text-ink-soft">
              No complaint can be silently marked fixed. Proof is chained from reporting to sign-off.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {lifecycleSteps.map((item) => (
              <div key={item.step} className="relative rounded-xl border border-paper-line bg-paper-raised p-6 shadow-card">
                <span className="font-mono text-3xl font-black text-paper-line">
                  {item.step}
                </span>
                <h4 className="mt-3 text-base font-bold text-ink">{item.title}</h4>
                <p className="mt-2 text-xs leading-relaxed text-ink-soft">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Tech Specs */}
      <section className="py-10 border-t border-paper-line bg-paper-subtle/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-ink-soft">
          <div>
            <span className="font-bold text-ink">Backend Infrastructure:</span> Powered by Supabase PostgreSQL, Row Level Security, Edge Functions & SHA-256 Record Chaining.
          </div>
          <div className="flex items-center gap-6">
            <span>Domains: <strong>Road</strong>, <strong>Streetlight</strong>, <strong>Water</strong>, <strong>Waste</strong></span>
            <span>·</span>
            <span>Security: <strong>Zero-Trust RLS</strong></span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-paper-line bg-paper-raised py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-muted">
          <div className="flex flex-wrap items-center gap-6 font-medium text-ink-soft">
            <Link href="/" className="hover:text-civic transition-colors">Home</Link>
            <Link href="/citizen/login" className="hover:text-civic transition-colors">Report an Issue</Link>
            <Link href="/citizen/complaints" className="hover:text-civic transition-colors">Track Status</Link>
            <Link href="/authority/login" className="hover:text-civic transition-colors">Authority Portal</Link>
            <Link href="/officer/login" className="hover:text-civic transition-colors">Officer Portal</Link>
          </div>
          <p className="text-right">
            Samadhan Setu · Independent civic issue resolution platform.
          </p>
        </div>
      </footer>
    </div>
  );
}
