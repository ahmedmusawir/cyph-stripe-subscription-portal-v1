"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// REAL Supabase auth (kit /api/auth/login).
// TEMPORARY GATE (cleanup 2026-10-26): still gated on the super-admin role —
// non-super-admins are signed out. Customer sign-in policy arrives with the FFM.
export function LoginPageContent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // .catch() chains, not try/catch (kit gotcha: dev overlay intercepts throws).
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).catch(() => null);

    if (!res) {
      setError("Could not reach the server. Try again.");
      setLoading(false);
      return;
    }

    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(result.error || "Login failed.");
      setLoading(false);
      return;
    }

    // Real role from the auth response. TEMPORARY: super-admin only.
    if (result.data?.role !== "superadmin") {
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
      setError("Sign-in is restricted to super admins during foundation work.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <div className="w-full max-w-sm border border-border bg-card p-6">
        {/* Brand: logo-color.svg is self-contained (coral tile + white drop) — safe
            on both themes. Wordmark is token-colored HTML, never logo-lockup.svg
            (baked dark text dies on Slate). */}
        <div className="mb-6 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-color.svg" alt="Cyber Pharma" className="h-10 w-10" />
          <div className="leading-tight">
            <p className="text-sm font-bold uppercase tracking-wide text-foreground">
              Cyber Pharma
            </p>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Subscription Portal
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={!canSubmit}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
