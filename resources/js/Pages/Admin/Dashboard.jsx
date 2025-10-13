import { useEffect, useState } from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout.jsx";
import { api } from "../../utils/apiClient.js";

function Card({ title, value }) {
  return (
    <div className="rounded-2xl bg-slate-800/70 border border-slate-700 p-4 shadow">
      <div className="text-xs uppercase tracking-wide text-slate-400">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [sum, setSum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");

        // 1) নিশ্চিত হও আমরা লগইনড এবং admin
        const meRes = await api.get("/api/me");
        const me = meRes.data;
        if (!me?.is_admin) {
          // admin না হলে ইউজার ড্যাশবোর্ডে পাঠাও
          window.location.href = "/tasks";
          return;
        }

        // 2) admin summary লোড করো
        const r = await api.get("/api/admin/summary");
        setSum(r.data);
      } catch (e) {
        const code = e?.response?.status;
        if (code === 401) {
          // token invalid হলে apiClient.js নিজেই /login এ পাঠাবে
          setErr("Please login again.");
        } else if (code === 403) {
          // অনুমতি নেই—ঝাঁপাঝাঁপি বন্ধ করে একটা মেসেজ দেখাই
          setErr("You are not authorized to view admin dashboard.");
        } else {
          setErr(e?.response?.data?.message || "Failed to load admin summary.");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AppLayout>
      <Head title="Admin Dashboard" />
      <h1 className="text-xl font-semibold mb-4">Admin Dashboard</h1>

      {loading && <div className="text-slate-300">Loading…</div>}

      {!loading && err && (
        <div className="rounded-lg border border-red-600/40 bg-red-600/10 text-red-300 p-3 mb-6">
          {err}
        </div>
      )}

      {!loading && !err && sum && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Card title="Users" value={sum.totals?.users ?? 0} />
            <Card title="Projects" value={sum.totals?.projects ?? 0} />
            <Card title="Tasks" value={sum.totals?.tasks ?? 0} />
            <Card title="Today Completed" value={sum.today_completed ?? 0} />
          </div>

          <div className="rounded-2xl bg-slate-800/70 border border-slate-700 p-4">
            <div className="text-sm mb-2">Shortcuts</div>
            <div className="flex flex-wrap gap-2">
              <Link href="/admin/users" className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm">
                Manage Users
              </Link>
              <Link href="/admin/projects" className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm">
                All Projects
              </Link>
              <Link href="/admin/tasks" className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm">
                All Tasks
              </Link>
              <Link href="/admin/settings" className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm">
                Settings
              </Link>
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}
