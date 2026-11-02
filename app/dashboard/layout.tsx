"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import RouteTransition from "@/components/dashboard/RouteTransition";
import {
  Activity,
  Bot,
  FileText,
  FolderKanban,
  Globe2,
  LayoutDashboard,
  Menu,
  PhoneCall,
  Settings,
  Users,
  UsersRound,
  X,
} from "lucide-react";

type Language = "en" | "sv" | "ar";

const languages: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "sv", label: "Svenska" },
  { value: "ar", label: "العربية" },
];

const copy: Record<Language, {
  workspace: string;
  overview: string;
  assistant: string;
  arasko: string;
  agents: string;
  projects: string;
  crm: string;
  documents: string;
  settings: string;
  language: string;
  menu: string;
}> = {
  en: {
    workspace: "Company workspace",
    overview: "Overview",
    assistant: "AI Assistant",
    arasko: "Arasko",
    agents: "AI Agents",
    projects: "Projects",
    crm: "CRM",
    documents: "Documents",
    settings: "Settings",
    language: "Language",
    menu: "Menu",
  },
  sv: {
    workspace: "Företagsyta",
    overview: "Översikt",
    assistant: "AI-assistent",
    arasko: "Arasko",
    agents: "AI-agenter",
    projects: "Projekt",
    crm: "CRM",
    documents: "Dokument",
    settings: "Inställningar",
    language: "Språk",
    menu: "Meny",
  },
  ar: {
    workspace: "مساحة عمل الشركة",
    overview: "نظرة عامة",
    assistant: "مساعد الذكاء الاصطناعي",
    arasko: "أراسكـو",
    agents: "وكلاء الذكاء الاصطناعي",
    projects: "المشاريع",
    crm: "إدارة العملاء",
    documents: "المستندات",
    settings: "الإعدادات",
    language: "اللغة",
    menu: "القائمة",
  },
};

const items = [
  { key: "overview", href: "/dashboard", icon: LayoutDashboard },
  { key: "assistant", href: "/dashboard/ai", icon: Bot },
  { key: "arasko", href: "/dashboard/arasko", icon: PhoneCall },
  { key: "agents", href: "/dashboard/agents", icon: UsersRound },
  { key: "projects", href: "/dashboard/projects", icon: FolderKanban },
  { key: "crm", href: "/dashboard/crm", icon: Users },
  { key: "documents", href: "/dashboard/documents", icon: FileText },
  { key: "settings", href: "/dashboard/settings", icon: Settings },
] as const;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [language, setLanguage] = useState<Language>("en");
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = copy[language];
  function changeLanguage(value: Language) {
    setLanguage(value);
    window.dispatchEvent(new CustomEvent("ai-company-os-language-change", { detail: value }));
  }

  useEffect(() => {
    const saved = window.localStorage.getItem("ai-company-os-language");
    if (saved === "en" || saved === "sv" || saved === "ar") setLanguage(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    window.localStorage.setItem("ai-company-os-language", language);
  }, [language]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navigation = (
    <nav aria-label={t.menu} className="flex-1 space-y-1 overflow-y-auto p-3">
      {items.map(({ key, href, icon: Icon }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${active ? "bg-white/15 text-white ring-1 ring-white/20 shadow-[0_8px_28px_rgba(90,130,210,0.16)] backdrop-blur-xl" : "text-zinc-400 hover:bg-white/[0.07] hover:text-white"}`}
          >
            <Icon size={18} aria-hidden="true" />
            <span>{t[key]}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-transparent text-white md:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-white/[0.035] backdrop-blur-2xl md:flex">
        <Link href="/dashboard" className="border-b border-white/10 bg-white/[0.025] px-5 py-6">
          <span className="block text-xl font-bold tracking-tight">AI Company OS</span>
          <span className="mt-1 block text-xs text-zinc-500">{t.workspace}</span>
        </Link>
        {navigation}
        <div className="border-t border-white/10 p-4">
          <label htmlFor="desktop-language" className="mb-2 flex items-center gap-2 text-xs text-zinc-500">
            <Globe2 size={14} /> {t.language}
          </label>
          <select id="desktop-language" value={language} onChange={(event) => changeLanguage(event.target.value as Language)} className="min-h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 text-sm text-white outline-none focus:border-white/30">
            {languages.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-white/10 bg-[#0b1020]/70 px-4 shadow-lg shadow-black/10 backdrop-blur-2xl md:hidden">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">AI Company OS</p>
            <p className="truncate text-[11px] text-zinc-500">{t.workspace}</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="mobile-language">{t.language}</label>
            <select id="mobile-language" value={language} onChange={(event) => changeLanguage(event.target.value as Language)} className="min-h-10 max-w-28 rounded-lg border border-white/10 bg-zinc-900 px-2 text-xs text-white">
              {languages.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
            <button type="button" onClick={() => setMobileOpen((open) => !open)} aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen} className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white">
              {mobileOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </header>

        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <button type="button" aria-label="Close menu" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-black/70" />
            <aside className="relative flex h-full w-[min(20rem,86vw)] flex-col border-r border-white/10 bg-[#111a2b]/90 shadow-2xl backdrop-blur-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
                <div><p className="font-semibold">AI Company OS</p><p className="mt-1 text-xs text-zinc-500">{t.workspace}</p></div>
                <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu" className="rounded-lg p-2 text-zinc-400 hover:bg-white/10"><X size={18}/></button>
              </div>
              {navigation}
              <div className="border-t border-white/10 p-4">
                <label htmlFor="drawer-language" className="mb-2 flex items-center gap-2 text-xs text-zinc-500"><Globe2 size={14}/>{t.language}</label>
                <select id="drawer-language" value={language} onChange={(event) => setLanguage(event.target.value as Language)} className="min-h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 text-sm text-white">
                  {languages.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </div>
            </aside>
          </div>
        )}

        <main className="min-w-0"><RouteTransition>{children}</RouteTransition></main>
      </div>
    </div>
  );
}
