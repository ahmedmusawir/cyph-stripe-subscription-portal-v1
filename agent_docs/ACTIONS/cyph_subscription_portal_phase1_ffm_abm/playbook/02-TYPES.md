# E2 internal task — types

## Work
Implement portal-contract.ts in the chosen src/types/portal layout. Preserve optional unknown prices/dates, integer cents, string IDs and explicit status unions. Keep SDK imports out. Field validation belongs at the service/form boundary; do not make incomplete drafts pretend to be complete records.

## Verification gate
Typecheck pure contracts and new callers; preserve actual auth types. No operator pause.

## Evidence
Record actual CWD/commands/exit codes, source identity and outputs in parent EVIDENCE, link the acceptance ledger, update STATE and retain failed attempts. Do not alter frozen requirements to fit code.

## Resume
Check current state first; resume the unfinished dependency. RULINGS and FFM_ENTRY govern scope and authority.
