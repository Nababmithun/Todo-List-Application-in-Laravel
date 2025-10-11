import { useEffect, useState } from "react";
import { Link, Head } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout.jsx";
import { api } from "../../utils/apiClient.js";
import TaskForm from "../../Components/TaskForm.jsx";
import ProfileCard from "../../Components/ProfileCard.jsx";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [q, setQ] = useState("");
  const [me, setMe] = useState(null);

  async function fetchList(page=1) {
    setLoading(true);
    const res = await api.get(`/api/tasks`, { params: { per_page: 10, page, q }});
    setItems(res.data.data);
    setMeta(res.data.meta || null);
    setLoading(false);
  }

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) { if (typeof window !== 'undefined') window.location.href = '/login'; return; }
    (async () => {
      try {
        const meRes = await api.get('/api/me');
        setMe(meRes.data);
      } catch {}
      await fetchList();
    })();
  }, []);

  async function createTask(data) {
    await api.post("/api/tasks", data);
    await fetchList(meta?.current_page || 1);
  }

  async function toggle(id) {
    await api.patch(`/api/tasks/${id}/toggle-complete`);
    await fetchList(meta?.current_page || 1);
  }

  async function remove(id) {
    if (!confirm("Delete this task?")) return;
    await api.delete(`/api/tasks/${id}`);
    await fetchList();
  }

  return (
    <AppLayout>
      <Head title="Tasks" />

      {/* ✅ Dashboard Profile Section */}
      <ProfileCard user={me} />

      <div className="bg-slate-800/70 rounded-2xl shadow p-4 mb-6 mt-4">
        <h2 className="text-lg font-semibold mb-3">Create Task</h2>
        <TaskForm onSubmit={createTask} submitLabel="Create" />
      </div>

      <div className="bg-slate-800/70 rounded-2xl shadow p-4">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold">Tasks</h2>
          <input className="w-full max-w-xs rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
                 placeholder="Search..." value={q} onChange={e=>setQ(e.target.value)} />
          <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white" onClick={()=>fetchList()}>Search</button>
          <Link href="/profile" className="ml-auto text-sm px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700">Open Profile</Link>
        </div>

        {loading ? <div>Loading...</div> : (
          <ul className="space-y-2">
            {items.map(t=>(
              <li key={t.id} className="flex items-center gap-3 justify-between bg-slate-800/60 rounded-xl px-4 py-3">
                <div className="space-y-1">
                  <Link href={`/tasks/${t.id}`} className={`font-medium ${t.is_completed ? "line-through opacity-70" : ""}`}>
                    {t.title}
                  </Link>
                  <div className="text-xs opacity-70">
                    Priority: {t.priority} • Due: {t.due_date || "—"} • Remind: {t.remind_at?.slice(0,16) || "—"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500" onClick={()=>toggle(t.id)}>
                    {t.is_completed ? "Mark Incomplete" : "Mark Complete"}
                  </button>
                  <button className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500" onClick={()=>remove(t.id)}>Delete</button>
                </div>
              </li>
            ))}
            {items.length===0 && <div className="opacity-70">No tasks</div>}
          </ul>
        )}

        {meta && (
          <div className="flex gap-2 mt-4">
            <button className="px-3 py-2 rounded-lg bg-slate-700" disabled={meta.current_page<=1}
                    onClick={()=>fetchList(meta.current_page-1)}>Prev</button>
            <div className="px-3 py-2 rounded-lg bg-slate-700">Page {meta.current_page} / {meta.last_page}</div>
            <button className="px-3 py-2 rounded-lg bg-slate-700" disabled={meta.current_page>=meta.last_page}
                    onClick={()=>fetchList(meta.current_page+1)}>Next</button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
