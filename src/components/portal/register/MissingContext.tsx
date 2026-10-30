import { Alert } from "../Alert";

// Deep links without the needed draft context land on a safe step with an explanation.
export function MissingContextNotice({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <Alert tone="info" title="We brought you back to this step" className="mb-5">
      Earlier signup details are missing, so this is the first step that still needs them. Nothing has been charged.
    </Alert>
  );
}

export const MISSING = "missing_context";
