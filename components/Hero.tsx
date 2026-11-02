import Link from "next/link";
import Navbar from "./Navbar";
import LogoCloud from "./LogoCloud";
import Features from "./Features";
import Testimonials from "./Testimonials";
import Pricing from "./Pricing";
import DashboardPreview from "./DashboardPreview";

export default function Hero() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#09090B] text-white">
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-20 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-white/[0.04] blur-[180px]" />
          <div className="absolute -left-32 bottom-0 h-[400px] w-[400px] rounded-full bg-orange-400/[0.03] blur-[160px]" />
          <div className="absolute -right-32 top-0 h-[400px] w-[400px] rounded-full bg-amber-300/[0.03] blur-[160px]" />
        </div>
        <Navbar />
        <div className="relative z-20 mx-auto flex min-h-[82vh] max-w-7xl items-center justify-between px-8">
          <div className="max-w-2xl">
            <span className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-zinc-300 backdrop-blur-xl">Built for modern companies</span>
            <h1 className="mt-8 text-6xl font-black leading-none md:text-8xl">Your AI<br />Workforce.</h1>
            <p className="mt-8 text-xl leading-9 text-zinc-400">One intelligent platform that manages your employees, meetings, sales, documents and AI assistants in one place.</p>
            <div className="mt-12 flex flex-wrap gap-5">
              <Link href="/sign-up" className="rounded-full bg-white px-8 py-4 font-semibold text-black transition hover:scale-105">Start Free</Link>
              <a href="#contact" className="rounded-full border border-white/10 bg-white/5 px-8 py-4 backdrop-blur-xl transition hover:bg-white/10">Book Demo</a>
            </div>
          </div>
          <div className="hidden lg:block"><div className="w-[520px] rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-3xl">
            <div className="mb-6 flex items-center justify-between"><h2 className="text-lg font-semibold">AI Dashboard</h2><div className="rounded-full bg-emerald-500/20 px-4 py-1 text-sm text-emerald-400">Online</div></div>
            <div className="space-y-4"><div className="rounded-2xl bg-white/5 p-5"><p className="text-sm text-zinc-500">Revenue</p><h3 className="mt-2 text-3xl font-bold">$248,920</h3></div><div className="rounded-2xl bg-white/5 p-5"><p className="text-sm text-zinc-500">AI Tasks Completed</p><h3 className="mt-2 text-3xl font-bold">18,420</h3></div><div className="rounded-2xl bg-white/5 p-5"><p className="text-sm text-zinc-500">Active Employees</p><h3 className="mt-2 text-3xl font-bold">146</h3></div></div>
          </div></div>
        </div>
      </section>
      <div id="features"><LogoCloud /><Features /></div>
      <Testimonials />
      <div id="pricing"><Pricing /></div>
      <div id="solutions"><DashboardPreview /></div>
      <footer id="contact" className="border-t border-white/10 bg-[#09090B] px-8 py-12 text-center text-sm text-zinc-500">Want a walkthrough? <a className="text-white underline" href="mailto:alialrawi2009@gmail.com?subject=AI%20Company%20OS%20demo">Contact us by email</a></footer>
    </>
  );
}