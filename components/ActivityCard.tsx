"use client";

import { Activity } from "lucide-react";
import { motion } from "framer-motion";

const activities = [
  {
    title: "New client signed",
    time: "5 min ago",
  },
  {
    title: "Invoice paid",
    time: "20 min ago",
  },
  {
    title: "AI generated report",
    time: "1 hour ago",
  },
];

export default function ActivityCard() {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-3xl"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-2xl bg-white/5 p-3">
          <Activity className="h-6 w-6 text-white" />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">
            Recent Activity
          </h3>
          <p className="text-sm text-zinc-400">
            Latest updates
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {activities.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl bg-white/5 p-4"
          >
            <p className="font-medium text-white">{item.title}</p>
            <p className="mt-1 text-sm text-zinc-400">{item.time}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}