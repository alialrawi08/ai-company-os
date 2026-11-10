"use client";

import { useEffect, useState } from "react";
import { Orbit } from "lucide-react";

export default function GlobalAraskoEye() {
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    let frame = 0;
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const nx = (event.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2;
        const ny = (event.clientY / Math.max(window.innerHeight, 1) - 0.5) * 2;
        setLook({ x: Math.max(-1, Math.min(1, nx)) * 7, y: Math.max(-1, Math.min(1, ny)) * 4 });
        setActive(true);
      });
    };
    const leave = () => { setLook({ x: 0, y: 0 }); setActive(false); };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("blur", leave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("blur", leave);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed left-1/2 top-[82px] z-[45] hidden -translate-x-1/2 md:block">
      <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-[radial-gradient(circle_at_34%_24%,rgba(255,255,255,.32),rgba(145,150,165,.12)_45%,rgba(5,6,9,.94)_78%)] shadow-[0_8px_30px_rgba(0,0,0,.48),0_0_24px_rgba(220,225,235,.10),inset_0_1px_9px_rgba(255,255,255,.18)] backdrop-blur-xl">
        <div className="absolute inset-[-5px] rounded-full border border-white/[.10]" />
        <div className="absolute inset-[-9px] rounded-full border border-dashed border-white/[.08]" />
        <div className="relative flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/30 text-zinc-100">
          <Orbit size={19} strokeWidth={1.25} style={{ transform: `translate3d(${look.x}px, ${look.y}px, 0)`, transition: "transform 130ms ease-out" }} />
          <span className={`absolute right-0 top-0 h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_9px_white] ${active ? "opacity-100" : "opacity-65"}`} />
        </div>
      </div>
    </div>
  );
}
