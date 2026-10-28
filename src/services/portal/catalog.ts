// Portal FFM — read-only catalogue values the UI may show (re-exported so
// components never import src/mocks directly).
import { EMAIL_EXISTING_ACCOUNT, NCPDP_REGISTERED_ELSEWHERE, PLAN, US_STATES } from '@/mocks/portal/fixtures';

export const PLAN_VIEW = PLAN;
export const US_STATE_NAMES: readonly string[] = US_STATES;
/** Shown in Demo controls so reviewers can reach the conflict states by typing. */
export const DEMO_HINTS = {
  duplicateNcpdp: NCPDP_REGISTERED_ELSEWHERE,
  existingEmail: EMAIL_EXISTING_ACCOUNT,
  code: 'DEMO10',
} as const;
