"use client";
import { useEffect, useState } from "react";
export type DashboardLanguage = "en" | "sv" | "ar";
const KEY = "ai-company-os-language";
export function useDashboardLanguage() {
  const [language, setLanguage] = useState<DashboardLanguage>("en");
  useEffect(() => {
    const saved = window.localStorage.getItem(KEY);
    if (saved === "en" || saved === "sv" || saved === "ar") setLanguage(saved);
    const sync = (event: Event) => {
      const value = (event as CustomEvent<DashboardLanguage>).detail;
      if (value === "en" || value === "sv" || value === "ar") setLanguage(value);
    };
    window.addEventListener("ai-company-os-language-change", sync);
    return () => window.removeEventListener("ai-company-os-language-change", sync);
  }, []);
  return language;
}
