import BrandLogo from "./BrandLogo";
import { useEffect, useState } from "react";
import useSound from "../hooks/useSound";

export default function SplashLoader() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const playSound = useSound();

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reducedMotion ? 450 : 1900;
    const fadeDuration = reducedMotion ? 80 : 280;

    playSound("loading");

    const leaveTimer = window.setTimeout(() => setLeaving(true), Math.max(0, duration - fadeDuration));
    const hideTimer = window.setTimeout(() => setVisible(false), duration);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
    };
  }, [playSound]);

  if (!visible) return null;

  return (
    <div
      className={[
        "fixed inset-0 z-[999] grid place-items-center bg-[#030305]",
        leaving ? "splash-leave" : "splash-enter"
      ].join(" ")}
      aria-hidden="true"
    >
      <div className="grid justify-items-center gap-3">
        <BrandLogo
          variant="mark"
          className="h-14 w-14 object-contain"
          fallbackClassName="text-sm font-bold text-slate-300"
        />
        <BrandLogo
          className="h-5 max-w-[132px] object-contain opacity-80"
          fallbackClassName="text-[11px] font-semibold uppercase tracking-normal text-slate-400"
        />
        <p className="text-[11px] font-medium text-slate-500">Loading case desk</p>
        <div className="h-px w-36 overflow-hidden bg-white/10">
          <div className="h-full bg-red-600 shadow-[0_0_18px_rgba(239,35,60,0.45)]" style={{ animation: "splash-progress 1.65s ease-out forwards" }} />
        </div>
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
          <span
            className="absolute left-[48%] top-[48%] h-28 w-28 rounded-full border border-red-500/10"
            style={{ animation: "splash-ring 1.9s ease-out forwards" }}
          />
        </div>
      </div>
    </div>
  );
}
