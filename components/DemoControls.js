import Link from "next/link";
import { useState } from "react";
import WarningBanner from "./WarningBanner";

export default function DemoControls({ onDemoLoaded, onMatchesLoaded }) {
  const [loading, setLoading] = useState("");
  const [message, setMessage] = useState("");

  async function loadDemo() {
    setLoading("demo");
    setMessage("");
    try {
      const response = await fetch("/api/reset-demo", { method: "POST" });
      const data = await response.json();
      setMessage(data.message || "Synthetic demo data loaded.");
      onDemoLoaded?.(data.reports || []);
    } catch (error) {
      setMessage("Demo data could not be loaded. Please try again.");
    } finally {
      setLoading("");
    }
  }

  async function runMatching() {
    setLoading("matching");
    setMessage("");
    try {
      const response = await fetch("/api/match");
      const data = await response.json();
      setMessage(data.message || "Possible leads loaded for human review.");
      onMatchesLoaded?.(data.matches || []);
    } catch (error) {
      setMessage("No possible leads yet. Add reports or load demo data.");
    } finally {
      setLoading("");
    }
  }

  return (
    <section className="panel p-4" aria-labelledby="demo-controls-heading">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="small-caps">Demo controls</p>
          <h2 id="demo-controls-heading" className="mt-1 text-lg font-bold text-slate-50">
            Start demo flow
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Load data, submit a sample report, open the queue.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn-secondary" onClick={loadDemo} disabled={loading === "demo"}>
            {loading === "demo" ? "Loading..." : "Load Synthetic Demo Data"}
          </button>
          <button
            type="button"
            className="btn-caution"
            onClick={runMatching}
            disabled={loading === "matching"}
          >
            {loading === "matching" ? "Running..." : "Run Matching"}
          </button>
          <Link href="/submit" className="btn-secondary no-underline">
            Submit Sample Report
          </Link>
          <Link href="/matches" className="btn-primary no-underline">
            View Lead Queue
          </Link>
        </div>
      </div>
      {message ? (
        <div className="mt-4">
          <WarningBanner variant="info">{message}</WarningBanner>
        </div>
      ) : null}
    </section>
  );
}
