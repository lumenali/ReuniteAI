export const failureModes = [
  {
    failureMode: "False match",
    harmed: "Families may receive false hope, panic, or misinformation.",
    mitigation:
      "Every result is labeled as a lead, not confirmation. The app shows evidence, conflicts, and missing information. Human review is required before action."
  },
  {
    failureMode: "Missed match",
    harmed: "A real lead may be overlooked.",
    mitigation:
      "Low-confidence leads remain visible, missing fields are shown, and reviewers are encouraged to request more information instead of ignoring uncertain reports."
  },
  {
    failureMode: "Privacy exposure",
    harmed: "Survivors, children, or vulnerable people could be located by unsafe actors.",
    mitigation:
      "Phone numbers, emails, exact addresses, apartment numbers, and precise locations are redacted or hidden by default."
  },
  {
    failureMode: "Bias against names, languages, or descriptions",
    harmed:
      "People with non-Western names, unclear spellings, multilingual reports, or vague descriptions may be matched poorly.",
    mitigation:
      "The app does not rely on name alone. It compares age, broad location, time, clothing, language, and description evidence. It also explains what caused each lead."
  },
  {
    failureMode: "Over-reliance on AI",
    harmed: "Volunteers may treat suggestions as truth.",
    mitigation:
      'The UI avoids percentages, avoids "confirmed" language, repeats warnings, and requires reviewers to check a human review box.'
  },
  {
    failureMode: "Malicious misuse",
    harmed: "Someone could try to locate a vulnerable person.",
    mitigation:
      "The app hides precise locations by default, redacts contact details, stores only synthetic demo data, and never auto-contacts anyone."
  },
  {
    failureMode: "AI hallucination or extraction error",
    harmed: "Reviewers may see incorrect structured fields.",
    mitigation:
      "The original redacted notes remain visible, risks are flagged, fallback rules run after AI, and reviewers must verify facts manually."
  }
];

export default function ResponsibleAIPanel({ table = false, compact = false }) {
  if (table) {
    return (
      <div className="grid gap-2">
        {failureModes.slice(0, compact ? 5 : failureModes.length).map((row) => (
          <details
            key={row.failureMode}
            className="glass-card p-2.5"
          >
            <summary className="cursor-pointer text-xs font-bold text-slate-100">{row.failureMode}</summary>
            <div className="mt-2 grid gap-2 text-xs leading-5 text-slate-300 lg:grid-cols-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-normal text-slate-500">Risk</p>
                <p className="mt-1">{row.harmed}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-normal text-slate-500">Mitigation</p>
                <p className="mt-1">{row.mitigation}</p>
              </div>
            </div>
          </details>
        ))}
      </div>
    );
  }

  return (
    <section className="mt-2" aria-labelledby="rai-panel-heading">
      <p className="small-caps">Responsible AI controls</p>
      <h2 id="rai-panel-heading" className="mt-0.5 text-base font-bold text-slate-50">
        Lead, not confirmation.
      </h2>
      <div className="mt-2 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-5">
        {[
          "No final AI decisions",
          "No percentages",
          "No auto-contact",
          "Exact locations hidden",
          "Human review required"
        ].map((item) => (
          <div key={item} className="glass-card p-2.5 text-xs font-semibold text-slate-200">
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
