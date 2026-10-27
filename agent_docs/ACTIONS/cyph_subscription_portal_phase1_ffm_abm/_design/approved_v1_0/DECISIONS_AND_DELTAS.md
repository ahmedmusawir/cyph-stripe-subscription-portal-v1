# DECISIONS AND DELTAS — Cyber Pharma Subscription Portal design package

> **Version:** 1.0 · **Date:** 27 October 2026 (Asia/Dhaka) · **Designer:** Fable · supersedes first-review v0.1 (26 Oct) and v0.2 (27 Oct)
> **Repository baseline:** foundation commit `1d15918` · **Module to follow:** FFM-ABM-001-SUBSCRIPTION-PORTAL

## 1. Approval / release record

| Date (Dhaka) | Event | Evidence |
|---|---|---|
| 26 Oct 16:18 | Designer handoff v1.0 released to design by Tony | "see what you can do with this … let me know if you have questions" (per `DESIGNER_HANDOFF.md §1`, forwarding with an instruction to proceed is the release) |
| 26 Oct | First review v0.1 returned | style tile + canonical, proposals T1/T2/P1 |
| 27 Oct 08:58 | Architect feedback on v0.1 | visual direction **accepted for refinement**; one bounded correction pass ordered (overflow, contrast, promises, manifest, role copy) |
| 27 Oct | v0.2 correction pass returned | all five items applied; CHECKS.md introduced |
| 27 Oct 10:40 | Architect: **proceed with the full package** using the v0.2 visual direction; no 12-screen cut; keep provisional pricing/policies identified; preserve the Stripe boundary; resolve or document the coral-boundary flag; include CHECKS.md and a change list; baseline `1d15918`; module FFM-ABM-001-SUBSCRIPTION-PORTAL | this package |
| — | Final visual approval (Tony / Coach) | **PENDING** — record here before FFM assembly |

## 2. v1.0 change list (since v0.2)

1. **Coverage completed.** 13 app layouts + 2 reference layouts cover C01–C17 and the supporting states (sign-in, session expired, denied, no pharmacies, load error, hosted-portal launch failure, returned data refreshing). Inventory in `UI_SPEC.md §2`. Screen count is an outcome (15 HTML files, 92 declared states), not a target.
2. **Shared scaffolding.** Every layout is assembled from the same partials (public/authenticated top bar, footer, demo notice, wizard progress, review bar, icon sprite) and one runtime, so structure cannot drift between screens; `source/` ships the partials and build.
3. **Canonical gained four states:** `unchanged`, `refreshing`, `handoff_error`, `no_pharmacies` (C13 return states and the supporting states from the handoff).
4. **Coral-button boundary resolved** (§5): every primary button carries a 1px `border-foreground/25` hairline. In Mist this is a darker coral rim measuring **4.22:1** against a white card; in Slate the fill already clears 3.59:1. Label stays 6.06:1. No change to coral itself.
5. **Pill mobile-wrap and long-string guards** carried into every new layout (`whitespace-nowrap` on pills, `min-w-0` grid children, `break-all` emails, `nowrap` phone numbers). `CHECKS.md §1`: 510 loads, zero overflow, zero JS errors.
6. **Style tile** updated to the final recipes (hairline primary, outlined pills, foreground links, muted eyebrow) and reports both text and non-text ratios live.
7. **Docs:** `UI_SPEC.md` (full), `COMPONENT_MANIFEST.md` (full, with the new primitives named: Alert, FormField/ErrorSummary, RadioCard, Stepper, Counter, ExternalHandoffPanel; native select/checkbox/radio decision), this record, `README.md`, `CHECKS.md`.

## 3. Design decisions (visible for review)

Carried from v0.1/v0.2 (title, plan card, Stripe-first billing, separate activation/invitation axes, neutral role labels, proposed-rule chip, labelled fixtures, brand text, 44px buttons, no policy dates) plus:

| Decision | Why |
|---|---|
| Initial multi-store purchase repeats the pharmacy step ("Pharmacy n of N"), with a reduce-count confirmation that names the pharmacy to be discarded | Architect's proposed resolution (brief §8); charged coverage and collected stores stay consistent; still marked provisional for Tony/Coach |
| Only one plan is selectable; a dashed "[Second plan TBD]" slot shows where a second option would sit | No tier names invented (brief §8); the slot prevents a one-card layout from being mistaken for the final offer |
| Estimate on C01 is labelled "Estimate · not a charge"; price unavailable keeps Continue enabled | The full quote is shown and re-consented on C04 before any payment |
| Two separate consent checkboxes on C04 (terms; recurring charge with the amount inline); one on C10 (new price + today's charge); all start unticked; refreshed quotes clear consent | Data contract §5 |
| Code field: applying pauses the CTA; applied shows the discount row and a "demo code; no APA claim" line | Data contract §5 / brief §8 |
| C05 is two things: our "leaving" page and clearly labelled stand-ins for Stripe Checkout and Customer Portal with non-editable grey blocks and demo-outcome buttons | Handoff C05; no editable card fields; the boundary is visible in every render |
| C06 shows three independent tracks (payment · setup · email) so a paid-but-delayed account never looks unpaid and an email failure never looks like a payment failure | Data contract §6; handoff §6 "paid vs provisioning-delayed" |
| C14 distinguishes "Stripe confirmed nothing charged" from "payment status unknown" (CTA paused, "don't pay again") | Handoff C14 |
| C10 "Use a different card" is a labelled handoff to Stripe; the store is never added from Stripe's page; declined card on file → store not added, plan unchanged | Handoff C10; data contract §6 |
| C11 `provisioning_attention`: paid, plan shows 2, setup pending, "don't add it again", invitation held | Data contract §6 (confirmed payment with provisioning failure is an attention state, not "nothing changed") |
| C17 request feedback is neutral ("if an account matches"); no email shown or editable; `valid` hands to downstream account setup that is explicitly not designed here | Handoff C17; brief §3 (password/MFA setup is cross-app scope) |
| Sign-in shows password reset and MFA as out-of-scope placeholders, not links | Brief §6 out-of-scope; no missing flows implied to exist |
| OwedBook panels sit inside a dashed "existing shell (not designed here)" frame; SSO is marked as not proven | Handoff C08/C15 and §3 |
| Emails: masked recipients, `[SENDING ADDRESS TBD]`, `[COMPANY MAILING ADDRESS TBD]`, 600px body; four variants including the nominated-admin invitation that says billing stays with the owner | Handoff C07 |
| Add-store duplicate copy acknowledges the match may be the owner's own store and points to the pharmacies list first | Authenticated context differs from signup (C16) |

## 4. Departures from Coach's literal boards

All departures in `DESIGNER_HANDOFF.md §6` are applied: owner keeps account access when nominating another admin (separate invitation email, C07 variant); N pharmacies collected before payment; identifiers "identify" rather than "confirm it is yours"; no custom billing/cancellation screens (summary + hosted Stripe + returned states); no "under a minute", no exact link lifetime, no MFA promise; payment failure vs paid-but-delayed are distinct. Remaining Coach copy ("Business details only", "We never ask for your software password", "Resend access email", "Wrong email? contact support") is kept verbatim where it was already correct.

## 5. Token changes — portal-scoped, applied

Unchanged from v0.2 (six values in this repo's `globals.scss`, annotated in-file):

| Token | Mode | Inherited | Portal | Result |
|---|---|---|---|---|
| `--primary-foreground` | both | `0 0% 100%` | `220 24% 12%` | label on coral 2.82 → **6.06** |
| `--success` | Mist | `131 54% 40%` | `131 54% 34%` | small text 3.48 → **4.61** |
| `--warning` | Mist | `41 93% 47%` | `41 93% 32%` | small text 2.21 → **4.5** |
| `--info` | Mist | `214 74% 53%` | `214 74% 50%` | small text 4.16 → **4.5** |
| `--info` | Slate | `214 74% 64%` | `214 74% 72%` | small text 3.52 → **4.56** |
| `--destructive` | Slate | `351 95% 71%` | `351 95% 77%` | inline error 3.73 → **4.55** |

Scope: this portal only; no fleet rollout proposed. The review bar's "Fleet (before)" toggle and the two `*_fleet` PNGs exist only to show the difference.

### Coral-button boundary — resolved

Finding (v0.2): the coral fill measures 2.82:1 against a white Mist card as an *edge*. Resolution in v1.0:

1. **Hairline:** every primary button is `bg-primary text-primary-foreground border border-foreground/25`. In Mist the hairline composites to a darker coral (`#c25f41`-range) that measures **4.22:1 against white** (`CHECKS.md §3`, measured on the rendered tile); in Slate the fill itself is 3.59:1 and the hairline is a lighter rim. Visually a 1px crisp edge, consistent with the flat Metro look.
2. **Standard:** independent of the hairline, WCAG 1.4.11 (non-text contrast) requires a visible boundary only where the boundary is needed to identify the control; a filled button whose label passes (6.06:1) is identified by the label. The hairline removes the need to lean on that reading.
3. **Not done:** darkening coral itself (would need ≈ 48% lightness, `#ec3609`, to put white text at 4.1:1) — a brand change outside this portal's scope. If Tony ever wants the hairline removed, the 1.4.11 rationale above is the fallback and is recorded here.

### Kit deltas (not tokens)

`Pill` TONE map; `Button` outline 1px, primary hairline, `h-11` default. See `COMPONENT_MANIFEST.md §4`.

## 6. Provisional and open items (for Tony / Coach / Architect)

1. **Visual approval of v1.0** (Tony / Coach) before FFM assembly.
2. **Commercial:** all amounts are fixtures ($99 / $49 / $148 / $24.50 / DEMO10 −$10) under the Demo notice; plan name "Standard" and "[Second plan TBD]" slot; `[What's included: TBD]`.
3. **Policies rendered as placeholders:** `[POLICY TBD]` (cancellation timing, outstanding charges, refunds, retention), `[GRACE POLICY TBD]`, `[MEMBER ACCESS DURING GRACE PERIOD TBD]`, `[PRORATION RULE TBD]`, `[EFFECTIVE DATE RULE TBD]`, `[LINK LIFETIME TBD]`, `[HOLD PERIOD TBD]`, `[CANCELLATION TERMS TBD]`, `[LINK TBD]` for Terms/Privacy, `[SUPPORT EMAIL]`, `[SENDING ADDRESS TBD]`, `[COMPANY MAILING ADDRESS TBD]`, `[LAST 4]`.
4. **Proposed product rules (chip-labelled in renders):** Add a store disabled during past-due and scheduled cancellation.
5. **Proposed resolution (brief §8):** N pharmacies collected before payment; reduce-count confirmation.
6. **Brand text** "Pharmacy Books" + "Account & Billing" — one configurable pair; final naming with Tony/Coach.
7. **Mist warning ink** is ochre (`41 93% 32%`) rather than fleet amber; alternative (second token for text/border only) available if Coach prefers amber on solid surfaces.
8. **Downstream, not designed here:** account setup after the access link (password / sign-in protection), password reset, MFA, OwedBook shell, SSO proof, email HTML build.
9. **Engineering/QAM checks not performed by design:** assistive-technology walk, full keyboard traversal, authenticated runtime.

## 7. Checks performed on this package

- `source/check.mjs` (results in `CHECKS.md`): overflow for every page × state × theme at 375 and 1440 (+ menu open) — **510 loads, all pass, 0 JS errors**; live contrast table in both modes — all text ≥ 4.5, all pill borders ≥ 3.85, Slate coral edge 3.59; Mist primary hairline 4.22 vs white.
- Playwright renders at 2×: 245 PNGs per the matrix in `README.md`; visual pass on desktop contact sheets and mobile stitches for every layout family (wizard, boundary/post-payment, add-store, canonical, references).
- Fonts embedded; artifacts open offline; the only runtime is the in-page review bar / state selector.
