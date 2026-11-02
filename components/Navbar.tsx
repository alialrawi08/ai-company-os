"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Features", href: "#features" },
  { label: "Solutions", href: "#solutions" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="relative z-30 mx-auto max-w-7xl px-6 py-6 md:px-8 md:py-8">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight md:text-2xl" onClick={() => setOpen(false)}>
          AI Company OS
        </Link>

        <div className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="transition hover:text-white">
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <Link href="/sign-in" className="rounded-full border border-white/10 bg-white/5 px-5 py-2 backdrop-blur-xl transition hover:bg-white hover:text-black">
            Login
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white md:hidden"
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {open && (
        <div id="mobile-navigation" className="absolute left-6 right-6 top-full mt-2 rounded-2xl border border-white/10 bg-[#111113] p-4 shadow-2xl md:hidden">
          <div className="flex flex-col">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/sign-in"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-black"
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
