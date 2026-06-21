import { useCallback } from "react";

const STORAGE_KEY = "reuniteai-ui-sounds";

const sources = {
  click: "/sounds/click.mp3",
  loading: "/sounds/loading.mp3",
  success: "/sounds/success.mp3",
  select: "/sounds/select.mp3",
  warning: "/sounds/warning.mp3"
};

let lastPlayedAt = 0;

export function getSoundPreference() {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(STORAGE_KEY) !== "off";
}

export function setSoundPreference(enabled) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
  window.dispatchEvent(new CustomEvent("reuniteai:sound-setting", { detail: { enabled } }));
}

export default function useSound() {
  return useCallback((name = "click") => {
    if (typeof window === "undefined" || !getSoundPreference()) return;

    try {
      const now = Date.now();
      if (now - lastPlayedAt < 70) return;
      lastPlayedAt = now;

      const audio = new Audio(sources[name] || sources.click);
      audio.volume = name === "loading" ? 0.08 : 0.18;
      audio.preload = "auto";
      const playPromise = audio.play();
      if (playPromise?.catch) playPromise.catch(() => {});
    } catch (error) {
      // Missing files, blocked playback, or unsupported codecs should never affect the workflow.
    }
  }, []);
}
