# Cyber Pharma Subscription Portal — Design handoff v1.0

27 October 2026 · Fable (Designer) → JARVIS (Architect) for Tony (Director) and Coach
Repository baseline: `cyph-stripe-subscription-portal-v1` foundation commit **`1d15918`** · Module to be assembled: **FFM-ABM-001-SUBSCRIPTION-PORTAL**

## What this is

The complete design package for the Subscription Portal FFM, built from the v0.2 visual direction the Architect accepted for refinement: every journey in `DESIGNER_HANDOFF.md §5` (C01–C17) plus the supporting states, in Mist and Slate, at desktop and 375px, with runnable HTML, PNG renders, the final portal token file, the UI spec, the component manifest, the decisions record and the measured checks.

## Read order

1. `DECISIONS_AND_DELTAS.md` — approval record, **v1.0 change list (§2)**, decisions, applied token changes and the coral-boundary resolution (§5), open items (§6).
2. `CHECKS.md` — overflow table for all 510 loads, measured contrast for the final combinations, hairline measurement.
3. `UI_SPEC.md` — inventory mapped to C01–C17, visual system, responsive rules, per-screen behaviour, states, accessibility.
4. `COMPONENT_MANIFEST.md` — existing vs new primitives, compositions, kit deltas, build priority.
5. `renders/` — PNGs (see the matrix below). Start with `account-billing__active_slate__desktop.png`, then one wizard page, then `stripe-checkout-handoff__preview_slate__desktop.png` for the boundary.
6. `screens/*.html` and `references/*.html` — open in a browser; the review bar (bottom right) switches state, Mist/Slate, and the fleet "before" tokens.
7. `style-tile/` — palette, type, controls, pills, alerts, table/card, progress, handoff panel, live contrast table.
8. `tokens/` — `globals.scss` (the portal token file, six annotated changes) and `tailwind.config.ts` (unchanged mapping, copied from the baseline). `fleet-baseline.css` is review-only.

## Package layout

```
CYPH_SUBSCRIPTION_PORTAL_DESIGN_HANDOFF_v1_0/
├── README.md · DECISIONS_AND_DELTAS.md · UI_SPEC.md · COMPONENT_MANIFEST.md · CHECKS.md
├── tokens/        globals.scss · tailwind.config.ts · fleet-baseline.css (review only)
├── style-tile/    style-tile.html + PNGs (Mist, Slate, mobile, fleet-before)
├── screens/       13 runnable layouts (one HTML per layout; ?state= selects the variant)
├── references/    email-access.html · owedbook-panels.html (external surfaces, labelled)
├── renders/       PNGs for screens (+ renders/references/)
├── source/        partials, runtime, build.mjs, render.mjs, check.mjs, tailwind.config.js, package.json
└── tools/         contrast.py, propose.py, portal_tokens.py (offline contrast maths)
```

## Layouts and states

| Layout (screens/) | Coverage | States |
|---|---|---|
| `signup-plan.html` | C01 | one · two · reduce_confirm · price_unavailable |
| `signup-owner.html` | C02, C16 (email) | empty · filled · errors · existing_email · saving |
| `signup-pharmacy.html` | C03, C16 | first_of_two · second_other_admin · software_other · errors · duplicate · single |
| `signup-review.html` | C04 | two_stores · one_store · code_applying · code_applied · code_invalid · quote_unavailable · quote_expired · consent_missing · leaving |
| `stripe-checkout-handoff.html` | C05 (+ Customer Portal stand-in for C13) | leaving · preview · declined · portal_preview |
| `activation.html` | C06 | ready · waiting_payment · provisioning · delayed · email_failed · resent · payment_failed |
| `checkout-incomplete.html` | C14 | resumable · payment_unknown · declined · expired |
| `access-link.html` | C17 | expired · valid · used · sending · request_sent · error |
| `sign-in.html` | supporting | default · session_expired · error · busy |
| `add-store.html` | C09, C16 | other_admin · me_admin · draft_restored · software_other · errors · duplicate · busy |
| `add-store-confirm.html` | C10 | quote_ready · quote_loading · quote_expired · quote_error · consent_missing · confirming · payment_failed · change_card |
| `store-added.html` | C11 | added_invited · added_owner_admin · invitation_accepted · provisioning_attention |
| `account-billing.html` | C12, C13, C15 (portal side), supporting | active · past_due · cancel_scheduled · canceled · unchanged · refreshing · handoff_error · no_pharmacies · denied · loading · error |
| `references/email-access.html` | C07 | owner · store_admin · checkout_unfinished · expired_resend |
| `references/owedbook-panels.html` | C08, C15 (OwedBook side) | owner · non_owner · owner_past_due · member_past_due |

## PNG matrix (how to read `renders/`)

Names: `<layout>__<state>_<mist|slate>[_menu|_fleet]__<desktop|mobile>.png`, rendered at 2× device scale.

- Every layout: default state in **both themes at both widths**.
- Every other state: **Slate desktop**; distinct form / alert / quote / error / busy treatments additionally in **Mist desktop** and **Slate mobile**.
- `account-billing` (canonical): **every state in both themes at both widths**, plus mobile menu open in both themes and one Mist `fleet` comparison.
- Text-only variants are not duplicated as images; use the runnable selector.

## Opening the previews

All HTML is self-contained (Tailwind output and the Saira font are embedded); no network needed. Query parameters: `?state=<key>&mode=light|dark&tokens=portal|fleet`, `menu=1` opens the mobile menu, `shot=1` hides the review bar. Buttons marked as demo outcomes switch the review state so the mock journey can be walked (e.g. Checkout stand-in → declined; access link → request sent).

## Approval record

Released to design by Tony 26 Oct (16:18). Architect accepted the direction for refinement 27 Oct (08:58) and ordered the correction pass (delivered as v0.2); the Architect then directed the full package 27 Oct (10:40) on the v0.2 direction. **Final visual approval by Tony / Coach is pending** and should be recorded in `DECISIONS_AND_DELTAS.md §1` before FFM assembly.

## Limitations

- Fixture data only; no backend, Stripe, email or auth. Every amount is labelled illustrative; every open policy is a visible placeholder; proposed rules carry a "Proposed rule" chip.
- Stripe Checkout and Customer Portal appear only as labelled stand-ins with no editable fields. OwedBook appears only as a labelled frame around the designed panels.
- The mobile menu is a disclosure panel in the HTML; the build uses the existing left `Sheet`.
- Not performed: assistive-technology or full keyboard walks; authenticated runtime behaviour.

## Rebuilding

`cd source && npm install` (Tailwind 3.4.6, @fontsource/saira; Playwright is expected on the machine) then `node build.mjs && node render.mjs && node check.mjs`. `build.mjs` compiles against `../tokens/globals.scss`; change tokens there, never in the HTML.
