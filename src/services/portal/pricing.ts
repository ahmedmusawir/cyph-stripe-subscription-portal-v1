// Portal FFM — illustrative pricing fixtures (DATA_CONTRACT §8/§10).
// Integer cents only. These are engineering fixtures, never a proration formula.
import type { Cents } from '@/types/portal/contract';

export const BASE_CENTS: Cents = 9900;
export const ADDITIONAL_STORE_CENTS: Cents = 4900;
export const ADD_STORE_DUE_NOW_CENTS: Cents = 2450;
export const DEMO_CODE = 'DEMO10';
export const DEMO_CODE_DISCOUNT_CENTS: Cents = 1000;
export const QUOTE_TTL_MS = 30 * 60 * 1000;
export const MAX_STORES = 20;

export function isValidStoreCount(n: unknown): n is number {
  return typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= MAX_STORES;
}

/** 9900 + 4900 · (N − 1) */
export function initialRecurringCents(storeCount: number): Cents {
  if (!isValidStoreCount(storeCount)) throw new RangeError('store count out of range');
  return BASE_CENTS + ADDITIONAL_STORE_CENTS * (storeCount - 1);
}

export function normalizeCode(code: string | undefined): string {
  return (code ?? '').trim().toUpperCase();
}

/** DEMO10 takes 1000 off the initial due-now amount only. */
export function initialDiscountCents(code: string | undefined): Cents {
  return normalizeCode(code) === DEMO_CODE ? DEMO_CODE_DISCOUNT_CENTS : 0;
}

export function formatCents(cents: Cents): string {
  const sign = cents < 0 ? '−' : '';
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100).toLocaleString('en-US');
  return `${sign}$${dollars}.${String(abs % 100).padStart(2, '0')}`;
}
