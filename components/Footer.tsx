import {
  Brain,
  Mail,
  Globe,
  Building2,
  Share2,
} from "lucide-react";

const links = [
  {
    title: "Product",
    items: ["Features", "Pricing", "AI", "Dashboard"],
  },
  {
    title: "Resources",
    items: ["Documentation", "API", "Support", "Blog"],
  },
  {
    title: "Company",
    items: ["About", "Careers", "Contact", "Privacy"],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#09090B]">
      <div className="mx-auto max-w-7xl px-8 py-20">
        <div className="grid gap-14 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400">
                <Brain className="h-6 w-6 text-black" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">
                  AI Company OS
                </h2>

                <p className="text-sm text-zinc-500">
                  The operating system for modern businesses.
                </p>
              </div>
            </div>

            <p className="mt-8 max-w-md leading-8 text-zinc-400">
              Manage your company, employees, AI assistants,
              analytics and workflows from one intelligent platform.
            </p>

            <div className="mt-8 flex items-center gap-4">
              <button className="rounded-xl border border-white/10 bg-white/5 p-3 transition hover:border-amber-400/40">
                <Globe className="h-5 w-5 text-zinc-300" />
              </button>

              <button className="rounded-xl border border-white/10 bg-white/5 p-3 transition hover:border-amber-400/40">
                <Building2 className="h-5 w-5 text-zinc-300" />
              </button>

              <button className="rounded-xl border border-white/10 bg-white/5 p-3 transition hover:border-amber-400/40">
                <Share2 className="h-5 w-5 text-zinc-300" />
              </button>

              <button className="rounded-xl border border-white/10 bg-white/5 p-3 transition hover:border-amber-400/40">
                <Mail className="h-5 w-5 text-zinc-300" />
              </button>
            </div>
          </div>

          {links.map((group) => (
            <div key={group.title}>
              <h3 className="mb-6 text-lg font-semibold text-white">
                {group.title}
              </h3>

              <div className="space-y-4">
                {group.items.map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="block text-zinc-400 transition hover:text-white"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-sm text-zinc-500">
            © 2026 AI Company OS. All rights reserved.
          </p>

          <p className="text-sm text-zinc-500">
            Built with Next.js, Tailwind CSS & AI.
          </p>
        </div>
      </div>
    </footer>
  );
}