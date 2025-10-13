import { useEffect, useState } from "react";
import { Head } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout.jsx";
import { api } from "../../utils/apiClient.js";

function Box({ children }) {
  return <div className="rounded-2xl bg-slate-800/70 border border-slate-700 p-4">{children}</div>;
}
function Title({ children }) {
  return <h2 className="text-lg font-semibold mb-3">{children}</h2>;
}
function Badge({ children }) {
  return <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-700/70">{children}</span>;
}

export default function AdminTasks() {
  const [me, setMe] = useState(null);

  // dropdown data
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  // filters
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(""); // "", "true", "false"
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // tasks
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState(null);

  // guard + preload users
  useEffect(() => {
    (async () => {
      const r = await api.get('/api/me');
      if (!r.data?.is_admin) { window.location.href = '/tasks'; return; }
      setMe(r.data);
      await loadUsers();
    })();
  }, []);

  async function loadUsers(page=1) {
    const r = await api.get('/api/admin/users', { params: { per_page: 200, page }});
    const arr = r.data.data || r.data;
    setUsers(arr);
  }

  async function loadProjects(userId) {
    if (!userId) { setProjects([]); setSelectedProjectId(""); return; }
    const r = await api.get(`/api/admin/users/${userId}/projects`);
    setProjects(r.data);
    setSelectedProjectId("");
  }

  useEffect(() => { loadProjects(selectedUserId); }, [selectedUserId]);

  async function loadTasks(page=1) {
    setLoading(true);
    try {
      // project নির্বাচিত থাকলে project-specific endpoint; নইলে global admin tasks
      if (selectedProjectId) {
        const r = await api.get(`/api/admin/projects/${selectedProjectId}/tasks`, {
          params: {
            per_page: 15, page,
            is_completed: status===""?undefined:status,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
          }
        });
        setTasks(r.data.data || r.data);
        setMeta(r.data.meta || null);
      } else {
        const r = await api.get(`/api/admin/tasks`, {
          params: {
            per_page: 15, page,
            q: q || undefined,
            user_id: selectedUserId || undefined,
            is_completed: status===""?undefined:status,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
          }
        });
        setTasks(r.data.data || r.data);
        setMeta(r.data.meta || null);
      }
    } finally {
      setLoading(false);
    }
  }

  async function toggleTask(id) {
    await api.patch(`/api/admin/tasks/${id}/toggle-complete`);
    await loadTasks(meta?.current_page || 1);
  }

  async function removeTask(id) {
    if (!confirm("Delete this task?")) return;
    await api.delete(`/api/admin/tasks/${id}`);
    await loadTasks(meta?.current_page || 1);
  }

  return (
    <AppLayout>
      <Head title="Admin • Tasks" />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Admin • Tasks</h1>
        <div className="text-sm opacity-80">Signed in as: <b>{me?.name}</b></div>
      </div>

      <Box>
        <Title>Filters</Title>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          {/* User dropdown */}
          <select
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
            value={selectedUserId}
            onChange={(e)=>setSelectedUserId(e.target.value)}
          >
            <option value="">All users</option>
            {users.map(u=>(
              <option key={u.id} value={u.id}>
                {u.name} {u.is_admin ? '(Admin)': ''}
              </option>
            ))}
          </select>

          {/* Project dropdown (depends on user) */}
          <select
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
            value={selectedProjectId}
            onChange={(e)=>setSelectedProjectId(e.target.value)}
            disabled={!selectedUserId}
            title={!selectedUserId ? "Select a user first" : ""}
          >
            <option value="">All projects</option>
            {projects.map(p=>(
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* status */}
          <select
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
            value={status}
            onChange={(e)=>setStatus(e.target.value)}
          >
            <option value="">All status</option>
            <option value="false">Pending</option>
            <option value="true">Completed</option>
          </select>

          {/* date range */}
          <input
            type="date"
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
            value={dateFrom}
            onChange={(e)=>setDateFrom(e.target.value)}
            placeholder="From"
          />
          <input
            type="date"
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
            value={dateTo}
            onChange={(e)=>setDateTo(e.target.value)}
            placeholder="To"
          />

          {/* q only when not project-scoped */}
          <input
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
            placeholder="Search title/description"
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            disabled={!!selectedProjectId}
            title={selectedProjectId ? "Clear Project to search globally" : ""}
          />
        </div>

        <div className="flex items-center gap-3 mt-3">
          <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white" onClick={()=>loadTasks(1)}>
            Apply
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600"
            onClick={()=>{
              setSelectedUserId("");
              setProjects([]);
              setSelectedProjectId("");
              setStatus("");
              setDateFrom("");
              setDateTo("");
              setQ("");
              setTasks([]);
              setMeta(null);
            }}
          >
            Reset
          </button>
        </div>
      </Box>

      <Box>
        <Title>Tasks</Title>
        {loading ? (
          <div className="min-h-[120px] flex items-center justify-center text-slate-300">
            <div className="h-6 w-6 mr-3 rounded-full border-2 border-slate-500 border-t-transparent animate-spin" />
            Loading tasks…
          </div>
        ) : (
          <>
            <ul className="space-y-2">
              {tasks.map(t=>(
                <li key={t.id} className="flex items-center justify-between bg-slate-800/60 rounded-xl px-3 py-2">
                  <div>
                    <div className={`font-medium ${t.is_completed ? "line-through opacity-70" : ""}`}>
                      {t.title}
                    </div>
                    <div className="text-xs opacity-70">
                      User: {t.user?.name} • Project: {t.project?.name || "—"} • Priority: {t.priority} • Due: {t.due_date?.slice?.(0,10) || "—"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-sm"
                      onClick={()=>toggleTask(t.id)}
                    >
                      {t.is_completed ? "Mark Incomplete" : "Mark Complete"}
                    </button>
                    <button
                      className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-sm"
                      onClick={()=>removeTask(t.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
              {tasks.length===0 && <div className="opacity-70">No tasks</div>}
            </ul>

            {meta && (
              <div className="flex gap-2 mt-4">
                <button className="px-3 py-2 rounded-lg bg-slate-700" disabled={meta.current_page<=1} onClick={()=>loadTasks(meta.current_page-1)}>
                  Prev
                </button>
                <div className="px-3 py-2 rounded-lg bg-slate-700">
                  Page {meta.current_page} / {meta.last_page}
                </div>
                <button className="px-3 py-2 rounded-lg bg-slate-700" disabled={meta.current_page>=meta.last_page} onClick={()=>loadTasks(meta.current_page+1)}>
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </Box>
    </AppLayout>
  );
}
