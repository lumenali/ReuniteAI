import Layout from "../components/Layout";
import ReportForm from "../components/ReportForm";

export default function SubmitReportPage() {
  return (
    <Layout title="Submit Report">
      <div className="mx-auto grid max-w-6xl gap-3 pb-8">
        <div className="flex items-end justify-between gap-3">
          <div>
          <p className="small-caps">Intake console</p>
          <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-slate-50">Reports</h1>
          </div>
        </div>
        <ReportForm />
      </div>
    </Layout>
  );
}
