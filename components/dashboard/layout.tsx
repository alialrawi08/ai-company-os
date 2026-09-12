import Sidebar from "@/components/dashboard/Sidebar";
import type { ReactNode } from "react";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#09090B]">
      <Sidebar />

      <main className="min-w-0 flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}