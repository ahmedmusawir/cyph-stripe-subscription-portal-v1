// Portal FFM — injected demo latency so busy/pending states are visible.
const LATENCY_MS = 350;

export function demoDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
}
