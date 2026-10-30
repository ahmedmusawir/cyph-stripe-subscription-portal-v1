// Portal FFM — field validation at the service boundary (DATA_CONTRACT §5).
// Values stay strings (leading zeros preserved); messages follow the design copy.
import type { AdminAssignment, OwnerDraft, PharmacyDraft } from '@/types/portal/contract';

export type FieldErrors = Record<string, string>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SOFTWARE: readonly PharmacyDraft['software'][] = ['Liberty', 'Pioneer', 'Other'];

function blank(value: unknown): boolean {
  return typeof value !== 'string' || value.trim() === '';
}

export function isEmail(value: unknown): boolean {
  return typeof value === 'string' && EMAIL.test(value.trim());
}

function phoneDigits(value: unknown): number {
  return typeof value === 'string' ? value.replace(/\D/g, '').length : 0;
}

export function validateOwner(owner: Partial<OwnerDraft>): FieldErrors {
  const errors: FieldErrors = {};
  if (blank(owner.firstName)) errors.firstName = 'Enter your first name.';
  if (blank(owner.lastName)) errors.lastName = 'Enter your last name.';
  if (blank(owner.email)) errors.email = 'Enter your work email.';
  else if (!isEmail(owner.email)) errors.email = 'Enter an email address like name@pharmacy.com.';
  if (phoneDigits(owner.mobile) < 10) errors.mobile = 'Enter a phone number we can text.';
  // R-011: owner-only registration. The declaration must be exactly `true`;
  // it is a self-declaration and proves nothing (neither does email or payment).
  if (owner.ownerDeclarationAccepted !== true)
    errors.ownerDeclaration = 'Confirm that you are the pharmacy owner to continue.';
  return errors;
}

export function validateAdmin(admin: AdminAssignment | undefined): FieldErrors {
  const errors: FieldErrors = {};
  if (!admin) {
    errors.adminAssignment = "Choose who will be this store's admin.";
    return errors;
  }
  if (admin.kind === 'other') {
    if (blank(admin.fullName)) errors.adminName = "Enter the admin's full name.";
    if (blank(admin.email)) errors.adminEmail = "Enter the admin's email.";
    else if (!isEmail(admin.email)) errors.adminEmail = 'Enter an email address like name@pharmacy.com.';
  }
  return errors;
}

export function validatePharmacy(pharmacy: Partial<PharmacyDraft>): FieldErrors {
  const errors: FieldErrors = {};
  if (blank(pharmacy.name)) errors.name = 'Enter the pharmacy name.';
  if (blank(pharmacy.street)) errors.street = 'Enter the street address.';
  if (blank(pharmacy.city)) errors.city = 'Enter the city.';
  if (blank(pharmacy.state)) errors.state = 'Choose the state.';
  if (typeof pharmacy.zip !== 'string' || !/^\d{5}$/.test(pharmacy.zip.trim()))
    errors.zip = 'Enter the 5-digit ZIP code.';
  if (typeof pharmacy.ncpdp !== 'string' || !/^\d{7}$/.test(pharmacy.ncpdp))
    errors.ncpdp = 'Enter the 7-digit NCPDP number.';
  if (typeof pharmacy.npi !== 'string' || !/^\d{10}$/.test(pharmacy.npi))
    errors.npi = 'Enter the 10-digit NPI.';
  if (phoneDigits(pharmacy.phone) < 10) errors.phone = 'Enter the store phone number.';
  if (!pharmacy.software || !SOFTWARE.includes(pharmacy.software))
    errors.software = 'Choose the pharmacy software.';
  else if (pharmacy.software === 'Other' && blank(pharmacy.softwareOther))
    errors.softwareOther = 'Enter the software name.';
  Object.assign(errors, validateAdmin(pharmacy.adminAssignment));
  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** Operation keys come from the client; accept only short opaque tokens. */
export function isOperationKey(key: unknown): key is string {
  return typeof key === 'string' && /^[A-Za-z0-9_-]{8,64}$/.test(key);
}
