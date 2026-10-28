"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import ThemeToggler from "@/components/global/ThemeToggler";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Brand } from "./Brand";
import { BRAND } from "./brand";
import { Footer, SkipLink } from "./Footer";
import { PublicDemoControls } from "./PublicDemoControls";

// Public shell (RULINGS R-009): prospective subscribers, no login. "Already
// subscribed? Sign in" goes to the REAL /login. Below md the right side
// collapses to theme toggle + hamburger opening the existing left Sheet.
export function PublicShell({ children, demoControls = true }: { children: React.ReactNode; demoControls?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SkipLink />
      <header className="sticky top-0 z-30 border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5">
          <Brand href="/demo/register/plan" />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Site">
            <span className="px-3 text-sm text-muted-foreground">
              Questions? <span className="font-medium text-foreground">{BRAND.supportEmail}</span>
            </span>
            <ThemeToggler />
            <span className="ml-2 text-sm text-muted-foreground">Already subscribed?</span>
            <Link
              href="/login"
              className="ml-1 inline-flex h-11 items-center border border-input bg-background px-4 text-sm font-semibold uppercase tracking-wide text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              data-testid="public-sign-in"
            >
              Sign in
            </Link>
          </nav>
          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggler />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger aria-label="Open menu" className="grid h-11 w-11 place-items-center text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" data-testid="menu-trigger">
                <Menu className="h-6 w-6" aria-hidden="true" />
              </SheetTrigger>
              <SheetContent aria-describedby={undefined}>
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <div className="border-b border-border p-4 pr-14">
                  <Brand href="/demo/register/plan" />
                </div>
                <div className="px-4 py-3">
                  <Link href="/login" onClick={() => setOpen(false)} className="flex min-h-[44px] items-center text-sm font-medium text-foreground">
                    Already subscribed? Sign in
                  </Link>
                  <p className="flex min-h-[44px] items-center text-sm text-muted-foreground">
                    Questions? <span className="ml-1 font-medium text-foreground">{BRAND.supportEmail}</span>
                  </p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      {demoControls ? <PublicDemoControls /> : null}
      <main id="main" tabIndex={-1} className="w-full flex-1 focus:outline-none">
        {children}
      </main>
      <Footer />
    </div>
  );
}
