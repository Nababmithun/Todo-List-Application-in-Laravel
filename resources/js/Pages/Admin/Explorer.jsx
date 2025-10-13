import { useEffect, useState } from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout.jsx";
import { api } from "../../utils/apiClient.js";

function Panel({ title, children, right }) {
  return (
    <div className="rounded-2xl bg-slate-800/70 border border-slate-700 p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{title}</h3>
        {right}
      </div>
      <div className="flex-1 min-h-0 overflow-auto">{children}</div>
    </div>
  );
}

function Badge({ children }) {
  return (
    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-700/70">
      {children}
    </span>
  );
}

export default function AdminExplorer() {
  const [me, setMe] = useState(null);

  const [users, setUsers] = useState([]);
  const [uMeta, setUMeta] = useState(null);
  const [uq, setUq] = useState("");

  const [projects, setProjects] = useState([]);
  const [pLoading, setPLoading] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [tMeta, setTMeta] = useState(null);
  const [tLoading, setTLoading] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  // guard admin
  useEffect(() => {
    (async () => {
      const r = await api.get('/api/me');
      if (!r.data?.is_admin) { window.location.href = '/tasks'; return; }
      setMe(r.data);
      await loadUsers(1);
    })();
  }, []);

  async function loadUsers(page=1) {
    const r = await api.get('/api/admin/users', { params: { q: uq, per_page: 15, page }});
    setUsers(r.data.data || r.data);
    setUMeta(r.data.meta || null);
  }

  async function loadProjectsForUser(user) {
    if (!user) return;
    setPLoading(true);
    setProjects([]);
    setSelectedProject(null);
    try {
      const r = await api.get(`/api/admin/users/${user.id}/projects`, { params: { include: 'tasks' }});
      setProjects(r.data);
    } finally {
      setPLoading(false);
    }
  }

  async function loadTasksForProject(project, page=1, completedFilter="") {
    if (!project) return;
    setTLoading(true);
    try {
      const r = await api.get(`/api/admin/projects/${project.id}/tasks`, {
        params: { per_page: 15, page, is_completed: completedFilter===""?undefined:completedFilter }
      });
      setTasks(r.data.data || r.data);
      setTMeta(r.data.meta || null);
    } finally {
      setTLoading(false);
    }
  }

  async function toggleTask(id) {
    await api.patch(`/api/admin/tasks/${id}/toggle-complete`);
    await loadTasksForProject(selectedProject, tMeta?.current_page || 1);
  }

  async function removeTask(id) {
    if (!confirm("Delete this task?")) return;
    await api.delete(`/api/admin/tasks/${id}`);
    await loadTasksForProject(selectedProject, tMeta?.current_page || 1);
  }

  return (
    <AppLayout>
      <Head title="Admin • Explorer" />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Admin Explorer</h1>
        <div className="text-sm opacity-80">Signed in as: <b>{me?.name}</b></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[540px]">
        {/* Users */}
        <Panel
          title="Users"
          right={(
            <div className="flex items-center gap-2">
              <input value={uq} onChange={e=>setUq(e.target.value)} placeholder="Search" className="h-8 px-3 rounded-lg bg-slate-900 border border-slate-700 text-sm" />
              <button onClick={()=>loadUsers(1)} className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm">Go</button>
            </div>
          )}
        >
          <ul className="space-y-1">
            {(users.data || users).map(u=>(
              <li key={u.id}>
                <button
                  onClick={()=>{ setSelectedUser(u); loadProjectsForUser(u); }}
                  className={`w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700/60 ${selectedUser?.id===u.id?'bg-slate-700/70':''}`}
                >
                  <div className="font-medium">{u.name} {u.is_admin && <Badge>Admin</Badge>}</div>
                  <div className="text-xs opacity-70">{u.email}{u.mobile ? ` • ${u.mobile}`: ''}</div>
                </button>
              </li>
            ))}
          </ul>
          {uMeta && (
            <div className="flex gap-2 mt-3">
              <button className="px-3 py-1.5 rounded bg-slate-700" disabled={uMeta.current_page<=1} onClick={()=>loadUsers(uMeta.current_page-1)}>Prev</button>
              <div className="px-3 py-1.5 rounded bg-slate-700">Page {uMeta.current_page}/{uMeta.last_page}</div>
              <button className="px-3 py-1.5 rounded bg-slate-700" disabled={uMeta.current_page>=uMeta.last_page} onClick={()=>loadUsers(uMeta.current_page+1)}>Next</button>
            </div>
          )}
        </Panel>

        {/* Projects of selected user */}
        <Panel
          title={selectedUser ? `Projects of ${selectedUser.name}` : "Projects"}
          right={selectedUser && <Badge>{pLoading ? 'Loading…' : `${projects.length} projects`}</Badge>}
        >
          {!selectedUser ? (
            <div className="opacity-70">Select a user to view projects.</div>
          ) : pLoading ? (
            <div>Loading…</div>
          ) : (
            <ul className="space-y-2">
              {projects.map(p=>(
                <li key={p.id}>
                  <button
                    onClick={()=>{ setSelectedProject(p); loadTasksForProject(p, 1); }}
                    className={`w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700/60 ${selectedProject?.id===p.id?'bg-slate-700/70':''}`}
                  >
                    <div className="font-medium flex items-center gap-2">
                      {p.name}
                      <Badge>{p.tasks_total ?? (p.tasks?.length || 0)} tasks</Badge>
                    </div>
                    <div className="text-xs opacity-70">{p.user?.name} ({p.user?.email})</div>
                    {/* (optional) preview a few tasks */}
                    {Array.isArray(p.tasks) && p.tasks.length>0 && (
                      <div className="mt-1 text-xs space-y-1">
                        {p.tasks.slice(0,3).map(t=>(
                          <div key={t.id} className="opacity-80">
                            • {t.title} {t.is_completed ? <Badge>Done</Badge> : <Badge>Pending</Badge>}
                          </div>
                        ))}
                        {p.tasks.length>3 && <div className="opacity-60">…and more</div>}
                      </div>
                    )}
                  </button>
                </li>
              ))}
              {projects.length===0 && <div className="opacity-70">No projects</div>}
            </ul>
          )}
        </Panel>

        {/* Tasks of selected project */}
        <Panel
          title={selectedProject ? `Tasks of ${selectedProject.name}` : "Tasks"}
          right={selectedProject && (
            <div className="flex items-center gap-2">
              <select
                className="h-8 px-2 rounded bg-slate-900 border border-slate-700 text-sm"
                onChange={(e)=>loadTasksForProject(selectedProject, 1, e.target.value)}
                defaultValue=""
              >
                <option value="">All</option>
                <option value="false">Pending</option>
                <option value="true">Completed</option>
              </select>
            </div>
          )}
        >
          {!selectedProject ? (
            <div className="opacity-70">Select a project to view tasks.</div>
          ) : tLoading ? (
            <div>Loading…</div>
          ) : (
            <>
              <ul className="space-y-2">
                {(tasks.data || tasks).map(t=>(
                  <li key={t.id} className="flex items-center justify-between bg-slate-800/60 rounded-xl px-3 py-2">
                    <div>
                      <div className={`font-medium ${t.is_completed ? "line-through opacity-70" : ""}`}>{t.title}</div>
                      <div className="text-xs opacity-70">
                        User: {t.user?.name} • Priority: {t.priority} • Due: {t.due_date?.slice?.(0,10) || "—"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-sm" onClick={()=>toggleTask(t.id)}>
                        {t.is_completed ? "Mark Incomplete" : "Mark Complete"}
                      </button>
                      <button className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-sm" onClick={()=>removeTask(t.id)}>
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
                {(tasks.data || tasks).length===0 && <div className="opacity-70">No tasks</div>}
              </ul>

              {tMeta && (
                <div className="flex gap-2 mt-3">
                  <button className="px-3 py-1.5 rounded bg-slate-700" disabled={tMeta.current_page<=1} onClick={()=>loadTasksForProject(selectedProject, tMeta.current_page-1)}>
                    Prev
                  </button>
                  <div className="px-3 py-1.5 rounded bg-slate-700">Page {tMeta.current_page}/{tMeta.last_page}</div>
                  <button className="px-3 py-1.5 rounded bg-slate-700" disabled={tMeta.current_page>=tMeta.last_page} onClick={()=>loadTasksForProject(selectedProject, tMeta.current_page+1)}>
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </Panel>
      </div>

      {/* Quick links row */}
      <div className="rounded-2xl bg-slate-800/70 border border-slate-700 p-4 mt-4">
        <div className="text-sm mb-2">Admin Shortcuts</div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin" className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm">Dashboard</Link>
          <Link href="/admin/users" className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm">Users</Link>
          <Link href="/admin/projects" className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm">Projects</Link>
          <Link href="/admin/tasks" className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm">Tasks</Link>
        </div>
      </div>
    </AppLayout>
  );
}
