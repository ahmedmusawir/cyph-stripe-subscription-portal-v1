# Anti-Patterns — next-deploy-auto (agent-execution mode)

The v3.1 family's AP-G* (generation) and AP-E* (execution) patterns still apply. These are the ones that only exist once the agent holds the keyboard.

### AP-A1: Running the secret helper yourself
**Failure:** "The operator is slow, I'll just run `./upload-secrets.sh`." **Why it fails:** the whole privacy model rests on the agent never being in the same process as the values. **Correct:** hand it over in §4.8 format, wait for "secrets done", verify metadata only.

### AP-A2: Granting a missing role to keep moving
**Failure:** Staging Rule or a secretAccessor binding is missing; agent runs `add-iam-policy-binding` and continues. **Why it fails:** a silent grant is an unaudited permission change on a shared project — exactly what §4.6 forbids. **Correct:** report, show the command, stop, let the operator run or approve it.

### AP-A3: Treating the config as truth
**Failure:** generating straight from `stark-deploy.yaml` without grepping the code. **Why it fails:** env files and configs carry fossils (v3 field test: labeled Stripe vars with zero code reads). **Correct:** config is CLAIM; code reads are EVIDENCE; mismatches become QUESTIONs in the plan.

### AP-A4: "Deploy SUCCESS" = done
**Failure:** stopping at the Cloud Build green. **Why it fails:** a deploy can succeed with a `Setting IAM policy failed` warning (403 service), or with the wrong exposure. **Correct:** read the invoker policy back, curl the URL, compare both to `access.invoker`.

### AP-A5: Inferring the build SA
**Failure:** assuming `PROJECT_NUMBER-compute@…`, reading the identity off the LAST build (`builds list`), or turning a failed/empty lookup into a guessed email. **Why it fails:** the last build's account is not necessarily the next build's; a permission or API error looks like "empty" and becomes a wrong identity with a green checkmark. **Correct:** `gcloud builds get-default-service-account --project P --region R` (or the explicit `serviceAccount:` in cloudbuild.yaml); a lookup error is shown and stops the run.

### AP-A9: Trusting `.dockerignore` for the Cloud Build upload
**Failure:** "`.env*` is in `.dockerignore`, so secrets can't leave the machine." **Why it fails:** `.dockerignore` governs the docker build context INSIDE Cloud Build; the tarball gcloud uploads BEFORE that is governed by `.gcloudignore` (or gitignore mirroring when none exists). An existing `.gcloudignore` that forgets `.env*` ships it. **Correct:** `gcloud meta list-files-for-upload .` is the effective list — check it at generation and in `deploy.sh`; never cat the files.

### AP-A6: Fixing the operator's files
**Failure:** silently editing `stark-deploy.yaml` to "correct" a value, or editing `next.config.*` without the explicit approval. **Why it fails:** Read-Only Boundary §4.10; the config is the operator's declaration of intent. **Correct:** explain the problems, collect missing answers and show exact nonsecret changes; save only after confirmation, then revalidate. See STARTUP.md.

### AP-A7: Proceeding on silence or on a staged approval
**Failure:** waiting N seconds then continuing; or writing "APPROVED" into the operator's input. **Correct:** §4.7 — only operator-typed words count; there is no timeout path.

### AP-A8: Diagnosing with values on screen
**Failure:** on a crash-loop, printing env or secret contents to debug. **Correct:** read Cloud Run logs, check version metadata, name the suspect variable; never its value. If the value is wrong, the operator re-runs the helper.
