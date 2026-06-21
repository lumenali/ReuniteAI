import Link from "next/link";
import { useState } from "react";
import useSound from "../hooks/useSound";
import ProcessingSummary from "./ProcessingSummary";
import Toast from "./Toast";
import WarningBanner from "./WarningBanner";

const INITIAL_FORM = {
  reportType: "Missing Person Report",
  name: "",
  age: "",
  location: "",
  dateTime: "",
  description: "",
  clothing: "",
  languages: "",
  reporterRelationship: "",
  notes: "",
  privacyLevel: "Restricted",
  sourceReliability: "Unknown"
};

const samples = {
  missing: {
    reportType: "Missing Person Report",
    name: "Omar H.",
    age: "16-17",
    location: "North Arena shelter, near bus pickup",
    dateTime: "2026-06-14T20:15",
    description: "Teen boy, short dark hair, anxious, looking for his mother.",
    clothing: "Gray hoodie, navy track pants, wet black shoes.",
    languages: "Arabic, English",
    reporterRelationship: "Family friend",
    notes:
      "Caller said Omar got separated after flood buses arrived at North Arena. He may ask for his mom in Arabic. Please call 555-123-4567 if found.",
    privacyLevel: "Restricted",
    sourceReliability: "Family or friend"
  },
  sighting: {
    reportType: "Found / Sighting Report",
    name: "Omar",
    age: "teen",
    location: "North Arena bus pickup, shelter room 12",
    dateTime: "2026-06-14T21:05",
    description: "Teen boy with short dark hair asking for his mom.",
    clothing: "Gray hoodie and wet black shoes.",
    languages: "Arabic, English",
    reporterRelationship: "Direct witness",
    notes:
      "Saw a teen named Omar near the bus pickup. He looked cold and said he was trying to find his mother. Note listed shelter room 12.",
    privacyLevel: "Restricted",
    sourceReliability: "Direct witness"
  }
};

export default function ReportForm() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState(null);
  const playSound = useSound();

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  function fillSample(kind) {
    playSound("success");
    setForm(samples[kind]);
    setErrors({});
    setMessage("");
    setToast({ message: "Demo report loaded.", tone: "success" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateForm(form);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setToast({ message: "Add a little more detail before processing.", tone: "warning" });
      playSound("warning");
      return;
    }

    setSubmitting(true);
    setMessage("");
    setToast(null);
    playSound("loading");
    try {
      const response = await fetch("/api/ai-process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setErrors(data.errors || {});
        setMessage(data.message || "Please check the report details.");
        setToast({ message: data.message || "Please check the report details.", tone: "warning" });
        playSound("warning");
        return;
      }
      setResult(data);
      setToast({ message: "Report saved. Matching can now run.", tone: "success" });
      playSound("success");
    } catch (error) {
      setMessage("AI extraction is offline. Safety redaction and rule-based matching are still active.");
      setToast({ message: "AI extraction is offline. Fallback processing is active.", tone: "warning" });
      playSound("warning");
    } finally {
      setSubmitting(false);
    }
  }

  if (result?.report) {
    return (
      <div className="grid gap-3">
        <WarningBanner variant={result.aiAvailable ? "success" : "warning"}>
          {result.message}
        </WarningBanner>
        <ProcessingSummary result={result} />
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              playSound("click");
              setForm(INITIAL_FORM);
              setResult(null);
            }}
          >
            Submit another
          </button>
          <Link href="/matches" className="btn-primary no-underline" onClick={() => playSound("click")}>
            Open lead queue
          </Link>
        </div>
        <Toast message={toast?.message} tone={toast?.tone} onClose={() => setToast(null)} />
      </div>
    );
  }

  return (
    <form className="grid gap-3" onSubmit={handleSubmit} noValidate>
      {message ? (
        <WarningBanner variant="warning" title="Processing notice">
          {message}
        </WarningBanner>
      ) : null}

      <div className="grid gap-3 xl:grid-cols-[minmax(0,0.95fr)_minmax(340px,1fr)]">
        <div className="grid gap-3">
          <Section title="Report type" eyebrow="Intake">
            <fieldset>
              <legend className="sr-only">Report type</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {["Missing Person Report", "Found / Sighting Report"].map((type) => (
                  <ReportTypeOption
                    key={type}
                    type={type}
                    checked={form.reportType === type}
                    onChange={(event) => {
                      updateField(event);
                      playSound("select");
                    }}
                  />
                ))}
              </div>
              {errors.reportType ? <ErrorText>{errors.reportType}</ErrorText> : null}
            </fieldset>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" data-sound="success" className="btn-secondary min-h-9 px-3 py-1.5 text-xs" onClick={() => fillSample("missing")}>
                Sample missing
              </button>
              <button type="button" data-sound="success" className="btn-secondary min-h-9 px-3 py-1.5 text-xs" onClick={() => fillSample("sighting")}>
                Sample sighting
              </button>
            </div>
          </Section>

          <Section title="Basic fields" eyebrow="Details">
            <div className="grid gap-2 md:grid-cols-2">
              <Field label="Name or nickname" name="name" value={form.name} onChange={updateField} />
              <Field label="Age or range" name="age" value={form.age} onChange={updateField} placeholder="14, 14-16, teen" />
              <Field label="Location" name="location" value={form.location} onChange={updateField} />
              <Field label="Date and time" name="dateTime" type="datetime-local" value={form.dateTime} onChange={updateField} />
              <Field label="Description" name="description" value={form.description} onChange={updateField} />
              <Field label="Clothing" name="clothing" value={form.clothing} onChange={updateField} />
              <Field label="Languages" name="languages" value={form.languages} onChange={updateField} placeholder="English, Spanish" />
              <Field label="Reporter relation" name="reporterRelationship" value={form.reporterRelationship} onChange={updateField} />
            </div>
          </Section>

          <Section title="Safety settings" eyebrow="Defaults">
            <div className="grid gap-2 md:grid-cols-2">
              <Select
                label="Privacy"
                name="privacyLevel"
                value={form.privacyLevel}
                onChange={updateField}
                options={["Public", "Restricted", "Private"]}
              />
              <Select
                label="Source"
                name="sourceReliability"
                value={form.sourceReliability}
                onChange={updateField}
                options={[
                  "Direct witness",
                  "Family or friend",
                  "Shelter staff",
                  "Volunteer",
                  "Social media",
                  "Unknown"
                ]}
              />
            </div>
          </Section>
        </div>

        <aside className="grid gap-3 xl:sticky xl:top-[72px] xl:self-start">
          <Section title="Messy notes" eyebrow="Source text">
            <label className="block">
              <span className="field-label">Notes</span>
              <textarea
                name="notes"
                value={form.notes}
                onChange={updateField}
                rows={6}
                className="field-input h-[150px] resize-none"
                placeholder="Paste the report text, call notes, or field message."
              />
            </label>
            {errors.notes ? <ErrorText>{errors.notes}</ErrorText> : null}
          </Section>

          <section className="glass-card p-3">
            <p className="small-caps">Processing</p>
            <div className="mt-2 grid gap-1.5 text-xs text-slate-400">
              <StatusLine label="AI extraction" value="When available" />
              <StatusLine label="Fallback rules" value="Always active" />
              <StatusLine label="Exact locations" value="Hidden when restricted" />
            </div>
          </section>
        </aside>
      </div>

      <div className="rounded-2xl border border-white/[0.095] bg-black/50 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_18px_50px_rgba(0,0,0,0.42)] backdrop-blur-2xl sm:flex sm:items-center sm:justify-between sm:gap-3">
        <p className="text-xs font-medium leading-5 text-slate-500">
          Leads stay unconfirmed until review.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2 sm:mt-0">
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? (
              <>
                <span className="busy-dot" />
                Processing
              </>
            ) : (
              "Process report"
            )}
          </button>
          <Link href="/matches" className="btn-secondary no-underline" onClick={() => playSound("click")}>
            Open lead queue
          </Link>
        </div>
      </div>
      <Toast message={toast?.message} tone={toast?.tone} onClose={() => setToast(null)} />
    </form>
  );
}

function Section({ title, eyebrow, children }) {
  return (
    <section className="panel p-2.5" aria-labelledby={`${title.replace(/\s+/g, "-").toLowerCase()}-heading`}>
      <p className="small-caps">{eyebrow}</p>
      <h2 id={`${title.replace(/\s+/g, "-").toLowerCase()}-heading`} className="mt-0.5 text-sm font-semibold text-slate-50">
        {title}
      </h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function ReportTypeOption({ type, checked, onChange }) {
  return (
    <label
      className={[
        "flex cursor-pointer items-center gap-2 rounded-xl p-2 transition-all duration-200 hover:bg-white/[0.05]",
        checked
          ? "border border-red-500/20 bg-red-500/[0.08] shadow-[inset_3px_0_0_rgba(239,35,60,0.86),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-xl"
          : "border border-white/[0.07] bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl"
      ].join(" ")}
    >
      <input
        type="radio"
        name="reportType"
        data-sound="select"
        value={type}
        checked={checked}
        onChange={onChange}
        className="mt-0"
      />
      <span className="text-xs font-semibold text-slate-100">{type === "Missing Person Report" ? "Missing" : "Sighting"}</span>
    </label>
  );
}

function Field({ label, name, value, onChange, type = "text", placeholder = "" }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input
        className="field-input"
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </label>
  );
}

function Select({ label, name, value, onChange, options }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <select className="field-input" name={name} value={value} onChange={onChange}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function StatusLine({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.07] bg-white/[0.04] px-2.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
      <span>{label}</span>
      <span className="font-semibold text-slate-200">{value}</span>
    </div>
  );
}

function ErrorText({ children }) {
  return <p className="mt-2 text-sm font-semibold text-red-200">{children}</p>;
}

function validateForm(form) {
  const errors = {};
  if (!form.reportType) errors.reportType = "Choose a report type.";
  const hasDetail = [
    form.name,
    form.age,
    form.location,
    form.dateTime,
    form.description,
    form.clothing,
    form.languages,
    form.notes
  ].some((value) => String(value || "").trim().length > 0);
  if (!hasDetail) errors.notes = "This field needs more detail before matching will be useful.";
  return errors;
}
