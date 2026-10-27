# Rulings and errata
Append-only after release · FFM-ABM-001-SUBSCRIPTION-PORTAL · 27 October 2026 (Asia/Dhaka)

## R-001 — Director approval and name
Authority: Tony's current chat: “you have my blessings on FFM ... go ... run Forrest run”. Design v1.0 accepted with the three Architect review notes; FFM package authoring released. Earlier explicit instruction: retain FFM identity, use ABM execution style with QAM; actual ABMs/APBMs replace later BIMs. Latest naming instruction adds FFM-ABM to distinguish this style. ID `FFM-ABM-001-SUBSCRIPTION-PORTAL` and folder `cyph_subscription_portal_phase1_ffm_abm` implement that instruction. No other historical modules are renamed.

## R-002 — Workflow adaptation
Authority: Tony's four-shot, KISS instruction in this lab; ABM playbook. Preserve FFM folder subjects, mock service discipline and Gate M; replace old per-subphase human pauses with one E1 plan approval and continuous E2. No deployment, universal auth wrapper, public auth signup, global role cleanup or production SSO is authorized by historical examples. Preserve independent Q1 → Lead approval → Director release → Q2. Post-FFM Architect review remains; no automatic specialist review chain or RRM without findings.

## R-003 — Baseline and evidence
Tony's commit receipt: `1d15918`, “chore: prepare subscription portal foundation from Mission Control”; `main...origin/main [ahead 1]`, clean shown status. Push not evidenced. E1 resolves full SHA/current history. Supplied recon/cleanup predate this commit and are historical evidence, not instructions to repeat cleanup. Supabase remains the shared Cyber Pharma dev project; cleanup's “operator's call” wording does not reopen that decision.

## R-004 — Design handoff errata (Architect review accepted with R-001)
1. UI_SPEC §3 `hover:text-primary` conflicts with readable small links. Keep foreground text through hover/focus; use underline decoration/thickness to show interaction. Update implemented styling and portable preview derivative if generated; preserve received design bytes.
2. Design `source/render.mjs` and `check.mjs` hard-code `/opt/npm-tools/node_modules/playwright`. Do not require that path. Application checks use this repo's installed `@playwright/test`; if rebuilding the design source is useful, put portable derivatives in EVIDENCE/design-tools and document inputs. Rebuilding all design PNGs is not an FFM requirement.
3. Received package contains 87 screen/reference states and 244 PNGs (including style-tile PNGs); its 92/245 prose is a documentation discrepancy. Style tile adds one non-product state. Contract is mapped behavior, not an inflated test count. Supplied 510-load report is Designer evidence, not independent QA.
Final visual approval recorded here supersedes the preserved Designer file's PENDING entry. The received files remain unchanged for provenance.

## R-005 — FFM decisions and explicit deferrals
Architect implementation decisions under the approved FFM scope: server-protected reviewer demo; real staff identity separated from synthetic owner/admin/member personas; mock state per tab; preserved real auth. See IMPLEMENTATION_CONTRACT. Multi-store account model, repeat-N initial pharmacy forms, fixture prices and proposed past-due/cancel gating are demo rules only. No production commercial approval inferred. Cancellation status does not imply end-of-period timing: omit unknown `cancelAtPeriodEnd`/access date values.

## R-006 — No invented governing provenance
Project-source playbooks are supplied and hashed in QAM/GOVERNING. Their upstream Hub SHA and the literal Hub template files were not supplied. QAM is instantiated from the supplied playbook's complete structure, with this limitation declared; it is not represented as a byte-identical copy of unseen templates. Q1/Lead can add applicable standing requirements without another engineering review chain.

Future amendment record: ID; date/seat; approving source; original observation; exact decision; affected ACs/files; required regression; resulting contract version. Never rewrite prior verdicts.

## R-007 — Module home relocated to agent_docs/ACTIONS/ (Director correction)
- **ID / date / seat:** R-007 · 27 October 2026 (Asia/Dhaka) · recorded by Claudy (Engineer) during E1; decision is the Director's.
- **Approving source:** Tony's E1 dispatch in chat, 27 Oct 2026: "DIRECTOR CORRECTION: The current module home is agent_docs/ACTIONS/, not CURRENT_APP." … "Record this Director-authorized relocation in RULINGS.md. Update this module's active entry paths, installation instructions and repository pointers to the ACTIONS location. Preserve historical source snapshots and the original archive/index as provenance."
- **Original observation:** README "Start here" step 1, CLAUDE.md, AGENTS.md and GEMINI.md named `agent_docs/CURRENT_APP/cyph_subscription_portal_phase1_ffm_abm`. At E1 the repo had no `agent_docs/CURRENT_APP/` on disk (Director-side working-tree deletion of the old Mission Control module, 71 tracked paths) and an empty `agent_docs/ACTIONS/`.
- **Exact decision:** install root is `agent_docs/ACTIONS/cyph_subscription_portal_phase1_ffm_abm/`. Active entry files (CLAUDE.md, AGENTS.md, GEMINI.md, README step 1) are repointed. Historical/governing/extraction snapshots that mention `CURRENT_APP` (QAM/GOVERNING/*, _extraction/*, _design/*, skills/*) stay byte-preserved; they describe other modules or the historical FFM convention, not this module's location.
- **Provenance kept:** original archive `/home/moose/Downloads/FFM-ABM-001-SUBSCRIPTION-PORTAL_v1_0.zip` SHA-256 `5c0ad43a4682d85b7b357cad50d3299df9b6c33d30f94d81e62cde35be97372e` (verified at E1, not copied into the repo); `FILE_INDEX.json` unchanged and still describes the delivered bytes. Post-install changes and the installed-file hashes are recorded separately in `EVIDENCE/INSTALL_RECORD.md` and `EVIDENCE/INSTALLED_FILE_MANIFEST.json`. Modified files no longer match their FILE_INDEX hashes. That is expected and is never reported as a match.
- **Affected ACs/files:** AC-28 (handoff identity/paths); CLAUDE.md, AGENTS.md, GEMINI.md, README.md, this file; repo bridge `agent_docs/PROJECT_POINTER.md` + root `CLAUDE.md` pointer section.
- **Required regression:** none for product. Q1 verifies frozen-file hashes against FILE_INDEX and mutable-file hashes against the installed manifest separately.
- **Resulting contract version:** ACCEPTANCE_SPEC v1.0 unchanged; module v1.0 with R-007 location erratum.
