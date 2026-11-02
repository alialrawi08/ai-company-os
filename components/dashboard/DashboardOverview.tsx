"use client";
import { useEffect, useState } from "react";
import { ArrowUpRight, Bot, FolderKanban, Users, FileText, Sparkles, ShieldCheck, Activity, TrendingUp, Clock3 } from "lucide-react";
const shortcuts = [
  { title: "AI workspace", description: "Ask your assistant to research, plan, and help execute work.", href: "/dashboard/ai", icon: Bot },
  { title: "AI agent team", description: "Delegate focused work to your specialist agents.", href: "/dashboard/agents", icon: Activity },
  { title: "Projects", description: "Organize initiatives, milestones, and progress.", href: "/dashboard/projects", icon: FolderKanban },
  { title: "CRM", description: "Keep prospects and customer follow-ups together.", href: "/dashboard/crm", icon: Users },
  { title: "Documents", description: "Create a home for company knowledge and notes.", href: "/dashboard/documents", icon: FileText },
] as const;
type WorkspaceItem = { id: string; title: string; status: string; content?: { dealValue?: number | null; stage?: string; nextFollowUp?: string } | null };
type Metrics = { projects: number; contacts: number; documents: number; agents: number; pipeline: number; won: number; overdue: number };
const emptyMetrics: Metrics = { projects: 0, contacts: 0, documents: 0, agents: 0, pipeline: 0, won: 0, overdue: 0 };
export default function DashboardOverview({ firstName }: { firstName: string }) {
  const [metrics, setMetrics] = useState<Metrics>(emptyMetrics);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const sections = ["projects", "crm", "documents"] as const;
        const responses = await Promise.all(sections.map(async section => {
          const response = await fetch(\`/api/workspace/\${section}\`, { cache: "no-store" });
          const payload = await response.json();
          if (!response.ok) throw new Error(payload.error || \`Could not load \${section}\`);
          return { section, items: (payload.items || []) as WorkspaceItem[] };
        }));
        const agentResponse = await fetch("/api/agents", { cache: "no-store" });
        const agentPayload = await agentResponse.json();
        if (!agentResponse.ok) throw new Error(agentPayload.error || "Could not load agent activity");
        const bySection = Object.fromEntries(responses.map(result => [result.section, result.items])) as Record<(typeof sections)[number], WorkspaceItem[]>;
        const crm = bySection.crm;
        const today = new Date().toISOString().slice(0, 10);
        const next: Metrics = {
          projects: bySection.projects.length, contacts: crm.length, documents: bySection.documents.length,
          agents: Array.isArray(agentPayload.runs) ? agentPayload.runs.length : 0,
          pipeline: crm.reduce((sum, item) => sum + (typeof item.content?.dealValue === "number" && item.content.stage !== "lost" ? item.content.dealValue : 0), 0),
          won: crm.reduce((sum, item) => sum + (typeof item.content?.dealValue === "number" && item.content.stage === "won" ? item.content.dealValue : 0), 0),
          overdue: crm.filter(item => item.content?.nextFollowUp && item.content.nextFollowUp < today && item.content.stage !== "won" && item.content.stage !== "lost").length,
        };
        if (active) setMetrics(next);
      } catch (error) {
        if (active) setLoadError(error instanceof Error ? error.message : "Workspace metrics are unavailable.");
      } finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, []);
  const statCards = [
    { label: "Projects", value: metrics.projects.toLocaleString(), icon: FolderKanban },
    { label: "CRM contacts", value: metrics.contacts.toLocaleString(), icon: Users },
    { label: "Documents", value: metrics.documents.toLocaleString(), icon: FileText },
    { label: "Agent runs", value: metrics.agents.toLocaleString(), icon: Bot },
  ];
  return <div className="min-h-screen px-5 py-8 text-white sm:px-8 lg:px-10"><div className="mx-auto max-w-6xl">
    <div className="mb-9 flex flex-wrap items-start justify-between gap-4"><div><p className="mb-2 text-sm text-zinc-500">Company workspace</p><h1 className="text-3xl font-semibold tracking-tight">Good to have you here{firstName ? \`, \${firstName}\` : ""}.</h1><p className="mt-2 text-sm text-zinc-400">Your operations, team, and AI tools in one place.</p></div><div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-2 text-xs text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400"/> Workspace online</div></div>
    <section className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.09] to-white/[0.015] p-6 sm:p-8"><div className="max-w-2xl"><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black"><Sparkles size={19}/></div><h2 className="text-2xl font-semibold">Build a company that runs smarter.</h2><p className="mt-3 text-sm leading-6 text-zinc-400">One operating system for your projects, customers, company knowledge, and AI workforce. Your dashboard reflects the records saved in your workspace.</p><a href="/dashboard/ai" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-zinc-200">Open AI workspace <ArrowUpRight size={16}/></a></div></section>
    <section className="mb-8"><div className="mb-3 flex items-center justify-between"><h2 className="font-medium">Live workspace overview</h2><span className="text-xs text-zinc-500">{loading ? "Refreshing…" : "Synced from your workspace"}</span></div><div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{statCards.map(({label,value,icon:Icon})=><div key={label} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"><div className="flex items-center justify-between"><span className="text-xs text-zinc-500">{label}</span><Icon size={16} className="text-zinc-500"/></div><p className="mt-3 text-2xl font-semibold tabular-nums">{loading ? "—" : value}</p></div>)}</div>{loadError&&<p role="status" className="mt-3 text-xs text-amber-300">Live metrics unavailable: {loadError}</p>}</section>
    <section className="mb-8 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"><div className="flex items-center gap-2 text-xs text-zinc-500"><TrendingUp size={15}/> Open pipeline</div><p className="mt-2 text-xl font-semibold tabular-nums">{loading ? "—" : metrics.pipeline.toLocaleString()} <span className="text-xs font-normal text-zinc-500">SEK</span></p></div><div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"><div className="flex items-center gap-2 text-xs text-zinc-500"><Activity size={15}/> Won revenue</div><p className="mt-2 text-xl font-semibold tabular-nums">{loading ? "—" : metrics.won.toLocaleString()} <span className="text-xs font-normal text-zinc-500">SEK</span></p></div><a href="/dashboard/crm" className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 transition hover:bg-white/[0.05]"><div className="flex items-center gap-2 text-xs text-zinc-500"><Clock3 size={15}/> Follow-ups overdue</div><p className="mt-2 text-xl font-semibold tabular-nums">{loading ? "—" : metrics.overdue}</p><p className="mt-1 text-[11px] text-zinc-600">Open CRM tasks <ArrowUpRight size={11} className="inline"/></p></a></section>
    <div className="mb-4 flex items-center justify-between"><h2 className="font-medium">Your workspace</h2><span className="text-xs text-zinc-500">Quick access</span></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{shortcuts.map(({title,description,href,icon:Icon})=><a key={href} href={href} className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-white/20 hover:bg-white/[0.05]"><div className="mb-5 flex items-center justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]"><Icon size={19}/></div><ArrowUpRight size={16} className="text-zinc-600 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"/></div><h3 className="font-medium">{title}</h3><p className="mt-2 text-sm leading-5 text-zinc-500">{description}</p></a>)}</div>
    <div className="mt-6 flex items-start gap-3 rounded-2xl border border-white/10 p-4"><ShieldCheck size={18} className="mt-0.5 shrink-0 text-zinc-400"/><p className="text-xs leading-5 text-zinc-500">Private workspace data is loaded through authenticated server APIs. Invite teammates only after team roles and access policies are configured.</p></div>
  </div></div>;
}