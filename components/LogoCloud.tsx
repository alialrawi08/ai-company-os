import {
  Brain,
  Building2,
  Briefcase,
  Cpu,
  Database,
  Globe,
} from "lucide-react";

const companies = [
  { name: "OpenAI", icon: Brain },
  { name: "Microsoft", icon: Building2 },
  { name: "Google", icon: Globe },
  { name: "Meta", icon: Cpu },
  { name: "Amazon", icon: Database },
  { name: "Stripe", icon: Briefcase },
];

export default function LogoCloud() {
  return (
    <section className="border-y border-white/10 bg-[#09090B] py-16">
      <div className="mx-auto max-w-7xl px-8">
        <p className="mb-10 text-center text-sm uppercase tracking-[0.3em] text-zinc-500">
          Trusted Technologies
        </p>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
          {companies.map(({ name, icon: Icon }) => (
            <div
              key={name}
              className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition duration-300 hover:border-amber-400/30 hover:bg-white/[0.06]"
            >
              <Icon className="mb-3 h-8 w-8 text-zinc-300" />
              <span className="text-sm font-medium text-zinc-400">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}