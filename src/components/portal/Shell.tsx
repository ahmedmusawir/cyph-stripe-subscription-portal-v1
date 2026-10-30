"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, LogOut, Menu } from "lucide-react";
import SpinnerLarge from "@/components/common/SpinnerLarge";
import ThemeToggler from "@/components/global/ThemeToggler";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { clearDemoStorage } from "@/services/portal";
import type { PortalStaffRole } from "@/types/auth";
import { Brand } from "./Brand";
import { BRAND } from "./brand";
import { Footer, SkipLink } from "./Footer";
import { Initials } from "./PageHeader";
import { AccountStrip } from "./AccountStrip";

// Authenticated account shell (UI_SPEC §1): top bar + centered content, no
// rail. Rendered only inside the server-protected (account) layout, which
// admits real admin OR superadmin sessions (R-008/R-009). The account menu
// shows the REAL signed-in identity; the strip below names the SYNTHETIC
// account and persona being previewed.
//
// Mobile-first: < md the right side collapses to theme toggle + 44px hamburger
// opening the existing left Sheet (Radix: focus trap, Escape, focus return).
const ROLE_LABEL: Record<PortalStaffRole, string> = {
  superadmin: "Super Admin",
  admin: "Admin",
};

export function Shell({
  user,
  children,
}: {
  user: { displayName: string; role: PortalStaffRole };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Next 16 keeps the old page visible during client navigation; nav clicks go
  // through startTransition and isPending shows the kit spinner in the slot.
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  function navigate(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    setDrawerOpen(false);
    startTransition(() => router.push(href));
  }

  async function signOut() {
    // Demo state first (both namespaces), then the real logout.
    clearDemoStorage("all");
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/login");
    router.refresh();
  }

  const roleLabel = ROLE_LABEL[user.role];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SkipLink />
      <header className="sticky top-0 z-30 border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5">
          <Brand href="/dashboard" />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Account">
            <Link
              href="/demo/references/owedbook"
              onClick={(e) => navigate(e, "/demo/references/owedbook")}
              className="inline-flex h-11 items-center gap-1.5 px-3 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to {BRAND.owedBook}
            </Link>
            <ThemeToggler />
            <DropdownMenu>
              <DropdownMenuTrigger
                className="ml-1 inline-flex h-11 items-center gap-2 border border-border px-2.5 pr-3 text-sm text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                data-testid="account-menu"
              >
                <Initials name={user.displayName} size="sm" />
                <span className="max-w-[12rem] truncate font-medium">{user.displayName}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[14rem]">
                <DropdownMenuLabel className="font-normal">
                  <span className="block truncate text-sm font-semibold">{user.displayName}</span>
                  <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">{roleLabel} · real account</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => startTransition(() => router.push("/dashboard"))}>Account &amp; Billing</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => startTransition(() => router.push("/demo/references/owedbook"))}>Back to {BRAND.owedBook}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => void signOut()} data-testid="sign-out">
                  <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggler />
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
              <SheetTrigger
                aria-label="Open account menu"
                className="grid h-11 w-11 place-items-center text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                data-testid="menu-trigger"
              >
                <Menu className="h-6 w-6" aria-hidden="true" />
              </SheetTrigger>
              <SheetContent aria-describedby={undefined}>
                <SheetTitle className="sr-only">Account menu</SheetTitle>
                <div className="border-b border-border p-4 pr-14">
                  <Brand href="/dashboard" />
                </div>
                <div className="flex items-center gap-3 border-b border-border p-4">
                  <Initials name={user.displayName} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{user.displayName}</p>
                    <p className="truncate text-[11px] uppercase tracking-wide text-muted-foreground">{roleLabel} · real account</p>
                  </div>
                </div>
                <nav className="flex flex-col px-4 py-2" aria-label="Account">
                  <Link href="/dashboard" onClick={(e) => navigate(e, "/dashboard")} className="flex min-h-[44px] items-center text-sm font-medium text-foreground">
                    Account &amp; Billing
                  </Link>
                  <Link href="/demo/references/owedbook" onClick={(e) => navigate(e, "/demo/references/owedbook")} className="flex min-h-[44px] items-center text-sm font-medium text-foreground">
                    Back to {BRAND.owedBook}
                  </Link>
                  <button type="button" onClick={() => void signOut()} className="flex min-h-[44px] items-center text-left text-sm font-medium text-muted-foreground hover:text-foreground">
                    Sign out
                  </button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <AccountStrip realName={user.displayName} roleLabel={roleLabel} />
      <main id="main" tabIndex={-1} className="w-full flex-1 focus:outline-none">
        {isPending ? (
          // Operator's kit spinner by explicit direction (Rule Zero-B exception
          // logged — hardcoded palette colors live inside it).
          <div className="grid min-h-[60vh] place-items-center">
            <SpinnerLarge />
          </div>
        ) : (
          children
        )}
      </main>
      <Footer />
    </div>
  );
}
