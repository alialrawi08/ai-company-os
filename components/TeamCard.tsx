"use client";

import { Users } from "lucide-react";
import { motion } from "framer-motion";

const team = [
  { name: "Sarah", role: "Designer" },
  { name: "Alex", role: "Developer" },
  { name: "Emma", role: "Marketing" },
];

export default function TeamCard() {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-3xl"
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-2xl bg-white/5 p-3">
          <Users className="h-6 w-6 text-white" />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">
            Team Members
          </h3>
          <p className="text-sm text-zinc-400">
            Active today
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {team.map((member) => (
          <div
            key={member.name}
            className="flex items-center justify-between rounded-2xl bg-white/5 p-3"
          >
            <div>
              <p className="font-medium text-white">{member.name}</p>
              <p className="text-sm text-zinc-400">{member.role}</p>
            </div>

            <div className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>
        ))}
      </div>
    </motion.div>
  );
}