import { useEffect } from "react";
import useSound from "../hooks/useSound";

export default function SoundController() {
  const playSound = useSound();

  useEffect(() => {
    function handleClick(event) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const control = target.closest("button, a, [role='button'], input[type='radio'], input[type='checkbox']");
      if (!control || control.getAttribute("aria-disabled") === "true") return;
      if (("disabled" in control && control.disabled) || control.dataset.soundOff === "true") return;

      playSound(control.dataset.sound || "click");
    }

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [playSound]);

  return null;
}
