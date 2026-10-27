# QA risk requirements
Architect-authored module risks; not a fabricated QA Lead approval. Lead adds/attributes standing requirements during Q1 review. Supplied QAM/QA playbooks govern.

1. **Real gate versus fake persona:** direct nested routes, page reload, stale session, crafted query/storage and non-superadmin identity cannot bypass staff auth. Account-level authorization remains unimplemented; QA must not certify it.
2. **No real billing effects:** network destination inspection and dependency/import/diff review. Payment UI never collects card fields or creates real sessions/webhooks; email remains preview-only.
3. **Quote/consent integrity:** stale or edited quote, expiry, unknown amount, code application, refreshed consent. Independently derive integer expected totals; do not use the function under test as its own oracle.
4. **Operation integrity:** double click, repeat same key, refresh while pending, unknown outcome, deliberate retry after failure, paid-but-delayed recovery. Test 1→2 and 2→3; no duplicate store or silent reset to canned state.
5. **Persona/privacy isolation:** nonowner payload, not only hidden controls; per-reviewer/tab isolation; reset/logout. Unsafe text renders inert. Never test with real pharmacy/customer data.
6. **Frontend behavior:** route/state/persona × both themes × representative widths; all declared behavior states covered, with justified reductions for identical layout variants. Test normal workflows beyond scenario selectors. Screenshot counts are not test counts.
7. **Accessibility:** actual keyboard focus/Sheet/error-summary behavior; readable text in hover/focus/error/alert states and on real surfaces. Designer style-tile proof does not cover every rendered combination. Investigate failures, not blanket certification.
8. **Baseline regressions:** auth/session/providers, removed MC routes, GET login 405, disabled deploy scripts and lockfile retained. Inherited lint/advisories explicit; no scope creep into upgrades or unrelated cleanup.
9. **Evidence independence:** QA-controlled fresh build when required, exact identities, actual attempts, safe logs and independent expected results. No self-approval/certification or product repair in QA.
10. **Final configuration:** mock business mode, real restrictive reviewer gate, clean owned auth state and no temporary bypass. “Restore live” from other app examples is inapplicable.

Browser profile proposed for Q1: Chromium desktop, mobile-sized 375 viewport, tablet 768, desktop 1440, breakpoint edge checks and representative 200% zoom. Mobile emulation is not proof of real-device Safari. QA Lead approves actual matrix/limitations. No mandatory cross-browser expansion absent a concrete risk or requirement.
