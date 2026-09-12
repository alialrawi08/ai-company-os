"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
} from "recharts";

const data = [
  { month: "Jan", revenue: 12000 },
  { month: "Feb", revenue: 18500 },
  { month: "Mar", revenue: 16000 },
  { month: "Apr", revenue: 24500 },
  { month: "May", revenue: 28200 },
  { month: "Jun", revenue: 33500 },
  { month: "Jul", revenue: 41200 },
];

export default function RevenueChart() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">
          Revenue
        </h2>

        <p className="text-sm text-zinc-400">
          Last 7 months
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <XAxis
              dataKey="month"
              stroke="#71717A"
              tickLine={false}
              axisLine={false}
            />

            <Tooltip />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#ffffff"
              fill="#ffffff22"
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}