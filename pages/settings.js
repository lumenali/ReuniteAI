import Link from "next/link";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import StatusPill from "../components/StatusPill";
import SystemStatusCard from "../components/SystemStatusCard";
import Toast from "../components/Toast";
import WarningBanner from "../components/WarningBanner";
import useSound, { getSoundPreference, setSoundPreference } from "../hooks/useSound";

export default function SettingsPage() {
  const [error, setError] = useState("");
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [toast, setToast] = useState(null);
  const playSound = useSound();

  useEffect(() => {
    const syncTimer = window.setTimeout(() => setSoundsEnabled(getSoundPreference()), 0);
    function syncSoundPreference(event) {
      setSoundsEnabled(Boolean(event.detail?.enabled));
    }
    window.addEventListener("reuniteai:sound-setting", syncSoundPreference);
    return () => {
      window.clearTimeout(syncTimer);
      window.removeEventListener("reuniteai:sound-setting", syncSoundPreference);
    };
  }, []);

  async function resetDemoData() {
    setError("");
    setToast(null);
    playSound("click");
    try {
      const response = await fetch("/api/reset-demo", { method: "POST" });
      const data = await response.json();
      setToast({ message: data.message || "Synthetic demo data reset.", tone: "success" });
      playSound("success");
    } catch (resetError) {
      setError("Demo data could not be reset.");
      setToast({ message: "Demo data could not be reset.", tone: "warning" });
      playSound("warning");
    }
  }

  async function clearReviews() {
    setError("");
    setToast(null);
    playSound("click");
    try {
      const response = await fetch("/api/review", { method: "DELETE" });
      const data = await response.json();
      setToast({ message: data.message || "Saved review notes cleared.", tone: "success" });
      playSound("success");
    } catch (clearError) {
      setError("Saved review notes could not be cleared.");
      setToast({ message: "Saved review notes could not be cleared.", tone: "warning" });
      playSound("warning");
    }
  }

  function toggleSounds() {
    const nextEnabled = !soundsEnabled;
    setSoundPreference(nextEnabled);
    setSoundsEnabled(nextEnabled);
    setToast({ message: `UI sounds ${nextEnabled ? "enabled" : "disabled"}.`, tone: "info" });
    if (nextEnabled) playSound("select");
  }

  return (
    <Layout title="Settings">
      <div className="grid gap-3 pb-8">
        <div>
          <p className="small-caps">Controls</p>
          <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-slate-50">Settings</h1>
        </div>

        {error ? <WarningBanner variant="danger">{error}</WarningBanner> : null}

        <div className="grid gap-3 xl:grid-cols-[0.7fr_1.3fr]">
          <section className="panel p-3" aria-labelledby="sound-settings-heading">
            <p className="small-caps">Interface</p>
            <h2 id="sound-settings-heading" className="mt-0.5 text-base font-semibold text-slate-50">
              UI sounds
            </h2>
            <div className="glass-card mt-3 flex items-center justify-between gap-3 p-3">
              <div>
                <p className="text-sm font-semibold text-slate-100">{soundsEnabled ? "Enabled" : "Muted"}</p>
                <p className="mt-1 text-xs text-slate-500">Low-volume feedback after clicks and saves.</p>
              </div>
              <button
                type="button"
                className={soundsEnabled ? "btn-primary min-h-9 px-4 py-1.5 text-xs" : "btn-secondary min-h-9 px-4 py-1.5 text-xs"}
                onClick={toggleSounds}
                aria-pressed={soundsEnabled}
              >
                {soundsEnabled ? "On" : "Off"}
              </button>
            </div>
          </section>

          <SystemStatusCard compact />
        </div>

        <div className="grid gap-3 xl:grid-cols-2">
          <section className="panel p-3" aria-labelledby="demo-settings-heading">
            <p className="small-caps">Demo controls</p>
            <h2 id="demo-settings-heading" className="mt-0.5 text-base font-semibold text-slate-50">
              Site data
            </h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button type="button" className="btn-secondary justify-start" onClick={resetDemoData}>
                Reset demo data
              </button>
              <button type="button" className="btn-secondary justify-start" onClick={clearReviews}>
                Clear reviews
              </button>
              <Link href="/submit" className="btn-primary justify-start no-underline sm:col-span-2">
                Fill sample report
              </Link>
            </div>
          </section>

          <section className="panel p-3" aria-labelledby="privacy-settings-heading">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="small-caps">Defaults</p>
                <h2 id="privacy-settings-heading" className="mt-0.5 text-base font-semibold text-slate-50">
                  Privacy controls
                </h2>
              </div>
              <StatusPill tone="slate">Restricted</StatusPill>
            </div>
            <dl className="mt-3 grid gap-2">
              <StatusLine label="Precise locations" value="Hidden" />
              <StatusLine label="Auto-contact" value="Disabled" />
              <StatusLine label="Lead status" value="Human-reviewed" />
            </dl>
          </section>
        </div>
        <Toast message={toast?.message} tone={toast?.tone} onClose={() => setToast(null)} />
      </div>
    </Layout>
  );
}

function StatusLine({ label, value }) {
  return (
    <div className="glass-card flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-semibold text-slate-200">{value}</dd>
    </div>
  );
}
