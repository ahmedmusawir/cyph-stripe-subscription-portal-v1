import { BRAND } from "./brand";

export function Footer() {
  return (
    <footer className="mt-10 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>{BRAND.footer}</p>
        <p className="flex flex-wrap gap-x-5 gap-y-2">
          <span>Support · {BRAND.supportEmail}</span>
          <span>Terms [LINK TBD]</span>
          <span>Privacy [LINK TBD]</span>
        </p>
      </div>
    </footer>
  );
}

export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
    >
      Skip to content
    </a>
  );
}
