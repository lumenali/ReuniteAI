import { useEffect } from "react";

export default function Toast({ message, tone = "info", onClose }) {
  useEffect(() => {
    if (!message || !onClose) return undefined;
    const timer = window.setTimeout(onClose, 3200);
    return () => window.clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const tones = {
    info: "before:bg-red-500",
    success: "before:bg-white/45",
    warning: "before:bg-red-500",
    danger: "before:bg-red-500"
  };

  return (
    <div className={["toast", tones[tone] || tones.info].join(" ")} role="status" aria-live="polite">
      <p>{message}</p>
      {onClose ? (
        <button type="button" onClick={onClose} aria-label="Dismiss notification">
          Dismiss
        </button>
      ) : null}
    </div>
  );
}
