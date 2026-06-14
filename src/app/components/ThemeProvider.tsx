"use client";

import { useEffect } from "react";

export type AppTheme = "light" | "dark" | "pastel";

const storageKey = "next-auth-app-theme";
const defaultTheme: AppTheme = "light";

export function applyTheme(theme: AppTheme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(storageKey, theme);
}

export function getStoredTheme(): AppTheme {
  if (typeof window === "undefined") {
    return defaultTheme;
  }

  const theme = localStorage.getItem(storageKey);

  if (theme === "dark" || theme === "light" || theme === "pastel") {
    return theme;
  }

  return defaultTheme;
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    applyTheme(getStoredTheme());

    const syncTheme = () => applyTheme(getStoredTheme());
    window.addEventListener("storage", syncTheme);
    window.addEventListener("app-theme-change", syncTheme);

    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener("app-theme-change", syncTheme);
    };
  }, []);

  return children;
}
