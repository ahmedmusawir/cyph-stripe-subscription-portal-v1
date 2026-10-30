// Portal FFM — synthetic demonstration fixtures (DATA_CONTRACT §8).
//
// Everything here is fake: `.example` emails, synthetic identifiers, illustrative
// amounts. Only src/services/portal/** may import this module; components get
// view models from the service facade. Delete with the mock layer at integration.
import type { OwnerDraft, PharmacyDraft, PlanView } from '@/types/portal/contract';
import type { AccountRecord, PharmacyRecord } from '@/types/portal/state';

export const PLAN: PlanView = {
  id: 'demo_plan_standard',
  name: 'Standard',
  interval: 'month',
  includedStoreCount: 1,
  baseAmountCents: 9900,
  additionalStoreAmountCents: 4900,
  benefits: ["[What's included: TBD]"],
  commercialStatus: 'provisional',
};

export const OWNER_JORDAN: OwnerDraft = {
  firstName: 'Jordan',
  lastName: 'Ellis',
  email: 'jordan@demo-pharmacy.example',
  mobile: '(555) 010-0144',
  // SYNTHETIC demo fixture: the owner declaration is pre-accepted only so the
  // seeded review scenarios can open on later steps. A real or fresh draft
  // always starts unaccepted (R-011).
  ownerDeclarationAccepted: true,
  legalBusinessName: 'Main Street Pharmacy LLC',
};

export const ADMIN_SAM = { fullName: 'Sam Ortiz', email: 'sam@demo-pharmacy.example' };

export const PHARMACY_MAIN: PharmacyDraft = {
  id: 'demo_ph_main',
  name: 'Example Main Street Pharmacy',
  street: '120 Main Street',
  city: 'Springfield',
  state: 'Alabama',
  zip: '00000',
  ncpdp: '0000000',
  npi: '0000000000',
  phone: '(555) 010-0150',
  software: 'Liberty',
  adminAssignment: { kind: 'owner' },
};

export const PHARMACY_RIVERSIDE: PharmacyDraft = {
  id: 'demo_ph_riverside',
  name: 'Example Riverside Pharmacy',
  street: '45 River Road',
  city: 'Springfield',
  state: 'Alabama',
  zip: '00000',
  ncpdp: '0000001',
  npi: '0000000001',
  phone: '(555) 010-0151',
  software: 'Pioneer',
  adminAssignment: { kind: 'other', ...ADMIN_SAM },
};

export const PHARMACY_HILLSIDE: PharmacyDraft = {
  id: 'demo_ph_hillside',
  name: 'Example Hillside Pharmacy',
  street: '9 Hill Street',
  city: 'Springfield',
  state: 'Alabama',
  zip: '00000',
  ncpdp: '0000002',
  npi: '0000000002',
  phone: '(555) 010-0152',
  software: 'Other',
  softwareOther: 'Example RxSuite',
  adminAssignment: { kind: 'owner' },
};

/** NCPDP already registered to a different synthetic account (C16 demo). */
export const NCPDP_REGISTERED_ELSEWHERE = '0000099';
/** Email that "may already have an account" (C02 existing-email demo). */
export const EMAIL_EXISTING_ACCOUNT = 'existing.owner@demo-pharmacy.example';

export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'District of Columbia', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois',
  'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
  'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana',
  'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah',
  'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
] as const;

export const DATES = {
  lastPaymentDue: '2026-10-26',
  nextPayment: '2026-11-26',
  cancellationRequested: '2026-10-26',
  invitationSent: '2026-10-26',
} as const;

const MAIN_RECORD: PharmacyRecord = {
  id: PHARMACY_MAIN.id,
  name: PHARMACY_MAIN.name,
  ncpdp: PHARMACY_MAIN.ncpdp,
  ncpdpDisplay: `NCPDP ${PHARMACY_MAIN.ncpdp} · ${PHARMACY_MAIN.city}`,
  adminName: 'Jordan Ellis',
  adminEmail: OWNER_JORDAN.email,
  ownerIsAdmin: true,
  activationStatus: 'active',
  invitationStatus: 'not_required',
  isIncluded: true,
};

const RIVERSIDE_RECORD: PharmacyRecord = {
  id: PHARMACY_RIVERSIDE.id,
  name: PHARMACY_RIVERSIDE.name,
  ncpdp: PHARMACY_RIVERSIDE.ncpdp,
  ncpdpDisplay: `NCPDP ${PHARMACY_RIVERSIDE.ncpdp} · ${PHARMACY_RIVERSIDE.city}`,
  adminName: ADMIN_SAM.fullName,
  adminEmail: ADMIN_SAM.email,
  ownerIsAdmin: false,
  activationStatus: 'active',
  invitationStatus: 'pending',
  isIncluded: false,
  monthlyAmountCents: 4900,
};

/** Canonical seed: two-store active account (UI_SPEC C12 default). */
export function twoStoreAccount(): AccountRecord {
  return {
    id: 'demo_account_01',
    ownerName: 'Jordan Ellis',
    ownerEmail: OWNER_JORDAN.email,
    cardLabel: 'Visa ending •••• [LAST 4]',
    subscription: {
      planName: PLAN.name,
      status: 'active',
      coveredStoreCount: 2,
      monthlyAmountCents: 14800,
      nextPaymentAt: DATES.nextPayment,
    },
    pharmacies: [{ ...MAIN_RECORD }, { ...RIVERSIDE_RECORD }],
  };
}

export function oneStoreAccount(): AccountRecord {
  const account = twoStoreAccount();
  return {
    ...account,
    subscription: { ...account.subscription, coveredStoreCount: 1, monthlyAmountCents: 9900 },
    pharmacies: [{ ...MAIN_RECORD }],
  };
}

export const DUPLICATE_REGISTRY: readonly string[] = [NCPDP_REGISTERED_ELSEWHERE];
