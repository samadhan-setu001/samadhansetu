"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/ui/Logo";
import { requestCitizenOtp, verifyCitizenOtp } from "@/lib/api";
import { useAuthRole } from "@/lib/hooks/useAuthRole";

const DEMO_PHONES = [
  { phone: "+91 98765 43210", label: "Priya Sharma", tag: "Active Citizen" },
  { phone: "+91 98123 45678", label: "Amit Verma", tag: "Frequent Reporter" },
  { phone: "+91 99000 11222", label: "Kavita Rao", tag: "New Resident" }
];

export default function CitizenLoginPage() {
  const [phone, setPhone] = useState("+91 98765 43210");
  const [code, setCode] = useState("000000");
  const [stage, setStage] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuthRole();
  const router = useRouter();

  // Send OTP
  const sendOtp = async () => {
    setError(null);
    if (phone.trim().length < 7) {
      setError("Please enter a valid phone number (e.g. +91 98765 43210).");
      return;
    }
    setLoading(true);
    try {
      await requestCitizenOtp(phone.trim());
      setStage("otp");
    } catch (e: any) {
      setError(e.message ?? "Failed to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and enter portal
  const confirmOtp = async () => {
    setError(null);
    setLoading(true);
    try {
      const cleanCode = code.trim() || "000000";
      const { walletId } = await verifyCitizenOtp(phone.trim(), cleanCode);
      
      login({
        role: "citizen",
        id: walletId,
        label: walletId.startsWith("0x")
          ? `Citizen (${walletId.slice(0, 6)}…${walletId.slice(-4)})`
          : `Citizen (${phone.slice(-4)})`
      });
      router.push("/citizen/complaints");
    } catch (e: any) {
      setError(e.message ?? "Verification failed. Please check the code.");
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
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-civic flex items-center justify-center font-bold text-lg">
              🛡️
            </div>
            <div>
              <h1 className="text-xl font-bold text-ink">Citizen Portal</h1>
              <p className="text-xs text-ink-soft">Safe, Private & Direct Civic Action</p>
            </div>
          </div>

          {/* Safety First & Citizen Privacy Assurance */}
          <div className="rounded-xl bg-gradient-to-br from-blue-50/80 to-emerald-50/50 border border-blue-100/80 p-3.5 mb-5 text-xs space-y-2 shadow-xs">
            <div className="flex items-center gap-1.5 font-bold text-ink">
              <span className="text-sm">🛡️</span>
              <span>Safety & Transparency First</span>
            </div>
            <p className="text-ink-soft leading-relaxed text-[11px]">
              Your voice matters, and your personal privacy is 100% protected. When you sign in with your mobile number, the system automatically creates a <strong>Private Digital ID (Web3 Citizen Wallet)</strong>.
            </p>
            <div className="pt-2 border-t border-blue-100/80 flex flex-col gap-1.5 text-[11px] text-ink-soft">
              <div className="flex items-start gap-1.5">
                <span className="text-verified font-bold mt-0.5">✓</span>
                <span><strong>No Identity Exposure:</strong> Municipal staff and public boards only see the issue location and proof — never your private phone number.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-verified font-bold mt-0.5">✓</span>
                <span><strong>Citizen Final Say:</strong> Only your private digital key can sign off to confirm that a repair was actually completed.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-verified font-bold mt-0.5">✓</span>
                <span><strong>Zero Passwords:</strong> Quick, secure OTP login every time without remembering credentials.</span>
              </div>
            </div>
          </div>

          {stage === "phone" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendOtp();
              }}
              className="flex flex-col gap-4"
            >
              <Input
                label="Mobile Phone Number"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoFocus
              />

              <div>
                <p className="text-[11px] font-semibold text-ink-soft mb-1.5">
                  Pre-configured Demo Citizens (Click to Select):
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {DEMO_PHONES.map((p) => (
                    <button
                      key={p.phone}
                      type="button"
                      onClick={() => {
                        setPhone(p.phone);
                        setCode("000000");
                        setError(null);
                      }}
                      className={`text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                        phone === p.phone
                          ? "border-civic bg-blue-50/70 text-civic font-semibold shadow-xs"
                          : "border-paper-line bg-paper text-ink-soft hover:border-slate-300"
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs">{p.label}</div>
                        <div className="font-mono text-[11px] text-ink-muted">{p.phone}</div>
                      </div>
                      <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-paper-line font-medium text-ink-soft">
                        {p.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-xs font-medium text-brick">{error}</p>}

              <Button type="submit" disabled={loading} fullWidth className="mt-1">
                {loading ? "Sending OTP…" : "Continue with Phone"}
              </Button>
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                confirmOtp();
              }}
              className="flex flex-col gap-4"
            >
              <div className="rounded-lg bg-paper-subtle p-3 text-xs flex items-center justify-between">
                <div>
                  <span className="text-ink-muted">Code sent to:</span>{" "}
                  <strong className="text-ink font-mono">{phone}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStage("phone");
                    setError(null);
                  }}
                  className="text-civic font-semibold hover:underline text-[11px]"
                >
                  Change
                </button>
              </div>

              <Input
                label="Verification Code (OTP)"
                inputMode="numeric"
                placeholder="000000"
                hint="For demo, enter code 000000 or your SMS code."
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoFocus
              />

              {error && <p className="text-xs font-medium text-brick">{error}</p>}

              <Button type="submit" disabled={loading} fullWidth>
                {loading ? "Verifying & Connecting Secure ID…" : "Verify & Enter Portal"}
              </Button>

              <button
                type="button"
                onClick={() => setStage("phone")}
                className="text-xs text-center text-ink-soft hover:text-ink transition-colors"
              >
                ← Back to Phone Number
              </button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
