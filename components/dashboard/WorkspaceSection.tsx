"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Plus, FolderKanban, Users, FileText, Bot, Settings, Trash2, ArrowUpRight, Sparkles, Pencil, Check, X } from "lucide-react";

type CRMDetails = { company?: string; email?: string; phone?: string; dealValue?: number | null; stage?: string; nextFollowUp?: string };
type Item = { id: string; title: string; detail: string; status: string; createdAt: string; crm?: CRMDetails };
const config: Record<string, { title: string; description: string; singular: string; icon: typeof FolderKanban; examples: string[] }> = {
  projects: { title: "Projects", description: "Plan work, track progress, and keep every initiative moving.", singular: "project", icon: FolderKanban, examples: ["Website redesign", "Launch campaign"] },
  crm: { title: "Customer relationships", description: "Keep prospects, customers, and next steps in one workspace.", singular: "contact", icon: Users, examples: ["New prospect", "Existing customer"] },
  documents: { title: "Documents", description: "A focused home for briefs, notes, and company knowledge.", singular: "document", icon: FileText, examples: ["Company brief", "Meeting notes"] },
  agents: { title: "AI Agents", description: "Your specialist team. Configure roles and send work to the AI workspace.", singular: "agent", icon: Bot, examples: ["CEO Agent", "Research Agent", "Sales Agent", "Developer Agent", "Marketing Agent", "Finance Agent", "Support Agent"] },
  settings: { title: "Settings", description: "Configure your workspace preferences and AI provider.", singular: "setting", icon: Settings, examples: ["Workspace profile", "AI provider"] },
};

type ApiItem = { id: string; title: string; description: string; status: string; created_at: string; content?: Record<string, unknown> | null };

export default function WorkspaceSection({ section }: { section: string }) {
  const data = config[section];
  const [items, setItems] = useState<Item[]>([]);
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDetail, setEditDetail] = useState("");
  const [crmCompany, setCrmCompany] = useState("");
  const [crmEmail, setCrmEmail] = useState("");
  const [crmPhone, setCrmPhone] = useState("");
  const [crmValue, setCrmValue] = useState("");
  const [crmStage, setCrmStage] = useState("lead");
  const [crmFollowUp, setCrmFollowUp] = useState("");
  const [editCrm, setEditCrm] = useState<CRMDetails>({});

  useEffect(() => {
    if (!data) return;
    let active = true;
    setReady(false);
    setError("");
    fetch(`/api/workspace/${section}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Could not load workspace records.");
        return payload.items as ApiItem[];
      })
      .then((records) => {
        if (active) setItems(records.map((item) => ({
          id: item.id,
          title: item.title,
          detail: item.description || "No details added yet",
          status: item.status,
          createdAt: item.created_at,
        })));
      })
      .catch((reason: Error) => { if (active) setError(reason.message); })
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, [section, data]);

  const filtered = useMemo(() => items.filter((item) => `${item.title} ${item.detail} ${item.status}`.toLowerCase().includes(query.toLowerCase())), [items, query]);
  const crmStages = [{ id: "lead", label: "Lead" }, { id: "contacted", label: "Contacted" }, { id: "qualified", label: "Qualified" }, { id: "proposal", label: "Proposal" }, { id: "won", label: "Won" }, { id: "lost", label: "Lost" }];
  const pipelineValue = items.reduce((sum, item) => sum + (typeof item.crm?.dealValue === "number" && item.crm.stage !== "lost" ? item.crm.dealValue : 0), 0);
  const wonValue = items.reduce((sum, item) => sum + (typeof item.crm?.dealValue === "number" && item.crm.stage === "won" ? item.crm.dealValue : 0), 0);
  const overdueCount = items.filter(item => item.crm?.nextFollowUp && item.crm.nextFollowUp < new Date().toISOString().slice(0,10) && item.crm.stage !== "won" && item.crm.stage !== "lost").length;
  if (!data) return <div className="p-10 text-white"><h1 className="text-2xl font-semibold">Page not found</h1><a className="mt-4 inline-block text-zinc-400 underline" href="/dashboard">Return to dashboard</a></div>;
  const Icon = data.icon;

  async function addItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true); setError("");
    try {
      const response = await fetch(`/api/workspace/${section}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: detail.trim(), ...(section === "crm" ? { content: { company: crmCompany.trim(), email: crmEmail.trim(), phone: crmPhone.trim(), dealValue: crmValue ? Number(crmValue) : null, stage: crmStage, nextFollowUp: crmFollowUp || "" }, status: crmStage } : {}) }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not save record.");
      const item = payload.item as ApiItem;
      setItems((current) => [{ id: item.id, title: item.title, detail: item.description || "No details added yet", status: item.status, createdAt: item.created_at, crm: section === "crm" ? { company: crmCompany.trim(), email: crmEmail.trim(), phone: crmPhone.trim(), dealValue: crmValue ? Number(crmValue) : null, stage: crmStage, nextFollowUp: crmFollowUp } : undefined }, ...current]);
      setTitle(""); setDetail(""); setCrmCompany(""); setCrmEmail(""); setCrmPhone(""); setCrmValue(""); setCrmStage("lead"); setCrmFollowUp(""); setNotice(`${data.singular} saved`);
      window.setTimeout(() => setNotice(""), 2200);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save record.");
    } finally { setSaving(false); }
  }

  function beginEdit(item: Item) {
    setEditingId(item.id); setEditTitle(item.title); setEditDetail(item.detail === "No details added yet" ? "" : item.detail); setEditCrm(item.crm || {}); setError("");
  }

  async function saveEdit(id: string) {
    if (!editTitle.trim() || saving) return;
    setSaving(true); setError("");
    try {
      const response = await fetch(`/api/workspace/${section}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, title: editTitle.trim(), description: editDetail.trim(), ...(section === "crm" ? { content: editCrm, status: editCrm.stage || "lead" } : {}) }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not update record.");
      const updated = payload.item as ApiItem;
      setItems(current => current.map(item => item.id === id ? { ...item, title: updated.title, detail: updated.description || "No details added yet", status: updated.status, crm: section === "crm" ? editCrm : item.crm } : item));
      setEditingId(null); setNotice(`${data.singular} updated`); window.setTimeout(() => setNotice(""), 2200);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not update record."); }
    finally { setSaving(false); }
  }

  async function moveDeal(item: Item, stage: string) {
    const previous = item.crm || {};
    const updatedCrm = { ...previous, stage };
    setItems(current => current.map(record => record.id === item.id ? { ...record, status: stage, crm: updatedCrm } : record));
    try {
      const response = await fetch(`/api/workspace/${section}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id, status: stage, content: updatedCrm }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not move deal.");
    } catch (reason) {
      setItems(current => current.map(record => record.id === item.id ? { ...record, status: item.status, crm: previous } : record));
      setError(reason instanceof Error ? reason.message : "Could not move deal.");
    }
  }

  async function deleteItem(id: string) {
    setError("");
    try {
      const response = await fetch(`/api/workspace/${section}?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not delete record.");
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not delete record.");
    }
  }

  return <div className="min-h-screen px-5 py-8 text-white sm:px-8 lg:px-10">
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div><div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]"><Icon size={21}/></div><h1 className="text-3xl font-semibold tracking-tight">{data.title}</h1><p className="mt-2 max-w-2xl text-sm text-zinc-400">{data.description}</p></div>
        <a href="/dashboard/ai" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm hover:bg-white/10"><Sparkles size={16}/> Open AI workspace <ArrowUpRight size={15}/></a>
      </div>
      {error && <div role="alert" className="mb-5 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-3 text-sm text-red-200">{error}</div>}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 className="font-medium">Workspace records <span className="ml-2 text-xs text-zinc-500">{items.length}</span></h2><div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search..." className="w-52 rounded-xl border border-white/10 bg-black/20 py-2 pl-9 pr-3 text-sm outline-none focus:border-white/30"/></div></div>
          <>{section === "crm" && <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3"><div className="rounded-xl border border-white/10 bg-black/20 p-4"><p className="text-xs text-zinc-500">Open pipeline value</p><p className="mt-1 text-xl font-semibold">{pipelineValue.toLocaleString()} <span className="text-xs font-normal text-zinc-500">SEK</span></p></div><div className="rounded-xl border border-white/10 bg-black/20 p-4"><p className="text-xs text-zinc-500">Won revenue</p><p className="mt-1 text-xl font-semibold">{wonValue.toLocaleString()} <span className="text-xs font-normal text-zinc-500">SEK</span></p></div><div className="rounded-xl border border-white/10 bg-black/20 p-4"><p className="text-xs text-zinc-500">Overdue follow-ups</p><p className="mt-1 text-xl font-semibold">{overdueCount}</p></div></div>}{section === "crm" ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{crmStages.map(stage => <div key={stage.id} className="min-h-40 rounded-xl border border-white/10 bg-black/10 p-3"><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-medium">{stage.label}</h3><span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-zinc-400">{filtered.filter(item => (item.crm?.stage || item.status || "lead") === stage.id).length}</span></div><div className="space-y-2">{filtered.filter(item => (item.crm?.stage || item.status || "lead") === stage.id).map(item => <article key={item.id} className="rounded-lg border border-white/[0.08] bg-white/[0.035] p-3"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-sm font-medium">{item.title}</p><p className="mt-1 truncate text-xs text-zinc-500">{item.crm?.company || item.detail}</p></div><button aria-label={`Edit ${item.title}`} onClick={()=>beginEdit(item)} className="rounded-md p-1.5 text-zinc-500 hover:bg-white/10 hover:text-white"><Pencil size={14}/></button></div><div className="mt-3 flex items-center justify-between gap-2"><span className="text-xs text-zinc-400">{typeof item.crm?.dealValue === "number" ? `${item.crm.dealValue.toLocaleString()} SEK` : "No value"}</span><select aria-label={`Move ${item.title}`} value={stage.id} onChange={e=>void moveDeal(item,e.target.value)} className="max-w-28 rounded-md border border-white/10 bg-[#171717] px-2 py-1 text-[11px] text-zinc-300">{crmStages.map(option=><option key={option.id} value={option.id}>{option.label}</option>)}</select></div>{item.crm?.nextFollowUp && <p className={`mt-2 text-[11px] ${item.crm.nextFollowUp < new Date().toISOString().slice(0,10) ? "text-amber-300" : "text-zinc-500"}`}>Follow-up: {item.crm.nextFollowUp}</p>}<button onClick={()=>deleteItem(item.id)} className="mt-2 text-[11px] text-zinc-600 hover:text-red-300">Delete</button></article>)}</div></div>)}</div> : <div className="space-y-2">{filtered.map((item)=><article key={item.id} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">{editingId===item.id ? <div className="space-y-3"><input value={editTitle} onChange={e=>setEditTitle(e.target.value)} maxLength={160} aria-label="Edit title" className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-cyan-200/40"/><textarea value={editDetail} onChange={e=>setEditDetail(e.target.value)} maxLength={2000} rows={3} aria-label="Edit details" className="w-full resize-none rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-cyan-200/40"/>{section === "crm" && <div className="grid grid-cols-2 gap-2"><input value={editCrm.company || ""} onChange={e=>setEditCrm(v=>({...v,company:e.target.value}))} placeholder="Company" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs"/><input value={editCrm.email || ""} onChange={e=>setEditCrm(v=>({...v,email:e.target.value}))} placeholder="Email" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs"/><input value={editCrm.phone || ""} onChange={e=>setEditCrm(v=>({...v,phone:e.target.value}))} placeholder="Phone" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs"/><input type="number" min="0" value={editCrm.dealValue ?? ""} onChange={e=>setEditCrm(v=>({...v,dealValue:e.target.value ? Number(e.target.value) : null}))} placeholder="Deal value (SEK)" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs"/><select value={editCrm.stage || "lead"} onChange={e=>setEditCrm(v=>({...v,stage:e.target.value}))} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs"><option value="lead">Lead</option><option value="contacted">Contacted</option><option value="qualified">Qualified</option><option value="proposal">Proposal</option><option value="won">Won</option><option value="lost">Lost</option></select><input type="date" value={editCrm.nextFollowUp || ""} onChange={e=>setEditCrm(v=>({...v,nextFollowUp:e.target.value}))} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs"/></div>}<div className="flex justify-end gap-2"><button onClick={()=>setEditingId(null)} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300"><X size={14}/></button><button disabled={saving||!editTitle.trim()} onClick={()=>void saveEdit(item.id)} className="flex items-center gap-1 rounded-lg bg-cyan-200 px-3 py-2 text-xs font-semibold text-slate-950 disabled:opacity-40"><Check size={14}/> Save</button></div></div> : <div className="flex items-center justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-sm font-medium">{item.title}</h3><p className="mt-1 truncate text-xs text-zinc-500">{item.detail}</p>{section === "crm" && item.crm && <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-zinc-400">{item.crm.company && <span>{item.crm.company}</span>}{item.crm.email && <span>{item.crm.email}</span>}{typeof item.crm.dealValue === "number" && <span>{item.crm.dealValue.toLocaleString()} SEK</span>}{item.crm.nextFollowUp && <span>Follow-up: {item.crm.nextFollowUp}</span>}</div>}</div><div className="flex shrink-0 items-center gap-2"><span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-zinc-400">{item.status}</span><button aria-label={`Edit ${item.title}`} onClick={()=>beginEdit(item)} className="rounded-lg p-2 text-zinc-500 hover:bg-white/10 hover:text-white"><Pencil size={15}/></button><button aria-label={`Delete ${item.title}`} onClick={()=>deleteItem(item.id)} className="rounded-lg p-2 text-zinc-500 hover:bg-red-500/10 hover:text-red-300"><Trash2 size={15}/></button></div></div>}</article>)}
          {!ready && <div className="py-10 text-center text-sm text-zinc-500">Loading workspace…</div>}
          {ready && filtered.length===0 && <div className="rounded-xl border border-dashed border-white/10 px-4 py-12 text-center text-sm text-zinc-500">{query ? "No matching records." : "Nothing here yet. Add your first record."}</div>}{section !== "crm" && </div>}</>}
        </section>
        <aside className="h-fit rounded-2xl border border-white/10 bg-white/[0.025] p-5"><h2 className="mb-4 font-medium">Add {data.singular}</h2><form onSubmit={addItem} className="space-y-3"><label className="block text-xs text-zinc-400">Name<input required value={title} onChange={(e)=>setTitle(e.target.value)} placeholder={section==="crm"?"Contact or company name":section==="agents"?"Agent name":`New ${data.singular} name`} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none focus:border-white/30"/></label><label className="block text-xs text-zinc-400">Details<textarea value={detail} onChange={(e)=>setDetail(e.target.value)} rows={3} placeholder="Add context, goals, or notes..." className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none focus:border-white/30"/></label>{section === "crm" && <div className="space-y-3 border-t border-white/10 pt-3"><p className="text-xs font-medium text-zinc-300">Deal details</p><input value={crmCompany} onChange={e=>setCrmCompany(e.target.value)} placeholder="Company name" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm"/><input type="email" value={crmEmail} onChange={e=>setCrmEmail(e.target.value)} placeholder="Email address" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm"/><input value={crmPhone} onChange={e=>setCrmPhone(e.target.value)} placeholder="Phone number" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm"/><input type="number" min="0" value={crmValue} onChange={e=>setCrmValue(e.target.value)} placeholder="Deal value (SEK)" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm"/><select value={crmStage} onChange={e=>setCrmStage(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white"><option value="lead">Lead</option><option value="contacted">Contacted</option><option value="qualified">Qualified</option><option value="proposal">Proposal</option><option value="won">Won</option><option value="lost">Lost</option></select><label className="block text-xs text-zinc-400">Next follow-up<input type="date" value={crmFollowUp} onChange={e=>setCrmFollowUp(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white"/></label></div>}<button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-zinc-200 disabled:opacity-50"><Plus size={16}/> {saving ? "Saving…" : `Add ${data.singular}`}</button></form>{notice&&<p role="status" className="mt-3 text-xs text-emerald-300">{notice}</p>}<p className="mt-5 text-xs leading-5 text-zinc-600">Records sync through the authenticated server API to your Supabase database.</p></aside>
      </div>
    </div>
  </div>;
}
