"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, DemoNotice, Placeholder } from "../Alert";
import { ExternalHandoffPanel } from "../ExternalHandoffPanel";
import { PageContainer, ViewSkeleton } from "../Loading";
import { registration, useRegistration } from "@/services/portal";

// C17 Access link: valid → labelled downstream account-setup boundary;
// expired/used → request a new link with neutral feedback. Never shows or
// edits an email address, never signs anyone in, never creates an account.
export function AccessLinkView() {
  const { state, hydrated } = useRegistration();
  const [busy, setBusy] = useState(false);
  const [setup, setSetup] = useState(false);

  if (!hydrated) return <PageContainer width="xl"><ViewSkeleton /></PageContainer>;

  async function request() {
    setBusy(true);
    await registration.requestNewAccessLink();
    setBusy(false);
  }
  async function continueSetup() {
    setBusy(true);
    const r = await registration.useAccessLink();
    setBusy(false);
    if (r.ok) setSetup(true);
  }

  const signIn = (
    <p className="mt-6 text-xs text-muted-foreground">
      Already set up? <Link href="/login" className="portal-link">Sign in</Link>
    </p>
  );

  if (setup) {
    return (
      <PageContainer width="xl">
        <DemoNotice />
        <ExternalHandoffPanel label="Downstream · not designed here" title="Account setup" testId="downstream-setup">
          <p className="text-sm text-muted-foreground">
            In the real product the owner now sets a password and sign-in protection in the account setup flow <Placeholder>[DOWNSTREAM SETUP — not designed here]</Placeholder>, then lands in OwedBook.
          </p>
          <p className="mt-2 text-sm font-medium text-foreground">This demo does not create an account, grant a role or sign you in.</p>
        </ExternalHandoffPanel>
        {signIn}
      </PageContainer>
    );
  }

  if (state.accessRequest === "request_sent") {
    return (
      <PageContainer width="xl">
        <DemoNotice />
        <div className="border border-border bg-card p-5" role="status" data-testid="link-sent">
          <MailCheck className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
          <h1 className="mt-2 text-2xl font-bold text-foreground">Check your email</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            If an account matches this link, a new access link is on its way. It works once and for a limited time <Placeholder>[LINK LIFETIME TBD]</Placeholder>. (Simulated — nothing is sent.)
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Nothing after a few minutes? Check spam, then{" "}
            <button type="button" className="portal-link" onClick={request} disabled={busy}>request another</button> or contact <Placeholder>[SUPPORT EMAIL]</Placeholder>.
          </p>
        </div>
        {signIn}
      </PageContainer>
    );
  }

  if (state.accessLink === "valid") {
    return (
      <PageContainer width="xl">
        <DemoNotice />
        <div className="border border-border bg-card p-5" data-testid="link-valid">
          <h1 className="text-2xl font-bold text-foreground">Your link is valid</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Next you&apos;d set up your account (password and sign-in protection) in the account setup flow <Placeholder>[DOWNSTREAM SETUP — not designed here]</Placeholder>, then land in OwedBook.
          </p>
          <Button type="button" className="mt-4" onClick={continueSetup} disabled={busy} aria-busy={busy || undefined}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            Continue to account setup
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">This link works once.</p>
        </div>
        {signIn}
      </PageContainer>
    );
  }

  const used = state.accessLink === "used";
  return (
    <PageContainer width="xl">
      <DemoNotice />
      <div className="border border-border bg-card p-5" data-testid={`link-${state.accessLink}`}>
        <h1 className="text-2xl font-bold text-foreground">{used ? "This link has already been used" : "This link has expired"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          For your security, access links work once and only for a limited time. Your account is safe and ready — we just need to send you a fresh link.
        </p>
        {state.accessRequest === "error" ? (
          <Alert tone="destructive" className="mt-4" title="We couldn't send a new link">
            Please try again in a moment. If it keeps failing, contact <Placeholder>[SUPPORT EMAIL]</Placeholder>.
          </Alert>
        ) : null}
        <Button type="button" className="mt-4" onClick={request} disabled={busy} aria-busy={busy || undefined} data-testid="request-link">
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Sending…
            </>
          ) : (
            "Email me a new link"
          )}
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">
          It goes to the email on your account. We don&apos;t show or change that address here. Not getting emails? Contact <Placeholder>[SUPPORT EMAIL]</Placeholder>.
        </p>
      </div>
      {signIn}
    </PageContainer>
  );
}
