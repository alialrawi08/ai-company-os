import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "CEO, NovaTech",
    text: "This platform completely transformed how our company operates. The AI saves us hours every day.",
  },
  {
    name: "Michael Chen",
    role: "Operations Manager",
    text: "Beautiful interface, powerful automation, and everything is finally in one place.",
  },
  {
    name: "Emma Williams",
    role: "Founder, Growth Labs",
    text: "The best investment we've made this year. Our team's productivity increased immediately.",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-[#09090B] py-24">
      <div className="mx-auto max-w-7xl px-8">
        <div className="mb-16 text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-amber-400">
            Testimonials
          </p>

          <h2 className="text-4xl font-bold text-white md:text-5xl">
            Loved by modern teams.
          </h2>

          <p className="mt-6 text-lg text-zinc-400">
            Companies trust our AI platform to simplify work and accelerate
            growth.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition-all duration-300 hover:-translate-y-2 hover:border-amber-400/40 hover:bg-white/[0.06]"
            >
              <div className="mb-6 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              <p className="leading-8 text-zinc-300">
                "{item.text}"
              </p>

              <div className="mt-8">
                <h3 className="font-semibold text-white">
                  {item.name}
                </h3>

                <p className="text-sm text-zinc-500">
                  {item.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}