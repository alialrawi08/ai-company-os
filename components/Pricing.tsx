import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$19",
    description: "Perfect for small teams getting started.",
    featured: false,
    features: [
      "Up to 5 team members",
      "AI Assistant",
      "Basic Analytics",
      "Email Support",
    ],
  },
  {
    name: "Pro",
    price: "$49",
    description: "Everything you need to grow your business.",
    featured: true,
    features: [
      "Unlimited team members",
      "Advanced AI",
      "Automation",
      "Analytics Dashboard",
      "Priority Support",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Tailored solutions for large organizations.",
    featured: false,
    features: [
      "Dedicated AI",
      "Custom Integrations",
      "SSO & Security",
      "24/7 Support",
      "Dedicated Manager",
    ],
  },
];

export default function Pricing() {
  return (
    <section className="bg-[#09090B] py-24">
      <div className="mx-auto max-w-7xl px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-amber-400">
            Pricing
          </p>

          <h2 className="text-4xl font-bold text-white md:text-5xl">
            Simple pricing for every business.
          </h2>

          <p className="mt-6 text-lg text-zinc-400">
            Choose the plan that fits your company today and scale whenever
            you're ready.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl border p-8 transition-all duration-300 hover:-translate-y-2 ${
                plan.featured
                  ? "border-amber-400 bg-white/[0.06]"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              {plan.featured && (
                <div className="absolute right-6 top-6 rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-black">
                  MOST POPULAR
                </div>
              )}

              <h3 className="text-2xl font-bold text-white">{plan.name}</h3>

              <p className="mt-3 text-zinc-400">{plan.description}</p>

              <div className="mt-8">
                <span className="text-5xl font-black text-white">
                  {plan.price}
                </span>

                {plan.price !== "Custom" && (
                  <span className="ml-2 text-zinc-500">/month</span>
                )}
              </div>

              <div className="mt-10 space-y-4">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-400" />
                    <span className="text-zinc-300">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                className={`mt-10 w-full rounded-2xl py-4 font-semibold transition ${
                  plan.featured
                    ? "bg-amber-400 text-black hover:opacity-90"
                    : "bg-white text-black hover:bg-zinc-200"
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}