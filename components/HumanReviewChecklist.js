const items = [
  "Check evidence",
  "Check conflicts",
  "Choose decision",
  "Save review"
];

export default function HumanReviewChecklist() {
  return (
    <section className="panel p-3" aria-labelledby="review-checklist-heading">
      <p className="small-caps">Review flow</p>
      <h2 id="review-checklist-heading" className="mt-0.5 text-base font-bold text-slate-50">
        Required sequence
      </h2>
      <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item} className="glass-card flex gap-2 p-2">
            <span
              className="mt-1 h-3.5 w-3.5 flex-none rounded-full bg-red-500/[0.35]"
              aria-hidden="true"
            />
            <span className="text-xs leading-5 text-slate-300">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
