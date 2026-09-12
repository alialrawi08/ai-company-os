"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  FolderKanban,
  Users,
  FileText,
  Settings,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "AI Assistant",
    href: "/dashboard/ai",
    icon: Bot,
  },
  {
    title: "Projects",
    href: "#",
    icon: FolderKanban,
  },
  {
    title: "CRM",
    href: "#",
    icon: Users,
  },
  {
    title: "Documents",
    href: "#",
    icon: FileText,
  },
  {
    title: "Settings",
    href: "#",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex min-h-screen w-72 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950">
      <div className="border-b border-zinc-800 px-6 py-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          AI Company OS
        </h1>

        <p className="mt-1 text-sm text-zinc-400">
          Intelligent Workspace
        </p>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.title}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-white text-black shadow-lg"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <Icon size={20} strokeWidth={2} />

              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 p-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="font-semibold text-white">
            AI Company OS
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Version 1.0.0
          </p>
        </div>
      </div>
    </aside>
  );
}