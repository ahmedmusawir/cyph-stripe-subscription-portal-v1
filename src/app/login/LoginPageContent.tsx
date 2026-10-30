"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isPortalStaffRole } from "@/services/auth/access";
import { clearDemoStorage } from "@/services/portal";
import { Alert, DemoNotice, Placeholder } from "@/components/portal/Alert";
import { TextField } from "@/components/portal/FormField";
import { PageContainer } from "@/components/portal/Loading";

// REAL Supabase auth (kit /api/auth/login), with the designed sign-in
// presentation (UI_SPEC sign-in; RULINGS R-009 — no separate simulated login).
// TEMPORARY RULE (Director ruling R-008, 2026-10-27): admin or superadmin may
// continue; any other role is signed out again. The server layout/page gates
// are the real check — this only gives an early, friendly message.
export function LoginPageContent({ sessionExpired }: { sessionExpired: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<{ title: string; body?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Account demo state never outlives a session (expiry, sign-out elsewhere).
  useEffect(() => clearDemoStorage("account"), []);

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
      setError({ title: "Could not reach the server. Try again." });
      setLoading(false);
      return;
    }

    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(
        /invalid login credentials/i.test(String(result.error))
          ? { title: "That email and password don't match", body: "Check both and try again." }
          : { title: result.error || "Login failed." },
      );
      setLoading(false);
      return;
    }

    // Real role from the auth response (user_roles). TEMPORARY: admin or superadmin.
    if (!isPortalStaffRole(result.data?.role)) {
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
      setError({ title: "This account does not have access to account management." });
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <PageContainer width="md">
      <DemoNotice>Sign-in is real; the account details you see afterwards are synthetic demo data.</DemoNotice>
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Account &amp; Billing</p>
      <h1 className="mt-1 text-[26px] font-bold leading-tight text-foreground md:text-[32px]">Sign in</h1>
      <p className="mt-1 text-sm text-muted-foreground">Same sign-in as OwedBook. Use your existing account to manage your subscription.</p>

      {sessionExpired ? (
        <Alert tone="info" className="mt-5" title="Your session expired">
          Sign in again to continue. Nothing you did on Stripe&apos;s page is lost — your summary refreshes after sign-in.
        </Alert>
      ) : null}
      {error ? (
        <Alert tone="destructive" className="mt-5" title={error.title}>
          {error.body}
        </Alert>
      ) : null}

      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4 border border-border bg-card p-4 sm:p-5">
        <TextField
          id="email"
          type="email"
          autoComplete="email"
          label="Work email"
          value={email}
          onValue={setEmail}
          aria-invalid={error ? true : undefined}
        />
        <TextField
          id="password"
          type="password"
          autoComplete="current-password"
          label="Password"
          value={password}
          onValue={setPassword}
          aria-invalid={error ? true : undefined}
        />
        <Button type="submit" className="w-full" disabled={!canSubmit} aria-busy={loading || undefined}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          Forgot your password? <Placeholder>[RESET FLOW — not in this portal&apos;s scope]</Placeholder> · Contact <Placeholder>[SUPPORT EMAIL]</Placeholder>
        </p>
      </form>
      <p className="mt-6 text-sm text-muted-foreground">
        New pharmacy? <Link href="/demo/register/plan" className="portal-link">Start a subscription</Link>
      </p>
    </PageContainer>
  );
}
