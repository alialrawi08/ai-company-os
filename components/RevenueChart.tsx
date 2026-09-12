"use client";

import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const data = [
  { month: "Jan", revenue: 12000 },
  { month: "Feb", revenue: 18000 },
  { month: "Mar", revenue: 15000 },
  { month: "Apr", revenue: 26000 },
  { month: "May", revenue: 32000 },
  { month: "Jun", revenue: 41000 },
];

export default function RevenueChart() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-zinc-400 text-sm">
            Revenue
          </p>

          <h2 className="text-3xl font-bold text-white">
            $41,000
          </h2>
        </div>

        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400">
          +28%
        </span>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>

            <Tooltip />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#f59e0b"
              strokeWidth={3}
              fill="url(#fillRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}