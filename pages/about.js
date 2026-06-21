import Layout from "../components/Layout";
import ResponsibleAIPanel from "../components/ResponsibleAIPanel";
import StatusPill from "../components/StatusPill";

export default function AboutPage() {
  return (
    <Layout title="AI & Safety">
      <div className="app-mode-calm grid gap-3 pb-8">
        <header className="panel flex items-center justify-between gap-4 p-4">
          <div>
            <p className="small-caps">AI & Safety</p>
            <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-white">
              Leads are suggestions, never confirmations.
            </h1>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Sensitive details stay restricted and decisions stay human-reviewed.
            </p>
          </div>
          <div className="hidden flex-wrap justify-end gap-2 md:flex">
            <StatusPill tone="slate">Locations hidden</StatusPill>
            <StatusPill tone="slate">Human review</StatusPill>
            <StatusPill tone="slate">No auto-contact</StatusPill>
          </div>
        </header>

        <section className="grid gap-3 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-3">
            <section className="grid gap-3 md:grid-cols-3">
              <TrustCard title="Private">
                Contact and precise location details are redacted.
              </TrustCard>
              <TrustCard title="Explainable">
                Each lead shows evidence, conflicts, and gaps.
              </TrustCard>
              <TrustCard title="Gated">
                Review notes do not confirm identity or contact anyone.
              </TrustCard>
            </section>

            <section className="panel p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="small-caps">Operating rules</p>
                  <h2 className="mt-0.5 text-base font-semibold text-slate-50">Built for cautious use</h2>
                </div>
                <StatusPill tone="green">Enabled</StatusPill>
              </div>
              <ResponsibleAIPanel />
            </section>
          </div>

          <section className="panel p-3">
            <div className="mb-2">
              <p className="small-caps">Failure modes</p>
              <h2 className="mt-0.5 text-base font-semibold text-slate-50">Reviewer checks</h2>
            </div>
            <ResponsibleAIPanel table compact />
          </section>
        </section>
      </div>
    </Layout>
  );
}

function TrustCard({ title, children }) {
  return (
    <article className="glass-card card-enter p-3 transition duration-200 hover:-translate-y-px">
      <h2 className="text-sm font-semibold text-slate-50">{title}</h2>
      <p className="mt-1 text-xs leading-5 text-slate-400">{children}</p>
    </article>
  );
}
