// resources/js/Pages/Tasks/Index.jsx
import { useEffect, useState } from "react";
import { Link, Head } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout.jsx";
import { api } from "../../utils/apiClient.js";
import TaskForm from "../../Components/TaskForm.jsx";
import Toast from "../../Components/Toast.jsx";
import ConfirmDialog from "../../Components/ConfirmDialog.jsx"; // delete/complete confirm
import ProjectDialog from "../../Components/ProjectDialog.jsx"; // ✅ NEW

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);

  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState(""); // filter

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [toast, setToast] = useState({ type: "success", message: "" });

  // delete dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null); // { id, title }

  // ✅ complete dialog
  const [completeAsk, setCompleteAsk] = useState(false);
  const [pendingComplete, setPendingComplete] = useState(null); // task object

  // ✅ project dialog
  const [projOpen, setProjOpen] = useState(false);

  async function fetchProjects() {
    try {
      const r = await api.get("/api/projects");
      setProjects(r.data);
    } catch {
      setProjects([]);
      setToast({ type: "error", message: "Could not load projects" });
    }
  }

  async function fetchList(page = 1) {
    setLoading(true);
    try {
      const res = await api.get(`/api/tasks`, {
        params: {
          per_page: 10,
          page,
          q: q || undefined,
          category: category || undefined,
          project_id: projectId || undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
        },
      });
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

  // initial load + admin guard
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

  // Optimistic create (সাথে সাথে লিস্টে দেখাবে + ফর্ম খালি)
  async function createTask(data) {
    const tempId = `tmp_${Date.now()}`;
    const optimistic = {
      id: tempId,
      title: data.title,
      description: data.description,
      priority: data.priority,
      due_date: data.due_date,
      remind_at: data.remind_at,
      category: data.category,
      project_id: data.project_id,
      is_completed: false, // ✅ নতুন টাস্ক ডিফল্টে incomplete
    };
    setItems((prev) => [optimistic, ...prev]);

    try {
      const res = await api.post("/api/tasks", data);
      const created = res.data.data || res.data;
      setItems((prev) => prev.map((it) => (it.id === tempId ? created : it)));
      setToast({ type: "success", message: "Task created!" });
    } catch (e) {
      setItems((prev) => prev.filter((it) => it.id !== tempId));
      const msg =
        e?.response?.data?.message ||
        (e?.response?.status === 422 ? "Validation error" : "Create failed");
      setToast({ type: "error", message: msg });
      if (e?.response?.status === 422) console.warn("Validation:", e.response.data.errors);
    }
  }

  // ✅ project create (dialog submit)
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

  // ✅ complete toggle with confirm dialog
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
    fetchList(1);
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

      {/* ✅ Complete confirm dialog */}
      <ConfirmDialog
        open={completeAsk}
        title={pendingComplete?.is_completed ? "Mark as Incomplete?" : "Mark as Complete?"}
        message={pendingComplete ? <span>Change status for <b>{pendingComplete.title}</b>?</span> : "Change status?"}
        confirmText="OK"
        cancelText="Cancel"
        onClose={() => { setCompleteAsk(false); setPendingComplete(null); }}
        onConfirm={confirmCompleteToggle}
      />

      {/* ✅ Project create dialog */}
      <ProjectDialog
        open={projOpen}
        onClose={() => setProjOpen(false)}
        onCreate={createProject}
      />

      {/* Projects Section (filter + new project button) */}
      <div className="bg-slate-800/70 rounded-2xl shadow p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Projects</h2>
          <div className="flex items-center gap-3">
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
            <button
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
              onClick={() => fetchList()}
            >
              Apply
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600"
              onClick={() => { setProjectId(""); fetchList(1); }}
            >
              Reset
            </button>

            {/* ✅ New Project button -> dialog */}
            <button
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600"
              onClick={() => setProjOpen(true)}
            >
              + New Project
            </button>
          </div>
        </div>
        {/* ProjectForm সরানো হয়েছে, এখন dialog দিয়ে তৈরি হবে */}
      </div>

      {/* Create Task */}
      <div className="bg-slate-800/70 rounded-2xl shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Create Task</h2>
        <TaskForm onSubmit={createTask} submitLabel="Create" projects={projects} />
      </div>

      {/* Filters + List */}
      <div className="bg-slate-800/70 rounded-2xl shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-3">
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
          <input type="date" className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
                 value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <input type="date" className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
                 value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white" onClick={() => fetchList()}>
            Apply
          </button>
          <button className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600" onClick={resetFilters}>
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
                      Proj: {projects.find((p) => p.id === t.project_id)?.name || "—"} •
                      Cat: {t.category || "—"} • Priority: {t.priority} •
                      Due: {t.due_date?.slice(0,10) || "—"} • Remind: {t.remind_at?.slice(0,16) || "—"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500"
                            onClick={() => askComplete(t)}>
                      {t.is_completed ? "Mark Incomplete" : "Mark Complete"}
                    </button>
                    <button className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500"
                            onClick={() => askDelete(t.id, t.title)}>
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
              <button className="px-3 py-2 rounded-lg bg-slate-700"
                      disabled={meta.current_page <= 1}
                      onClick={() => fetchList(meta.current_page - 1)}>
                Prev
              </button>
              <div className="px-3 py-2 rounded-lg bg-slate-700">
                Page {meta.current_page} / {meta.last_page}
              </div>
              <button className="px-3 py-2 rounded-lg bg-slate-700"
                      disabled={meta.current_page >= meta.last_page}
                      onClick={() => fetchList(meta.current_page + 1)}>
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
