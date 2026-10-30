"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "lucide-react";

// Light / Dark only (ThemeProvider runs with enableSystem={false}). One 44px
// toggle button per the portal design (_theme-toggle partial); the choice is
// persisted per viewer by next-themes. Icons switch with the `dark` class so
// the first paint is correct before hydration.
const ThemeToggler = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="grid h-11 w-11 shrink-0 place-items-center text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      data-testid="theme-toggle"
    >
      <MoonIcon className="h-5 w-5 dark:hidden" aria-hidden="true" />
      <SunIcon className="hidden h-5 w-5 dark:block" aria-hidden="true" />
    </button>
  );
};

export default ThemeToggler;
