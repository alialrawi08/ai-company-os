"use client";

import { DollarSign, Users, Briefcase, TrendingUp } from "lucide-react";

import StatCard from "./StatCard";
import RevenueChart from "./RevenueChart";
import AIChatCard from "./AIChatCard";
import TeamCard from "./TeamCard";
import ActivityCard from "./ActivityCard";
import CalendarCard from "./CalendarCard";

export default function DashboardPreview() {
  return (
    <section className="mx-auto mt-20 max-w-7xl px-6">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Revenue"
          value="$41K"
          change="+28%"
          icon={DollarSign}
        />

        <StatCard
          title="Customers"
          value="1,284"
          change="+12%"
          icon={Users}
        />

        <StatCard
          title="Projects"
          value="86"
          change="+7%"
          icon={Briefcase}
        />

        <StatCard
          title="Growth"
          value="18.2%"
          change="+3.4%"
          icon={TrendingUp}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>

        <AIChatCard />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <TeamCard />
        <ActivityCard />
        <CalendarCard />
      </div>
    </section>
  );
}