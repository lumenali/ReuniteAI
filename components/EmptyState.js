import Link from "next/link";

export default function EmptyState({ title, message, actionHref, actionLabel }) {
  return (
    <div className="glass-panel px-6 py-8 text-center">
      <h2 className="text-xl font-bold text-slate-50">{title}</h2>
      <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-400">{message}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="btn-primary mt-5 no-underline">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
