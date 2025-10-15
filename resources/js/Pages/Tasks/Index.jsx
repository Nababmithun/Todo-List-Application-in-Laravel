// resources/js/Pages/Tasks/Index.jsx
import { useEffect, useState } from "react";
import { Link, Head } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout.jsx";
import { api } from "../../utils/apiClient.js";
import TaskForm from "../../Components/TaskForm.jsx";
import Toast from "../../Components/Toast.jsx";
import ConfirmDialog from "../../Components/ConfirmDialog.jsx";
import ProjectDialog from "../../Components/ProjectDialog.jsx";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);

  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");

  // 🔹 Assignee filter (project ভিত্তিক)
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [assigneeId, setAssigneeId] = useState("");

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [toast, setToast] = useState({ type: "success", message: "" });

  // delete dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null); // { id, title }

  // complete dialog
  const [completeAsk, setCompleteAsk] = useState(false);
  const [pendingComplete, setPendingComplete] = useState(null);

  // project dialog
  const [projOpen, setProjOpen] = useState(false);

  // create শেষে ফর্ম ক্লিয়ার করতে force remount
  const [formKey, setFormKey] = useState(1);

  async function fetchProjects() {
    try {
      const r = await api.get("/api/projects");
      setProjects(r.data);
    } catch {
      setProjects([]);
      setToast({ type: "error", message: "Could not load projects" });
    }
  }

  // প্রজেক্ট বদলালে members ফেচ
  useEffect(() => {
    async function loadMembers() {
      if (!projectId) {
        setMembers([]);
        setAssigneeId("");
        return;
      }
      setMembersLoading(true);
      try {
        const r = await api.get(`/api/projects/${projectId}/members`);
        setMembers(r.data || []);
        // পূর্বে সিলেক্টেড assignee না থাকলে ক্লিয়ার
        if (assigneeId && !(r.data || []).some(m => m.id === Number(assigneeId))) {
          setAssigneeId("");
        }
      } catch {
        setMembers([]);
        setAssigneeId("");
      } finally {
        setMembersLoading(false);
      }
    }
    loadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function fetchList(page = 1) {
    setLoading(true);
    try {
      const params = {
        per_page: 10,
        page,
        q: q || undefined,
        category: category || undefined,
        project_id: projectId || undefined,
        // ব্যাকএন্ডে date_from/date_to সাপোর্ট করা আছে ধরে নিচ্ছি
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        // 🔹 assignee filter (ব্যাকএন্ডে ?assignee_id= সাপোর্ট)
        assignee_id: assigneeId || undefined,
      };
      const res = await api.get(`/api/tasks`, { params });
      setItems(res.data.data);
      setMeta(res.data.meta || null);
    } catch (e) {
      setToast({
        type: "error",
        message: e?.response?.data?.message || "Failed to load tasks",
      });
      setItems([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }

  // initial
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    (async () => {
      try {
        const me = await api.get("/api/me");
        if (me.data?.is_admin) {
          window.location.href = "/admin/dashboard";
          return;
        }
      } catch {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }
      await Promise.all([fetchProjects(), fetchList()]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // create task (optimistic)
  async function createTask(data) {
    const tempId = `tmp_${Date.now()}`;
    // 🔹 নতুন ফিল্ডগুলো optimistic আইটেমে রাখছি
    const optimistic = {
      id: tempId,
      title: data.title,
      description: data.description,
      priority: data.priority,
      category: data.category,
      project_id: data.project_id,
      // NEW fields
      start_date: data.start_date,
      end_date: data.end_date,
      estimated_hours: data.estimated_hours,
      worked_hours: data.worked_hours,
      assignee_id: data.assignee_id,
      is_completed: false,
    };
    setItems((prev) => [optimistic, ...prev]);

    try {
      const res = await api.post("/api/tasks", data);
      const created = res.data.data || res.data;
      setItems((prev) => prev.map((it) => (it.id === tempId ? created : it)));
      setToast({ type: "success", message: "Task created!" });
      // clear TaskForm by remounting it
      setFormKey((k) => k + 1);
    } catch (e) {
      setItems((prev) => prev.filter((it) => it.id !== tempId));
      const msg =
        e?.response?.data?.message ||
        (e?.response?.status === 422 ? "Validation error" : "Create failed");
      setToast({ type: "error", message: msg });
    }
  }

  // project create
  async function createProject(data) {
    try {
      const res = await api.post("/api/projects", data);
      setProjects((prev) => [res.data, ...prev]);
      setToast({ type: "success", message: "Project created!" });
    } catch (e) {
      setToast({
        type: "error",
        message: e?.response?.data?.message || "Project create failed",
      });
    }
  }

  // complete with confirm
  function askComplete(task) {
    setPendingComplete(task);
    setCompleteAsk(true);
  }
  async function confirmCompleteToggle() {
    if (!pendingComplete?.id) return;
    try {
      await api.patch(`/api/tasks/${pendingComplete.id}/toggle-complete`);
      await fetchList(meta?.current_page || 1);
    } catch (e) {
      setToast({
        type: "error",
        message: e?.response?.data?.message || "Failed to update task",
      });
    } finally {
      setCompleteAsk(false);
      setPendingComplete(null);
    }
  }

  // delete
  function askDelete(id, title) {
    setPendingDelete({ id, title });
    setConfirmOpen(true);
  }
  async function actuallyDelete() {
    if (!pendingDelete?.id) return;
    try {
      await api.delete(`/api/tasks/${pendingDelete.id}`);
      setToast({ type: "success", message: "Task deleted" });
      await fetchList(meta?.current_page || 1);
    } catch (e) {
      setToast({
        type: "error",
        message: e?.response?.data?.message || "Failed to delete",
      });
    } finally {
      setConfirmOpen(false);
      setPendingDelete(null);
    }
  }

  function resetFilters() {
    setQ("");
    setCategory("");
    setDateFrom("");
    setDateTo("");
    setProjectId("");
    setMembers([]);
    setAssigneeId("");
    fetchList(1);
  }

  // member id → name helper
  function assigneeName(task) {
    const list = projectId ? members : []; // কেবল সিলেক্টেড প্রজেক্টের মেম্বার লিস্টই জানা আছে
    const m = list.find((x) => x.id === (task.assignee_id ?? -1));
    return m?.name || "—";
  }

  return (
    <AppLayout>
      <Head title="Tasks" />
      <Toast {...toast} onClose={() => setToast({ type: "success", message: "" })} />

      {/* Delete dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete task?"
        message={
          <span>
            Are you sure you want to delete{" "}
            <span className="font-semibold">
              {pendingDelete?.title ? `"${pendingDelete.title}"` : "this task"}
            </span>
            ?
          </span>
        }
        confirmText="Yes, delete"
        cancelText="No"
        onClose={() => { setConfirmOpen(false); setPendingDelete(null); }}
        onConfirm={actuallyDelete}
      />

      {/* Complete dialog */}
      <ConfirmDialog
        open={completeAsk}
        title={pendingComplete?.is_completed ? "Mark as Incomplete?" : "Mark as Complete?"}
        message={pendingComplete ? <span>Change status for <b>{pendingComplete.title}</b>?</span> : "Change status?"}
        confirmText="OK"
        cancelText="Cancel"
        onClose={() => { setCompleteAsk(false); setPendingComplete(null); }}
        onConfirm={confirmCompleteToggle}
      />

      {/* Project dialog */}
      <ProjectDialog
        open={projOpen}
        onClose={() => setProjOpen(false)}
        onCreate={createProject}
      />

      {/* Projects Section (filter + new project) */}
      <div className="bg-slate-800/70 rounded-2xl shadow p-4 mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">Projects</h2>
          <div className="flex flex-wrap gap-2">
            <select
              className="w-full sm:w-auto rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              <option value="">All projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            {/* 🔹 Assignee filter (project নির্ভর) */}
            <select
              className="w-full sm:w-auto rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 disabled:opacity-60"
              disabled={!projectId || membersLoading || members.length === 0}
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
            >
              {!projectId ? (
                <option value="">Select project first</option>
              ) : membersLoading ? (
                <option value="">Loading members…</option>
              ) : members.length === 0 ? (
                <option value="">No members</option>
              ) : (
                <>
                  <option value="">All assignees</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </>
              )}
            </select>

            <button
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
              onClick={() => fetchList()}
            >
              Apply
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600"
              onClick={() => { setProjectId(""); setAssigneeId(""); fetchList(1); }}
            >
              Reset
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600"
              onClick={() => setProjOpen(true)}
            >
              + New Project
            </button>
          </div>
        </div>
      </div>

      {/* Create Task */}
      <div className="bg-slate-800/70 rounded-2xl shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Create Task</h2>
        <TaskForm
          key={formKey}
          onSubmit={createTask}
          submitLabel="Create"
          projects={projects}
        />
      </div>

      {/* Filters + List */}
      <div className="bg-slate-800/70 rounded-2xl shadow p-4">
        {/* Filters */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-6 gap-3 mb-3">
          <input
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 md:col-span-2"
            placeholder="Search..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            <option value="">All projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All categories</option>
            <option>Work</option><option>Personal</option>
            <option>Study</option><option>Other</option>
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

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
            onClick={() => fetchList()}
          >
            Apply
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600"
            onClick={resetFilters}
          >
            Reset
          </button>
          <Link
            href="/profile"
            className="ml-auto px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm"
          >
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
                <li
                  key={t.id}
                  className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-slate-800/60 rounded-xl px-4 py-3"
                >
                  <div className="space-y-1">
                    <Link
                      href={`/tasks/${t.id}`}
                      className={`font-medium ${t.is_completed ? "line-through opacity-70" : ""}`}
                    >
                      {t.title}
                    </Link>
                    <div className="text-xs opacity-70">
                      Proj: {projects.find((p) => p.id === t.project_id)?.name || "—"} •
                      Cat: {t.category || "—"} • Priority: {t.priority} •
                      Start: {t.start_date?.slice(0,10) || "—"} • End: {t.end_date?.slice(0,10) || "—"} •
                      Est: {t.estimated_hours ?? "—"}h • Worked: {t.worked_hours ?? "—"}h •
                      Assignee: {assigneeName(t)}
                    </div>
                  </div>

                  {/* actions */}
                  <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                    <button
                      className="w-full sm:w-auto px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500"
                      onClick={() => askComplete(t)}
                    >
                      {t.is_completed ? "Mark Incomplete" : "Mark Complete"}
                    </button>
                    <button
                      className="w-full sm:w-auto px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500"
                      onClick={() => askDelete(t.id, t.title)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
              {items.length === 0 && <div className="opacity-70">No tasks</div>}
            </ul>
          )}

          {meta && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <button
                className="px-3 py-2 rounded-lg bg-slate-700 disabled:opacity-50"
                disabled={meta.current_page <= 1}
                onClick={() => fetchList(meta.current_page - 1)}
              >
                Prev
              </button>
              <div className="px-3 py-2 rounded-lg bg-slate-700">
                Page {meta.current_page} / {meta.last_page}
              </div>
              <button
                className="px-3 py-2 rounded-lg bg-slate-700 disabled:opacity-50"
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
