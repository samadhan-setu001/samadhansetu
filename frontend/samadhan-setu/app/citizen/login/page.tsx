"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/ui/Logo";
import { requestCitizenOtp, verifyCitizenOtp, signUpWithEmail, signInCitizenEmail } from "@/lib/api";
import { useAuthRole } from "@/lib/hooks/useAuthRole";

type AuthMode = "email_signin" | "email_signup" | "phone";

export default function CitizenLoginPage() {
  const [mode, setMode] = useState<AuthMode>("email_signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [phoneStage, setPhoneStage] = useState<"phone" | "otp">("phone");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { login } = useAuthRole();
  const router = useRouter();

  // Email Sign In
  const handleEmailSignIn = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const { walletId } = await signInCitizenEmail(email.trim(), password);
      login({
        role: "citizen",
        id: walletId,
        label: `Citizen (${email.split("@")[0]})`
      });
      router.push("/citizen/complaints");
    } catch (e: any) {
      setError(e.message || "Failed to sign in. Check email and password.");
    } finally {
      setLoading(false);
    }
  };

  // Email Sign Up / Account Creation
  const handleEmailSignUp = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError("Please enter an email and a password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    setLoading(true);
    try {
      const { user } = await signUpWithEmail(email.trim(), password, "citizen", name.trim());
      setSuccessMsg("Account created successfully! Logging you in…");
      login({
        role: "citizen",
        id: user.id,
        label: `Citizen (${name.trim() || email.split("@")[0]})`
      });
      setTimeout(() => {
        router.push("/citizen/complaints");
      }, 400);
    } catch (e: any) {
      setError(e.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  // Phone OTP Flow
  const sendOtp = async () => {
    setError(null);
    if (phone.trim().length < 7) {
      setError("Enter a valid phone number (minimum 7 digits).");
      return;
    }
    setLoading(true);
    try {
      await requestCitizenOtp(phone.trim());
      setPhoneStage("otp");
    } catch (e: any) {
      setError(e.message ?? "Couldn't send code.");
    } finally {
      setLoading(false);
    }
  };

  const confirmOtp = async () => {
    setError(null);
    setLoading(true);
    try {
      const { walletId } = await verifyCitizenOtp(phone.trim(), code.trim() || "000000");
      login({
        role: "citizen",
        id: walletId,
        label: `Citizen (${phone.slice(-4) || walletId.slice(-6)})`
      });
      router.push("/citizen/complaints");
    } catch (e: any) {
      setError(e.message ?? "Code verification failed.");
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
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-civic flex items-center justify-center font-bold text-lg">
              👥
            </div>
            <div>
              <h1 className="text-xl font-bold text-ink">Citizen Portal</h1>
              <p className="text-xs text-ink-soft">Privacy-Preserving Civic Access</p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-lg bg-paper-subtle p-1 border border-paper-line mb-5">
            <button
              onClick={() => { setMode("email_signin"); setError(null); }}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
                mode === "email_signin" ? "bg-white text-ink shadow-sm" : "text-ink-soft hover:text-ink"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("email_signup"); setError(null); }}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
                mode === "email_signup" ? "bg-white text-ink shadow-sm" : "text-ink-soft hover:text-ink"
              }`}
            >
              Create Account
            </button>
            <button
              onClick={() => { setMode("phone"); setError(null); }}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
                mode === "phone" ? "bg-white text-ink shadow-sm" : "text-ink-soft hover:text-ink"
              }`}
            >
              Phone OTP
            </button>
          </div>

          {/* 1. EMAIL SIGN IN */}
          {mode === "email_signin" && (
            <div className="flex flex-col gap-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="citizen@example.com"
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

              {error && <p className="text-xs font-medium text-brick">{error}</p>}
              {successMsg && <p className="text-xs font-medium text-verified">{successMsg}</p>}

              <Button onClick={handleEmailSignIn} disabled={loading} fullWidth className="mt-1">
                {loading ? "Signing In…" : "Sign In to Citizen Portal"}
              </Button>

              <p className="text-xs text-center text-ink-soft mt-1">
                Don't have an account yet?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("email_signup"); setError(null); }}
                  className="font-semibold text-civic hover:underline"
                >
                  Create one now
                </button>
              </p>
            </div>
          )}

          {/* 2. CREATE ACCOUNT */}
          {mode === "email_signup" && (
            <div className="flex flex-col gap-4">
              <Input
                label="Full Name (Optional)"
                placeholder="e.g. Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="Password"
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {error && <p className="text-xs font-medium text-brick">{error}</p>}
              {successMsg && <p className="text-xs font-medium text-verified">{successMsg}</p>}

              <Button onClick={handleEmailSignUp} disabled={loading} fullWidth className="mt-1">
                {loading ? "Creating Account…" : "Create Citizen Account"}
              </Button>

              <p className="text-xs text-center text-ink-soft mt-1">
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("email_signin"); setError(null); }}
                  className="font-semibold text-civic hover:underline"
                >
                  Sign in here
                </button>
              </p>
            </div>
          )}

          {/* 3. PHONE OTP */}
          {mode === "phone" && (
            <div>
              {phoneStage === "phone" ? (
                <div className="flex flex-col gap-4">
                  <Input
                    label="Mobile Phone Number"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  {error && <p className="text-xs font-medium text-brick">{error}</p>}
                  <Button onClick={sendOtp} disabled={loading} fullWidth>
                    {loading ? "Sending Code…" : "Continue with Phone"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => { setPhone("+91 98765 43210"); setCode("000000"); }}
                    className="text-xs text-center text-civic hover:underline"
                  >
                    Quick demo number
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <Input
                    label="Verification Code"
                    inputMode="numeric"
                    placeholder="000000"
                    hint="Use code 000000 or SMS token."
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                  {error && <p className="text-xs font-medium text-brick">{error}</p>}
                  <Button onClick={confirmOtp} disabled={loading} fullWidth>
                    {loading ? "Verifying…" : "Verify & Sign In"}
                  </Button>
                  <button
                    onClick={() => setPhoneStage("phone")}
                    className="text-xs text-center text-ink-soft hover:text-ink"
                  >
                    ← Use different number
                  </button>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
