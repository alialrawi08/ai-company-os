"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Plus, FolderKanban, Users, FileText, Bot, Settings, Trash2, ArrowUpRight, Sparkles } from "lucide-react";

type Item = { id: string; title: string; detail: string; status: string; createdAt: string };
const config: Record<string, { title: string; description: string; singular: string; icon: typeof FolderKanban; examples: string[] }> = {
  projects: { title: "Projects", description: "Plan work, track progress, and keep every initiative moving.", singular: "project", icon: FolderKanban, examples: ["Website redesign", "Launch campaign"] },
  crm: { title: "Customer relationships", description: "Keep prospects, customers, and next steps in one workspace.", singular: "contact", icon: Users, examples: ["New prospect", "Existing customer"] },
  documents: { title: "Documents", description: "A focused home for briefs, notes, and company knowledge.", singular: "document", icon: FileText, examples: ["Company brief", "Meeting notes"] },
  agents: { title: "AI Agents", description: "Your specialist team. Configure roles and send work to the AI workspace.", singular: "agent", icon: Bot, examples: ["CEO Agent", "Research Agent", "Sales Agent", "Developer Agent", "Marketing Agent", "Finance Agent", "Support Agent"] },
  settings: { title: "Settings", description: "Configure your workspace preferences and AI provider.", singular: "setting", icon: Settings, examples: ["Workspace profile", "AI provider"] },
};
const keyFor = (section: string) => `company-os:${section}:v1`;

export default function WorkspaceSection({ section }: { section: string }) {
  const data = config[section];
  const [items, setItems] = useState<Item[]>([]);
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!data) return;
    try {
      const saved = localStorage.getItem(keyFor(section));
      if (saved) setItems(JSON.parse(saved) as Item[]);
      else if (section === "agents") setItems(data.examples.map((name) => ({ id: crypto.randomUUID(), title: name, detail: "Specialist agent · Ready to configure", status: "Planned", createdAt: new Date().toISOString() })));
    } catch { setItems([]); }
    setReady(true);
  }, [section, data]);

  useEffect(() => {
    if (ready) localStorage.setItem(keyFor(section), JSON.stringify(items));
  }, [items, ready, section]);

  const filtered = useMemo(() => items.filter((item) => `${item.title} ${item.detail} ${item.status}`.toLowerCase().includes(query.toLowerCase())), [items, query]);
  if (!data) return <div className="p-10 text-white"><h1 className="text-2xl font-semibold">Page not found</h1><a className="mt-4 inline-block text-zinc-400 underline" href="/dashboard">Return to dashboard</a></div>;
  const Icon = data.icon;
  function addItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) return;
    setItems((current) => [{ id: crypto.randomUUID(), title: title.trim(), detail: detail.trim() || "No details added yet", status: section === "agents" ? "Planned" : "New", createdAt: new Date().toISOString() }, ...current]);
    setTitle(""); setDetail(""); setNotice(`${data.singular} added`); window.setTimeout(() => setNotice(""), 2200);
  }

  return <div className="min-h-screen px-5 py-8 text-white sm:px-8 lg:px-10">
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div><div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]"><Icon size={21}/></div><h1 className="text-3xl font-semibold tracking-tight">{data.title}</h1><p className="mt-2 max-w-2xl text-sm text-zinc-400">{data.description}</p></div>
        <a href="/dashboard/ai" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm hover:bg-white/10"><Sparkles size={16}/> Open AI workspace <ArrowUpRight size={15}/></a>
      </div>
      {section === "settings" && <div className="mb-6 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-sm text-amber-100/80">Workspace data is currently stored in this browser. Connect a database and configure authentication secrets before using this as a multi-user production workspace.</div>}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 className="font-medium">Workspace records <span className="ml-2 text-xs text-zinc-500">{items.length}</span></h2><div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search..." className="w-52 rounded-xl border border-white/10 bg-black/20 py-2 pl-9 pr-3 text-sm outline-none focus:border-white/30"/></div></div>
          <div className="space-y-2">{filtered.map((item)=><article key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4"><div className="min-w-0"><h3 className="truncate text-sm font-medium">{item.title}</h3><p className="mt-1 truncate text-xs text-zinc-500">{item.detail}</p></div><div className="flex shrink-0 items-center gap-3"><span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-zinc-400">{item.status}</span><button aria-label={`Delete ${item.title}`} onClick={()=>setItems((current)=>current.filter((x)=>x.id!==item.id))} className="rounded-lg p-2 text-zinc-500 hover:bg-red-500/10 hover:text-red-300"><Trash2 size={15}/></button></div></article>)}
          {filtered.length===0 && <div className="rounded-xl border border-dashed border-white/10 px-4 py-12 text-center text-sm text-zinc-500">{query ? "No matching records." : "Nothing here yet. Add your first record."}</div>}</div>
        </section>
        <aside className="h-fit rounded-2xl border border-white/10 bg-white/[0.025] p-5"><h2 className="mb-4 font-medium">Add {data.singular}</h2><form onSubmit={addItem} className="space-y-3"><label className="block text-xs text-zinc-400">Name<input required value={title} onChange={(e)=>setTitle(e.target.value)} placeholder={section==="crm"?"Contact or company name":section==="agents"?"Agent name":`New ${data.singular} name`} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none focus:border-white/30"/></label><label className="block text-xs text-zinc-400">Details<textarea value={detail} onChange={(e)=>setDetail(e.target.value)} rows={3} placeholder="Add context, goals, or notes..." className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none focus:border-white/30"/></label><button className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-zinc-200"><Plus size={16}/> Add {data.singular}</button></form>{notice&&<p role="status" className="mt-3 text-xs text-emerald-300">{notice}</p>}<p className="mt-5 text-xs leading-5 text-zinc-600">Saved in this browser only. Server sync and team sharing are not enabled yet.</p></aside>
      </div>
    </div>
  </div>;
}
