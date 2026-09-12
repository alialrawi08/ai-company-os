"use client";

import { Bot } from "lucide-react";
import { motion } from "framer-motion";

export default function AIChatCard() {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-3xl"
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-2xl bg-amber-500/10 p-3">
          <Bot className="h-6 w-6 text-amber-400" />
        </div>

        <div>
          <h3 className="font-semibold text-white">
            AI Assistant
          </h3>

          <p className="text-sm text-zinc-400">
            Online
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="max-w-[85%] rounded-2xl bg-white/5 p-3 text-sm text-zinc-300">
          Good morning 👋
        </div>

        <div className="ml-auto max-w-[85%] rounded-2xl bg-amber-500 px-3 py-2 text-sm text-black">
          Show today's revenue
        </div>

        <div className="max-w-[85%] rounded-2xl bg-white/5 p-3 text-sm text-zinc-300">
          Revenue increased by 28% compared to yesterday.
        </div>
      </div>
    </motion.div>
  );
}