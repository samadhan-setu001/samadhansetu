"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/ui/Logo";
import { signInOfficer } from "@/lib/api";
import { useAuthRole } from "@/lib/hooks/useAuthRole";

const DEMO_OFFICERS = [
  { id: "OFF-1001", name: "R. Kumar", domain: "Road (1 Active Case)", pass: "VeriCity@2026!" },
  { id: "OFF-1003", name: "MR DEV", domain: "Streetlight (1 Active Case)", pass: "VeriCity@2026!" },
  { id: "OFF-1002", name: "MR RAHUL", domain: "Field Tech (Road)", pass: "VeriCity@2026!" }
];

export default function OfficerLoginPage() {
  const [officerId, setOfficerId] = useState("OFF-1001");
  const [password, setPassword] = useState("VeriCity@2026!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuthRole();
  const router = useRouter();

  const submit = async () => {
    setError(null);
    if (!officerId.trim()) {
      setError("Please enter an Officer ID (e.g. OFF-1001)");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }
    setLoading(true);
    try {
      const cleanId = officerId.trim().toUpperCase();
      const { id } = await signInOfficer(cleanId, password);
      login({ role: "officer", id, label: cleanId });
      router.push("/officer/cases");
    } catch (e: any) {
      setError(e.message ?? "Authentication failed. Check Officer ID and password.");
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
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-officer flex items-center justify-center font-bold text-lg">
              🛡️
            </div>
            <div>
              <h1 className="text-xl font-bold text-ink">Field Officer Portal</h1>
              <p className="text-xs text-ink-soft">Field Action & Proof Submission</p>
            </div>
          </div>

          {/* Portal Switcher */}
          <div className="flex rounded-lg bg-paper-subtle p-1 border border-paper-line mb-5">
            <Link
              href="/authority/login"
              className="flex-1 rounded-md py-1.5 text-xs font-semibold text-center text-ink-soft hover:text-steel transition-all flex items-center justify-center gap-1"
            >
              ← Authority Portal
            </Link>
            <div className="flex-1 rounded-md py-1.5 text-xs font-semibold text-center bg-white text-ink shadow-sm cursor-default">
              Officer Portal
            </div>
          </div>

          <p className="text-xs text-ink-soft leading-relaxed mb-6">
            Sign in using the official Officer ID assigned by your municipal authority.
            Resolutions require authenticated live after-photos chained to the immutable civic ledger.
          </p>

          <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex flex-col gap-4">
            <Input
              label="Officer ID"
              placeholder="OFF-1001"
              value={officerId}
              onChange={(e) => setOfficerId(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div>
              <p className="text-[11px] font-semibold text-ink-soft mb-1.5">Pre-configured Demo Officers (Click to Select):</p>
              <div className="grid grid-cols-3 gap-1.5">
                {DEMO_OFFICERS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => {
                      setOfficerId(o.id);
                      setPassword(o.pass);
                      setError(null);
                    }}
                    className={`text-left p-2 rounded-lg border text-xs transition-all ${
                      officerId === o.id
                        ? "border-officer bg-purple-50/70 text-officer font-semibold shadow-xs"
                        : "border-paper-line bg-paper text-ink-soft hover:border-slate-300"
                    }`}
                  >
                    <div className="font-bold text-[11px] text-officer">{o.id}</div>
                    <div className="text-[10px] text-ink font-medium truncate">{o.name}</div>
                    <div className="text-[9px] text-ink-muted truncate">{o.domain}</div>
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-xs font-medium text-brick">{error}</p>}

            <Button type="submit" disabled={loading} fullWidth className="mt-2 bg-officer hover:bg-purple-700">
              {loading ? "Authenticating…" : "Sign In to Cases"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
