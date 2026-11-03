"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Bot, FolderKanban, Users, FileText, Settings, UsersRound, PhoneCall } from "lucide-react";

const menuItems = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "AI Assistant", href: "/dashboard/ai", icon: Bot },
  { title: "Arasko", href: "/dashboard/arasko", icon: PhoneCall },
  { title: "AI Agents", href: "/dashboard/agents", icon: UsersRound },
  { title: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { title: "CRM", href: "/dashboard/crm", icon: Users },
  { title: "Documents", href: "/dashboard/documents", icon: FileText },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  return <aside className="flex min-h-screen w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950">
    <Link href="/dashboard" className="border-b border-zinc-800 px-5 py-6"><h1 className="text-xl font-bold tracking-tight text-white">AF QELVION</h1><p className="mt-1 text-xs text-zinc-500">AI operating system</p></Link>
    <nav className="flex-1 space-y-1 p-3">{menuItems.map(({title,href,icon:Icon})=>{const active=pathname===href || (href!=="/dashboard" && pathname.startsWith(href+"/"));return <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active?"bg-white text-black":"text-zinc-400 hover:bg-zinc-900 hover:text-white"}`}><Icon size={18}/><span>{title}</span></Link>;})}</nav>
    <div className="border-t border-zinc-800 p-4"><p className="text-xs text-zinc-600">AF QELVION · Workspace</p></div>
  </aside>;
}