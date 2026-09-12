import {
  Brain,
  Users,
  BarChart3,
  Calendar,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Assistant",
    description:
      "Automate tasks, answer questions and help your team work faster.",
  },
  {
    icon: Users,
    title: "Employee Management",
    description:
      "Manage employees, permissions and departments from one dashboard.",
  },
  {
    icon: BarChart3,
    title: "Business Analytics",
    description:
      "Track revenue, performance and important KPIs in real time.",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description:
      "Organize meetings, reminders and daily workflows effortlessly.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise Security",
    description:
      "Protect your business with secure authentication and encrypted data.",
  },
  {
    icon: Sparkles,
    title: "AI Automation",
    description:
      "Let AI complete repetitive work while your team focuses on growth.",
  },
];

export default function Features() {
  return (
    <section className="bg-[#09090B] py-24">
      <div className="mx-auto max-w-7xl px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-amber-400">
            Features
          </p>

          <h2 className="text-4xl font-bold text-white md:text-5xl">
            Everything your company needs.
          </h2>

          <p className="mt-6 text-lg text-zinc-400">
            A modern operating system powered by AI to manage your business
            from one place.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition-all duration-300 hover:-translate-y-2 hover:border-amber-400/40 hover:bg-white/[0.06]"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10">
                <Icon className="h-7 w-7 text-amber-400" />
              </div>

              <h3 className="mb-4 text-2xl font-semibold text-white">
                {title}
              </h3>

              <p className="leading-8 text-zinc-400">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}