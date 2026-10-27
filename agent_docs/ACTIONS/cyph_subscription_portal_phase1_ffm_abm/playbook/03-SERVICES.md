# E2 internal task — service adapter

## Work
Implement one mock domain adapter and capability enforcement, quote revision/expiry/consent checks, operation-key replay protection, safe handoffs and typed errors. Use dependency-injected clock/outcomes. Existing auth is consumed unchanged. No business API routes.

## Verification gate
Meaningful service tests prove stale-quote rejection, nonowner denial, pending/failed/paid state distinction and exactly-once addition. No operator pause.

## Evidence
Record actual CWD/commands/exit codes, source identity and outputs in parent EVIDENCE, link the acceptance ledger, update STATE and retain failed attempts. Do not alter frozen requirements to fit code.

## Resume
Check current state first; resume the unfinished dependency. RULINGS and FFM_ENTRY govern scope and authority.
