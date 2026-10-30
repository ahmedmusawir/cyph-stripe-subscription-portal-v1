// Portal FFM — classification of the shared /demo/stripe stand-in route
// (RULINGS R-009; REPAIR_001 Q2-F03). Pure: no React, no auth calls.
//
// Query values can only ADD the login requirement, never remove it. Every
// `mode` value is considered (repeated parameters, any order), trimmed and
// lower-cased. The route is public ONLY when `mode` is absent or every value is
// `checkout`; an account value (portal | card) or any unrecognised value fails
// closed to "account" (real admin/superadmin session required).
import { BILLING_PURPOSES, type BillingPurpose } from './account';

export type StripeStandInMode = 'checkout' | 'portal' | 'card';
export type QueryValue = string | string[] | undefined;
export interface StripeStandInRoute {
  access: 'public' | 'account';
  mode: StripeStandInMode;
  purpose: BillingPurpose;
}

const values = (v: QueryValue): string[] =>
  (v === undefined ? [] : Array.isArray(v) ? v : [v]).map((x) => String(x).trim().toLowerCase());

export function classifyStripeStandIn(params: Record<string, QueryValue>): StripeStandInRoute {
  const modes = values(params.mode);
  const purpose = (values(params.purpose).find((p) => (BILLING_PURPOSES as readonly string[]).includes(p)) ??
    'manage') as BillingPurpose;
  if (modes.includes('portal')) return { access: 'account', mode: 'portal', purpose };
  if (modes.includes('card')) return { access: 'account', mode: 'card', purpose };
  if (modes.every((m) => m === 'checkout')) return { access: 'public', mode: 'checkout', purpose };
  return { access: 'account', mode: 'checkout', purpose };
}
