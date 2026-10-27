# Automatic handoff exports
Engineering returns its plan/build reports automatically; QA returns one Q1/Q2/material-stop/retest package without another “please package it” request.

Engineering ZIPs: parent `EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_E1_REVIEW_001.zip` and `_E2_REVIEW_001.zip` (increment attempts; do not overwrite history).
QA ZIPs: `QAM/HANDOFFS/FFM-ABM-001-SUBSCRIPTION-PORTAL_Q1_REVIEW_001.zip`, analogous Q2/STOP/RETEST names. Create a byte-identical convenience copy in `/home/moose/Downloads/` when available; canonical copy stays in the module. This package preauthorizes that convenience copy, not other file moves.

Each export includes REVIEW_START_HERE.md, exact identities/state, actual reports (including recon response), contract/rulings, relevant governing snapshots, evidence, plan/approval/certificate as appropriate, findings and remaining gaps. Use explicit inclusion paths. FILE_INDEX.json lists member path, source path, purpose, byte size and SHA-256 for every member except itself. Verify membership, safe relative paths, no duplicates, byte hashes and ZIP integrity. External receipt hashes the completed archive; do not attempt to embed its own hash inside it.

Exclude all .env/credential files, browser auth state/profiles/traces, Git internals, dependencies/build trees, nested prior ZIPs, private real emails/keys and unsafe logs. Validate scanners using synthetic leak fixtures and clean controls; scan actual selected contents plus expanded ZIP, not only filenames. Keep privacy output to safe counts/locations. All expected source paths must exist; absent evidence is a named gap, never an empty successful grep.

Return filename, full canonical and Downloads paths, SHA-256, member count and the exact decision needed. Report packaging failure honestly without claiming a safe export. Packaging corrections alone do not require rerunning passed product tests.
