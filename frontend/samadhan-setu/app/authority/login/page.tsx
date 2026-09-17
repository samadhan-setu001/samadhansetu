"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/ui/Logo";
import { signInAuthority, fetchAuthority } from "@/lib/api";
import { useAuthRole } from "@/lib/hooks/useAuthRole";

const DEMO_AUTHORITIES = [
  { email: "pwd@city.gov", domain: "Road", label: "Public Works (Road)" },
  { email: "electric@city.gov", domain: "Streetlight", label: "Electric Board (Streetlight)" },
  { email: "water@city.gov", domain: "Water", label: "Water & Sewerage (Water)" },
  { email: "waste@city.gov", domain: "Waste", label: "Solid Waste Management (Waste)" }
];

export default function AuthorityLoginPage() {
  const [email, setEmail] = useState("pwd@city.gov");
  const [password, setPassword] = useState("VeriCity@2026!");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuthRole();
  const router = useRouter();

  const handleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const { authorityId } = await signInAuthority(email.trim(), password);
      const authority = await fetchAuthority(authorityId);
      login({
        role: "authority",
        id: authorityId,
        label: authority?.name ?? "Authority Admin"
      });
      router.push("/authority/dashboard");
    } catch (e: any) {
      setError(e.message ?? "Authentication failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 py-12 font-sans">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-civic transition-colors">
            ← Back to Overview
          </Link>
          <Logo size="sm" showWordmark={false} />
        </div>

        <Card className="p-7 sm:p-8 shadow-card-hover border-paper-line">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-steel flex items-center justify-center font-bold text-lg">
              🏛️
            </div>
            <div>
              <h1 className="text-xl font-bold text-ink">Authority Portal</h1>
              <p className="text-xs text-ink-soft">Municipal Dispatch & Domain Oversight</p>
            </div>
          </div>

          {/* Portal Switcher */}
          <div className="flex rounded-lg bg-paper-subtle p-1 border border-paper-line mb-5">
            <div className="flex-1 rounded-md py-1.5 text-xs font-semibold text-center bg-white text-ink shadow-sm cursor-default">
              Authority Sign In
            </div>
            <Link
              href="/officer/login"
              className="flex-1 rounded-md py-1.5 text-xs font-semibold text-center text-ink-soft hover:text-officer transition-all flex items-center justify-center gap-1"
            >
              Officer Portal →
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            <Input
              label="Work Email"
              type="email"
              placeholder="pwd@city.gov"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div>
              <p className="text-[11px] font-semibold text-ink-soft mb-1.5">Pre-seeded Authority Accounts:</p>
              <div className="grid grid-cols-2 gap-1.5">
                {DEMO_AUTHORITIES.map((a) => (
                  <button
                    key={a.email}
                    type="button"
                    onClick={() => {
                      setEmail(a.email);
                      setPassword("VeriCity@2026!");
                      setError(null);
                    }}
                    className={`text-left p-2.5 rounded-lg border text-xs transition-colors ${
                      email === a.email
                        ? "border-steel bg-indigo-50/70 text-steel font-medium shadow-xs"
                        : "border-paper-line bg-paper text-ink-soft hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <div className="font-semibold text-xs truncate">{a.label}</div>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white border border-paper-line text-ink-soft flex-shrink-0">
                        {a.domain}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-ink-muted">{a.email}</div>
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-xs font-medium text-brick">{error}</p>}

            <Button onClick={handleSignIn} disabled={loading} fullWidth className="mt-2 bg-steel hover:bg-blue-800">
              {loading ? "Authenticating…" : "Sign In to Dashboard"}
            </Button>

            <p className="text-[11px] text-center text-ink-muted mt-1">
              Authority accounts are provisioned by system administrators.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
