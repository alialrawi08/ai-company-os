"use client";

import { useEffect, useState } from "react";
import { Orbit } from "lucide-react";

export default function GlobalAraskoEye() {
  const [look, setLook] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let frame = 0;
    const move = (event: MouseEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const nx = (event.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2;
        const ny = (event.clientY / Math.max(window.innerHeight, 1) - 0.5) * 2;
        setLook({
          x: Math.max(-1, Math.min(1, nx)) * 13,
          y: Math.max(-1, Math.min(1, ny)) * 8,
        });
      });
    };
    const reset = () => setLook({ x: 0, y: 0 });
    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("blur", reset);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("blur", reset);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed left-1/2 top-[82px] z-[45] hidden -translate-x-1/2 md:block">
      <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-[radial-gradient(circle_at_34%_24%,rgba(255,255,255,.38),rgba(145,150,165,.14)_45%,rgba(5,6,9,.96)_78%)] shadow-[0_8px_30px_rgba(0,0,0,.48),0_0_24px_rgba(220,225,235,.14),inset_0_1px_9px_rgba(255,255,255,.2)] backdrop-blur-xl">
        <div className="absolute inset-[-5px] rounded-full border border-white/[.12]" />
        <div className="absolute inset-[-9px] rounded-full border border-dashed border-white/[.10]" />
        <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-black/45 text-zinc-100 shadow-inner">
          <div className="absolute h-3 w-3 rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff,#aeb4c2_42%,#333946_78%)] shadow-[0_0_10px_rgba(255,255,255,.45)] transition-transform duration-100 ease-out" style={{ transform: `translate3d(${look.x}px, ${look.y}px, 0)` }} />
          <Orbit size={17} strokeWidth={1.2} className="relative opacity-80" style={{ transform: `translate3d(${look.x * .42}px, ${look.y * .42}px, 0)`, transition: "transform 100ms ease-out" }} />
        </div>
      </div>
    </div>
  );
}
