# ADDENDUM_002 — scenario → initial state → customer action → next state (owned build of the repaired tree, :3108)

Selected through **Registration scenario → Load** (the only selector). "Stable" = the same heading and identical stored state after a 2.5 s wait and a page reload. Seeded `activationPlan` is `ready` in every case.

| Scenario selected | Visible initial state (H1) | Seed (payment · setup · email · checkout) | Stable before action | Customer action | Next state (H1) | Final state |
|---|---|---|---|---|---|---|
| `activation_waiting` | Waiting for payment confirmation | pending · not_started · not_started · pending | yes | Refresh status (then again) | Payment confirmed. Setting up your pharmacies… → You're in. Check your email. | confirmed · ready · sent · paid |
| `activation_provisioning` | Payment confirmed. Setting up your pharmacies… | confirmed · pending · not_started · paid | yes | Refresh status | You're in. Check your email. | confirmed · ready · sent · paid |
| `activation_delayed` | Paid — setup is taking longer | confirmed · attention · not_started · paid | yes | Refresh status | You're in. Check your email. | confirmed · ready · sent · paid |
| `activation_email_failed` | You're set up — the access email didn't send | confirmed · ready · failed · paid | yes | Resend access email | You're in. Check your email. | confirmed · ready · sent · paid |
| `activation_payment_failed` | Payment didn't go through | failed · not_started · not_started · declined | yes | Try payment again | Review and pay | cleared: no checkout or activation (fresh quote, unticked consent) |
| `activation_ready` | You're in. Check your email. | confirmed · ready · sent · paid | yes | Resend access email | You're in. Check your email. | confirmed · ready · sent · paid |

Further progression asserted in the same tests:
- **Waiting:** a second Refresh status goes on to "You're in. Check your email."
- **Email failed and ready:** "Sent again at … (simulated)" is shown. **Ready** has no Refresh status.
- **Payment failed:** Try payment again goes to review with a fresh quote ($148.00), the consents unticked, and the old checkout and activation cleared. No second payment is open.

**Before (baseline `d6fe678` + ADDENDUM_001; `before/before-activation-plan-matrix.json`):** I tried all 24 combinations of scenario and "Next activation check" option.
- Selecting an option never changed the visible screen; it is applied only on the *next* Refresh status.
- On the email-failed, payment-failed and ready states there is no Refresh status, so the option had no effect at all.
- Loading any scenario reset the control to `ready`. That matches the Director's observation.
- Every Refresh status outcome matched the engine rules, so no engine failure was reproduced.
- On the baseline, the six scenario tests, the keyboard test and the mobile test already passed. Only the "control is gone" check failed (`logs/before-focused.log`), so the scenarios themselves needed no engine repair.
