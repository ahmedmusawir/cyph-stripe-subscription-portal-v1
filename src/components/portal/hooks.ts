"use client";

import { useCallback, useRef } from "react";

/** One operation key per attempt: stable across double-clicks; renewed only after a definitive failure. */
export function useOperationKey(prefix: string) {
  const ref = useRef<string | null>(null);
  const current = useCallback(() => {
    if (!ref.current) {
      const random =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID().replace(/-/g, "")
          : Math.random().toString(36).slice(2) + Date.now().toString(36);
      ref.current = `${prefix}_${random}`.slice(0, 64);
    }
    return ref.current;
  }, [prefix]);
  const renew = useCallback(() => {
    ref.current = null;
  }, []);
  return { current, renew };
}
