"use client";

import { ArrowUpRight, Bot, FolderKanban, Users, FileText, Sparkles, ShieldCheck } from "lucide-react";

const shortcuts = [
  { title: "AI workspace", description: "Ask your assistant to research, plan, and help execute work.", href: "/dashboard/ai", icon: Bot },
  { title: "Projects", description: "Organize initiatives, milestones, and progress.", href: "/dashboard/projects", icon: FolderKanban },
  { title: "CRM", description: "Keep prospects and customer follow-ups together.", href: "/dashboard/crm", icon: Users },
  { title: "Documents", description: "Create a home for company knowledge and notes.", href: "/dashboard/documents", icon: FileText },
];
export default function DashboardOverview({ firstName }: { firstName: string }) {
  return <div className="min-h-screen px-5 py-8 text-white sm:px-8 lg:px-10"><div className="mx-auto max-w-6xl">
    <div className="mb-9 flex flex-wrap items-start justify-between gap-4"><div><p className="mb-2 text-sm text-zinc-500">Company workspace</p><h1 className="text-3xl font-semibold tracking-tight">Good to have you here{firstName ? `, ${firstName}` : ""}.</h1><p className="mt-2 text-sm text-zinc-400">Your operations, team, and AI tools in one place.</p></div><div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-2 text-xs text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400"/> Workspace online</div></div>
    <section className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.09] to-white/[0.015] p-6 sm:p-8"><div className="max-w-2xl"><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black"><Sparkles size={19}/></div><h2 className="text-2xl font-semibold">Build a company that runs smarter.</h2><p className="mt-3 text-sm leading-6 text-zinc-400">Bring your work into one operating system. Start with the AI workspace, then organize projects, customer relationships, and company knowledge.</p><a href="/dashboard/ai" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-zinc-200">Open AI workspace <ArrowUpRight size={16}/></a></div></section>
    <div className="mb-4 flex items-center justify-between"><h2 className="font-medium">Your workspace</h2><span className="text-xs text-zinc-500">Quick access</span></div>
    <div className="grid gap-3 sm:grid-cols-2">{shortcuts.map(({title,description,href,icon:Icon})=><a key={href} href={href} className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-white/20 hover:bg-white/[0.05]"><div className="mb-5 flex items-center justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]"><Icon size={19}/></div><ArrowUpRight size={16} className="text-zinc-600 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"/></div><h3 className="font-medium">{title}</h3><p className="mt-2 text-sm leading-5 text-zinc-500">{description}</p></a>)}</div>
    <div className="mt-6 flex items-start gap-3 rounded-2xl border border-white/10 p-4"><ShieldCheck size={18} className="mt-0.5 shrink-0 text-zinc-400"/><p className="text-xs leading-5 text-zinc-500">Production readiness: connect persistent storage, configure Clerk and AI provider environment variables, and run deployment checks before inviting a team.</p></div>
  </div></div>;
}
