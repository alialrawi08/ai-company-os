"use client";

import { Calendar } from "lucide-react";
import { motion } from "framer-motion";

const events = [
  {
    title: "Team Meeting",
    time: "09:00 AM",
  },
  {
    title: "Client Call",
    time: "01:30 PM",
  },
  {
    title: "Project Review",
    time: "04:00 PM",
  },
];

export default function CalendarCard() {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-3xl"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-2xl bg-white/5 p-3">
          <Calendar className="h-6 w-6 text-white" />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">
            Today's Schedule
          </h3>
          <p className="text-sm text-zinc-400">
            Upcoming events
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.title}
            className="flex items-center justify-between rounded-2xl bg-white/5 p-4"
          >
            <div>
              <p className="font-medium text-white">{event.title}</p>
              <p className="text-sm text-zinc-400">{event.time}</p>
            </div>

            <div className="h-2 w-2 rounded-full bg-amber-400" />
          </div>
        ))}
      </div>
    </motion.div>
  );
}