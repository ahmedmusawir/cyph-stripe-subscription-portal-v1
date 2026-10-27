# COMPONENT MANIFEST — Cyber Pharma Subscription Portal

> **Version:** 1.0 · **Date:** 27 October 2026 · **Designer:** Fable · **Baseline:** foundation commit `1d15918` · **Module:** FFM-ABM-001-SUBSCRIPTION-PORTAL
> **Rule:** build from this vocabulary. If a screen seems to need something not listed, STOP and surface it; don't invent a component. Source paths are the cleaned repo's (`src/components/portal/` for project primitives after the cleanup rename).

## 1. Existing primitives — reuse (themed by tokens)

| Primitive | Source | Used on | Notes |
|---|---|---|---|
| `Button` | `ui/button.tsx` | every screen | Portal recipe: `h-11`, uppercase tracked semibold. Primary adds `border border-foreground/25` (hairline — §4). Outline at 1px (§4). |
| `Input`, `Label`, `Textarea` | `ui/` | C02, C03, C04 code field, C09, sign-in | `aria-[invalid=true]:border-destructive` |
| `Table` | `ui/table.tsx` | C12 pharmacies (≥ md) | dark `bg-muted` head, zebra not required |
| `DataTable` | `portal/DataTable.tsx` | C12 pharmacies | drives the table → card reflow below `md` |
| `Pill` | `portal/Pill.tsx` — the generic status component | all statuses, Demo/Preview/Illustrative chips, Proposed-rule chip | **TONE map change** (§4): foreground text + status border + 10% tint |
| `EmptyState` | `portal/EmptyState.tsx` | C12 `no_pharmacies` | icon slot, headline, sub-copy, action |
| `Skeleton` | `ui/skeleton.tsx` | C12 loading, C10 quote loading | |
| `Sheet` | `ui/sheet.tsx` | mobile menu on both shells | existing **left-side** Sheet, kept as-is |
| `DropdownMenu` | `ui/dropdown-menu.tsx` | authenticated top bar account menu | items: Back to OwedBook · Sign out |
| `Dialog` / `AlertDialog` | `ui/` | C01 reduce-count confirm (may stay inline as designed), C10 optional | inline `alertdialog` region is the designed default |
| `Toast` / `Toaster` | `ui/` | "Invitation resent", "Access email sent again" | success only; failures are `Alert` |
| `Separator`, `Breadcrumb` | `ui/` | authenticated page crumbs (C09–C11) | |
| `ThemeToggler` | `global/ThemeToggler.tsx` | both shells, all pages | already tokenized in cleanup |
| `SpinnerLarge` | `common/SpinnerLarge.tsx` | route transitions | unchanged |

## 2. New primitives required (declared; nothing assumed installed)

| Primitive | Screens | Behaviour / API |
|---|---|---|
| **`Alert`** (`ui/alert.tsx`) | every banner and notice: demo notice, past due, cancellation scheduled/canceled, returned-from-Stripe, handoff error, error summaries, duplicate conflict, existing-email branch, quote unavailable/expired, activation panels, C14 statuses, C15 banners | Props: `tone: info · warning · destructive · success`, `title`, `children`, optional `action` slot, `role` (`status` default; `alert` for destructive), `compact` (single-line demo notice). Render: `border-l-[3px] border-<tone> bg-<tone>/10 p-4`; action stacks under text below `sm`. |
| **`FormField`** composition helpers (`Label` + `Input` + help + error) | all forms | Not a new library: a thin wrapper around existing `Label`/`Input` that wires `aria-describedby`, required marker with sr-only text, inline error with icon, `aria-invalid`. Use `react-hook-form` + `zod` (already in package.json) for validation and the error summary. |
| **`ErrorSummary`** | C02, C03, C04, C09, C10 | `role="alert"`, `tabindex="-1"`, list of field links; receives focus on failed submit. Composition of `Alert` + list. |
| **`RadioCard`** | C01 plan, C03/C09 admin choice | Native `<input type="radio">` (sr-only or visible) inside a `label` with `border-2 border-primary` when checked, `focus-within:ring-2`. No Radix dependency needed. |
| Native **`select`**, **`checkbox`**, **`radio`** styled with tokens | C02 role, C03/C09 state & software, C04/C10 consents, C01/C03 radios | Decision: native controls for the FFM (zero new deps; `accent-color: hsl(var(--primary))`, `aria-[invalid]` borders). Promote to shadcn `Select`/`Checkbox`/`RadioGroup` only if a later requirement needs search, multi-select or custom popovers. |
| **`Stepper`** (wizard progress) | C01–C04 | Props: `steps[]`, `current`. ≥ `sm`: numbered badges (done = success check, current = coral, upcoming = outlined) with connectors; < `sm`: "Step n of 4 · label" + progress bar. |
| **`Counter`** (store-count control) | C01 | − / value / + with 44px targets, `output aria-live`, min 1; emits "would discard" so the page can show the reduce confirmation. |
| **`ExternalHandoffPanel`** | C05 (leaving, previews), C10 change-card, C12/C13 Stripe actions' helper copy | Labelled "Preview · external surface" chip + dashed frame; demo-outcome buttons are review-only. |

Not required: `Card` (panels are `div.border.border-border.bg-card`), `Badge` (use `Pill`), `Tabs`, `Avatar` (initials block is a styled `span`).

## 3. Compositions (no new primitive)

| Composition | Built from | Where |
|---|---|---|
| Public top bar | `header` + brand + support text + `ThemeToggler` + Sign in `Button outline`; < md: toggle + hamburger → `Sheet` (Sign in · Support) | C01–C07, C14, C17, sign-in |
| Authenticated top bar | brand + Back to OwedBook link + `ThemeToggler` + account `DropdownMenu`; < md: toggle + hamburger → `Sheet` (identity · Back to OwedBook · Sign out) | C09–C13 |
| Page header | eyebrow (muted) + H1 + lead; optional right-aligned meta (refresh line) | all |
| Demo notice | compact `Alert info` with `Pill info` "Demo" prefix | all app screens |
| Plan summary panel | panel + `Pill` + 3-up `dl` + action column | C12 |
| Pharmacies list | `DataTable` (Pharmacy · Store admin · Monthly · Activation · Invitation · action) → card reflow | C12 |
| Role label | `text-[11px] font-semibold uppercase tracking-wide text-muted-foreground` after the name | everywhere a person is named |
| Avatar initials | `span.grid.h-10.w-10.bg-primary.text-primary-foreground` | top bar, owner panels |
| Billing-owner panel · Cancel panel | panel + avatar + copy + destructive-outline link | C12 |
| Order summary | panel + `dl` rows + divider + code field + CTA + lock note; sticky at `lg` | C04 |
| Quote panel | panel + `dl` rows + validity line; states swap body | C10 |
| Activation tracks | `ol` of three rows, each with a state icon tile | C06 |
| Review summary cards | panel + Edit link + `dl` grid | C04 |
| Store status panel | `dl` with three independent pills | C11 |
| Email preview | envelope `dl` + 600px body | C07 (reference) |
| OwedBook frame | dashed frame + stand-in nav + content slot | C08/C15 (reference) |

## 4. Kit deltas (not tokens)

1. **`Pill` TONE map:** `success: "border-success bg-success/10 text-foreground"`, `warning: "border-warning bg-warning/10 text-foreground"`, `destructive: "border-destructive bg-destructive/10 text-foreground"`, `info: "border-info bg-info/10 text-foreground"`, `muted: "border-border bg-muted text-foreground"`; base gains `whitespace-nowrap border`. API unchanged.
2. **`Button` outline variant:** `border-4` → `border` (1px). Portal designs assume 1px.
3. **`Button` primary variant (portal):** add `border border-foreground/25` — the Mist edge hairline (4.22:1 vs white; see `CHECKS.md §3`). Implement as the default `variant="default"` for this app or a `portal` variant; do not hand-add per call site.
4. **`Button` height:** portal default `h-11`; propose `size="default"` → `h-11` in this app (or a `touch` size).
5. **Mobile menu:** keep the existing left `Sheet`; account items listed in §3.

## 5. Per-screen map

| Screen | Existing | New | Compositions |
|---|---|---|---|
| C01 plan | Button, Pill | RadioCard, Counter, Stepper, Alert | public top bar, page header, demo notice |
| C02 owner | Button, Input, Label | FormField, ErrorSummary, Alert, Stepper, native select | public top bar |
| C03 / C09 pharmacy | Button, Input, Label, Pill | FormField, ErrorSummary, Alert, RadioCard, Stepper (C03 only), native select | breadcrumb (C09), draft banner (C09) |
| C04 review | Button, Input, Pill | Alert, ErrorSummary, Stepper, native checkbox | review cards, order summary |
| C05 handoff | Button, Pill | ExternalHandoffPanel | — |
| C06 activation | Button, Pill | Alert | activation tracks, resend section |
| C10 confirm | Button, Pill, Skeleton | Alert, ErrorSummary, ExternalHandoffPanel, native checkbox | quote panel, payment panel |
| C11 store added | Button, Pill | Alert | store status panel |
| C12 / C13 account & billing | Button, Pill, Table, DataTable, EmptyState, Skeleton, DropdownMenu, Sheet | Alert | plan summary, pharmacies list, owner panel, cancel panel |
| C14 incomplete | Button, Pill | Alert | saved-details panel |
| C17 access link | Button | Alert | focused card |
| Sign-in | Button, Input, Label | Alert | focused form |
| C07 / C08 / C15 references | Pill, Button | Alert | email preview, OwedBook frame |

## 6. Build priority

1. `Alert` + `Pill` TONE change + `Button` deltas (touch every screen).
2. `FormField`/`ErrorSummary` + native controls + `RadioCard` + `Stepper` + `Counter` (unblock C01–C04, C09, C10).
3. `ExternalHandoffPanel` (C05, C10, C12/C13).
4. `EmptyState`/`Skeleton` wiring for C12 states.
