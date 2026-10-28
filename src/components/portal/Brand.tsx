import Link from "next/link";
import { BRAND } from "./brand";

// Symbol is logo-color.svg (self-contained coral tile); wordmark is token text.
export function Brand({ href }: { href: string }) {
  return (
    <Link href={href} className="flex min-h-[44px] min-w-0 items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`${BRAND.name} — home`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-color.svg" alt="" className="h-8 w-8 shrink-0" />
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-sm font-bold uppercase tracking-wide text-foreground">{BRAND.name}</span>
        <span className="block truncate text-[10px] uppercase tracking-widest text-muted-foreground">{BRAND.subline}</span>
      </span>
    </Link>
  );
}
