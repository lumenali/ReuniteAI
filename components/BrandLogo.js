/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

export default function BrandLogo({
  className = "",
  fallbackClassName = "font-bold text-slate-50",
  variant = "wordmark"
}) {
  const [failed, setFailed] = useState(false);
  const mark = variant === "mark";

  if (failed) {
    return <span className={fallbackClassName}>ReuniteAI</span>;
  }

  return (
    <img
      src={mark ? "/brand/logo-mark.png" : "/brand/logo-wordmark.png"}
      alt={mark ? "ReuniteAI mark" : "ReuniteAI"}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
