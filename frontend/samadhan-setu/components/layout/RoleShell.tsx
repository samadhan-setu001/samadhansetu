"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";

interface NavItem {
  href: string;
  label: string;
  badge?: number;
}

const ROLE_THEMES: Record<string, { badge: string; label: string; dot: string }> = {
  citizen: {
    badge: "bg-blue-50 text-civic border-blue-200",
    label: "Citizen Portal",
    dot: "bg-civic"
  },
  authority: {
    badge: "bg-indigo-50 text-steel border-indigo-200",
    label: "Authority Portal",
    dot: "bg-steel"
  },
  officer: {
    badge: "bg-purple-50 text-officer border-purple-200",
    label: "Officer Portal",
    dot: "bg-officer"
  }
};

export function RoleShell({
  role,
  roleLabel,
  identityLabel,
  items,
  onLogout,
  children
}: {
  role: "citizen" | "authority" | "officer";
  roleLabel: string;
  identityLabel: string;
  items: NavItem[];
  onLogout: () => void;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const theme = ROLE_THEMES[role] || ROLE_THEMES.citizen;

  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-paper-line bg-paper-raised/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3">
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3">
            <Link href="/" className="hover:opacity-90 transition-opacity">
              <Logo size="sm" showWordmark={true} />
            </Link>
            <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-paper-line">
              <span className={`h-2 w-2 rounded-full ${theme.dot}`} />
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                {roleLabel}
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "text-civic bg-civic-soft font-semibold shadow-sm"
                      : "text-ink-soft hover:text-ink hover:bg-paper-subtle"
                  }`}
                >
                  {item.label}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-civic text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Identity & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-paper-subtle border border-paper-line">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${theme.dot}`}>
                {identityLabel.slice(0, 1).toUpperCase()}
              </div>
              <span className="text-xs font-medium text-ink max-w-[120px] md:max-w-[160px] truncate">
                {identityLabel}
              </span>
            </div>

            <button
              onClick={() => {
                onLogout();
                router.push(`/${role}/login`);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-ink-soft hover:text-brick hover:bg-brick-soft transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Mobile Sub-Nav */}
        <nav className="flex md:hidden gap-1 overflow-x-auto border-t border-paper-line px-4 py-2 bg-paper/60">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium ${
                  active
                    ? "bg-civic text-white font-semibold"
                    : "text-ink-soft hover:text-ink hover:bg-paper-subtle"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-paper-line bg-paper-raised/60 py-6 text-center text-xs text-ink-muted">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Samadhan Setu Civic Trust Ledger. All records hash-chained and verifiable.</p>
          <div className="flex items-center gap-4 text-ink-soft">
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-verified" />
              Polygon Amoy Testnet
            </span>
            <span>·</span>
            <Link href="/" className="hover:text-civic transition-colors">Portal Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
