"use client";

import ThemeToggler from "@/components/global/ThemeToggler";
import { Brand } from "./Brand";
import { Footer, SkipLink } from "./Footer";

// Neutral shell for the Stripe boundary (C05 / Customer Portal stand-in). Not a
// protected parent: checkout mode is public; the page itself guards the
// account-side modes on the server (RULINGS R-009).
export function HandoffShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SkipLink />
      <header className="sticky top-0 z-30 border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5">
          <Brand href="/demo/register/plan" />
          <ThemeToggler />
        </div>
      </header>
      <main id="main" tabIndex={-1} className="w-full flex-1 focus:outline-none">
        {children}
      </main>
      <Footer />
    </div>
  );
}
