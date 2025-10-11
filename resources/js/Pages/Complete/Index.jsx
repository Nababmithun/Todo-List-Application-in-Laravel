import { useEffect, useState } from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout.jsx";
import { api } from "../../utils/apiClient.js";

export default function CompleteIndex() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ today_completed: 0, upcoming_count: 0 });
  const [showLists, setShowLists] = useState(false);
  const [todayTasks, setTodayTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);

  async function loadStats() {
    const r = await api.get("/api/tasks-stats");
    setStats(r.data);
  }

  async function loadTodayList() {
    // Today completed list
    const today = new Date();
    const y = today.toISOString().slice(0,10);
    const r = await api.get("/api/tasks", { params: { is_completed: true, date_from: y, date_to: y, per_page: 100 } });
    setTodayTasks(r.data.data || []);
  }

  async function loadUpcomingList() {
    // upcoming pending list (>= today)
    const today = new Date().toISOString().slice(0,10);
    const r = await api.get("/api/tasks", { params: { is_completed: false, date_from: today, per_page: 100 } });
    setUpcomingTasks(r.data.data || []);
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/login'; return; }
    (async () => {
      setLoading(true);
      await loadStats();
      setLoading(false);
    })();
  }, []);

  async function expand() {
    setShowLists(!showLists);
    if (!showLists) {
      await Promise.all([loadTodayList(), loadUpcomingList()]);
    }
  }

  return (
    <AppLayout>
      <Head title="Complete Task" />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Complete Task</h1>
        <button className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600" onClick={expand}>
          {showLists ? "Hide Details" : "Show Details"}
        </button>
      </div>

      {loading ? (
        <div className="min-h-[120px] flex items-center justify-center">
          <div className="h-6 w-6 mr-3 rounded-full border-2 border-slate-500 border-t-transparent animate-spin" />
          Loading stats…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-800/70 rounded-2xl shadow p-4">
              <div className="text-sm opacity-70">Today Completed</div>
              <div className="text-2xl font-semibold">{stats.today_completed}</div>
            </div>
            <div className="bg-slate-800/70 rounded-2xl shadow p-4">
              <div className="text-sm opacity-70">Upcoming</div>
              <div className="text-2xl font-semibold">{stats.upcoming_count}</div>
            </div>
          </div>

          {showLists && (
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="bg-slate-800/70 rounded-2xl p-4">
                <div className="font-semibold mb-2">Today Completed</div>
                {todayTasks.length === 0 ? (
                  <div className="opacity-70 text-sm">No completed tasks today.</div>
                ) : (
                  <ul className="space-y-2">
                    {todayTasks.map(t => (
                      <li key={t.id} className="flex items-center justify-between bg-slate-800/60 rounded-xl px-4 py-3">
                        <Link href={`/tasks/${t.id}`} className="font-medium line-through opacity-70">{t.title}</Link>
                        <div className="text-xs opacity-70">{t.category || "—"} • {t.priority}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="bg-slate-800/70 rounded-2xl p-4">
                <div className="font-semibold mb-2">Upcoming (Pending)</div>
                {upcomingTasks.length === 0 ? (
                  <div className="opacity-70 text-sm">No upcoming pending tasks.</div>
                ) : (
                  <ul className="space-y-2">
                    {upcomingTasks.map(t => (
                      <li key={t.id} className="flex items-center justify-between bg-slate-800/60 rounded-xl px-4 py-3">
                        <Link href={`/tasks/${t.id}`} className="font-medium">{t.title}</Link>
                        <div className="text-xs opacity-70">
                          Due: {t.due_date?.slice(0,10) || "—"} • {t.category || "—"} • {t.priority}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}
