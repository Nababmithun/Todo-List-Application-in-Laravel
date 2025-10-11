import { useEffect, useState } from "react";
import { Link, Head } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout.jsx";
import { api } from "../../utils/apiClient.js";
import TaskForm from "../../Components/TaskForm.jsx";
import Toast from "../../Components/Toast.jsx";
// (Optional) যদি ProfileCard ইউজ করো: import ProfileCard from "../../Components/ProfileCard.jsx";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [stats, setStats] = useState({ today_completed: 0, upcoming_count: 0 });
  const [toast, setToast] = useState({ type: "success", message: "" });

  async function fetchList(page = 1) {
    setLoading(true);
    const res = await api.get(`/api/tasks`, {
      params: {
        per_page: 10,
        page,
        q,
        category,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      },
    });
    setItems(res.data.data);
    setMeta(res.data.meta || null);
    setLoading(false);
  }

  async function fetchStats() {
    try {
      const r = await api.get("/api/tasks-stats");
      setStats(r.data);
    } catch {}
  }

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      if (typeof window !== "undefined") window.location.href = "/login";
      return;
    }
    (async () => {
      await Promise.all([fetchList(), fetchStats()]);
    })();
  }, []);

  async function createTask(data) {
    try {
      await api.post("/api/tasks", data);
      setToast({ type: "success", message: "Task created!" });
      await Promise.all([fetchList(meta?.current_page || 1), fetchStats()]);
    } catch (e) {
      const msg = e?.response?.data?.message || "Create failed";
      setToast({ type: "error", message: msg });
      if (e?.response?.status === 422) {
        console.error("Validation errors:", e.response.data.errors);
        alert("Validation error: " + JSON.stringify(e.response.data.errors));
      }
    }
  }

  async function toggle(id) {
    await api.patch(`/api/tasks/${id}/toggle-complete`);
    await Promise.all([fetchList(meta?.current_page || 1), fetchStats()]);
  }

  async function remove(id) {
    if (!confirm("Delete this task?")) return;
    await api.delete(`/api/tasks/${id}`);
    await Promise.all([fetchList(), fetchStats()]);
  }

  return (
    <AppLayout>
      <Head title="Tasks" />
      <Toast {...toast} onClose={() => setToast({ type: "success", message: "" })} />

      {/* (Optional) <ProfileCard user={me} /> */}

      {/* Stats */}
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

      {/* Create */}
      <div className="bg-slate-800/70 rounded-2xl shadow p-4 mb-6 mt-4">
        <h2 className="text-lg font-semibold mb-3">Create Task</h2>
        <TaskForm onSubmit={createTask} submitLabel="Create" />
      </div>

      {/* Filters */}
      <div className="bg-slate-800/70 rounded-2xl shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
          <input
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 md:col-span-2"
            placeholder="Search..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        <select
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All categories</option>
            <option>Work</option>
            <option>Personal</option>
            <option>Study</option>
            <option>Other</option>
          </select>
          <input
            type="date"
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <input
            type="date"
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
            onClick={() => fetchList()}
          >
            Apply
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600"
            onClick={() => {
              setQ(""); setCategory(""); setDateFrom(""); setDateTo(""); fetchList(1);
            }}
          >
            Reset
          </button>
          <Link href="/profile" className="ml-auto text-sm px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700">
            Open Profile
          </Link>
        </div>

        {/* List */}
        <div className="mt-4">
          {loading ? (
            <div className="min-h-[120px] flex items-center justify-center text-slate-300">
              <div className="h-6 w-6 mr-3 rounded-full border-2 border-slate-500 border-t-transparent animate-spin" />
              Loading tasks…
            </div>
          ) : (
            <ul className="space-y-2">
              {items.map((t) => (
                <li key={t.id} className="flex items-center gap-3 justify-between bg-slate-800/60 rounded-xl px-4 py-3">
                  <div className="space-y-1">
                    <Link href={`/tasks/${t.id}`} className={`font-medium ${t.is_completed ? "line-through opacity-70" : ""}`}>
                      {t.title}
                    </Link>
                    <div className="text-xs opacity-70">
                      Cat: {t.category || "—"} • Priority: {t.priority} • Due: {t.due_date?.slice(0,10) || "—"} • Remind: {t.remind_at?.slice(0,16) || "—"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500" onClick={() => toggle(t.id)}>
                      {t.is_completed ? "Mark Incomplete" : "Mark Complete"}
                    </button>
                    <button className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500" onClick={() => remove(t.id)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
              {items.length === 0 && <div className="opacity-70">No tasks</div>}
            </ul>
          )}

          {meta && (
            <div className="flex gap-2 mt-4">
              <button
                className="px-3 py-2 rounded-lg bg-slate-700"
                disabled={meta.current_page <= 1}
                onClick={() => fetchList(meta.current_page - 1)}
              >
                Prev
              </button>
              <div className="px-3 py-2 rounded-lg bg-slate-700">
                Page {meta.current_page} / {meta.last_page}
              </div>
              <button
                className="px-3 py-2 rounded-lg bg-slate-700"
                disabled={meta.current_page >= meta.last_page}
                onClick={() => fetchList(meta.current_page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
