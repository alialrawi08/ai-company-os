import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import Sidebar from "@/components/dashboard/Sidebar";
import RevenueChart from "@/components/dashboard/RevenueChart";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen bg-[#09090B] text-white">
      <Sidebar />

      <section className="flex-1 p-10">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">
              Welcome, {user.firstName || "User"} 👋
            </h1>

            <p className="mt-2 text-zinc-400">
              {user.emailAddresses[0].emailAddress}
            </p>
          </div>

          <UserButton />
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-zinc-400">Projects</p>
            <h2 className="mt-3 text-3xl font-bold">12</h2>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-zinc-400">AI Requests</p>
            <h2 className="mt-3 text-3xl font-bold">2,481</h2>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-zinc-400">Team Members</p>
            <h2 className="mt-3 text-3xl font-bold">18</h2>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-zinc-400">Storage</p>
            <h2 className="mt-3 text-3xl font-bold">84%</h2>
          </div>
        </div>

        <RevenueChart />
      </section>
    </main>
  );
}