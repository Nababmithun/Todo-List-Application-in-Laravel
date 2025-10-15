import { useEffect, useMemo, useState } from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout.jsx";
import { api } from "../../utils/apiClient.js";
import ProjectMembersDialog from "../../Components/ProjectMembersDialog.jsx";

function groupByDate(items) {
  const by = {};
  items.forEach((t) => {
    const key = t.due_date ? t.due_date.slice(0, 10) : "No due date";
    if (!by[key]) by[key] = [];
    by[key].push(t);
  });
  const keys = Object.keys(by).sort((a, b) => {
    if (a === "No due date") return 1;
    if (b === "No due date") return -1;
    return a.localeCompare(b);
  });
  return { by, keys };
}

export default function ProjectShow({ id }) {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [onlyCompleted, setOnlyCompleted] = useState("");
  const [q, setQ] = useState("");

  // NEW: dialog open state
  const [membersOpen, setMembersOpen] = useState(false);

  async function loadProject() {
    const r = await api.get(`/api/projects/${id}`);
    setProject(r.data);
  }

  async function loadTasks() {
    setLoading(true);
    const params = {
      project_id: id,
      q: q || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      per_page: 200,
    };
    if (onlyCompleted !== "") params.is_completed = onlyCompleted;
    const r = await api.get("/api/tasks", { params });
    setTasks(r.data.data || r.data);
    setLoading(false);
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    Promise.all([loadProject(), loadTasks()]);
  }, [id]);

  const { by, keys } = useMemo(() => groupByDate(tasks), [tasks]);

  return (
    <AppLayout>
      <Head title={`Project #${id}`} />

      {/* Manage Members Dialog */}
      <ProjectMembersDialog
        open={membersOpen}
        projectId={id}
        onClose={() => {
          setMembersOpen(false);
          // চাইলে এখানে loadTasks() আবার ডাকতে পারো
          // loadTasks();
        }}
      />

      <div className="flex items-center gap-3 mb-4">
        <Link
          href="/projects"
          className="px-3 py-1 rounded-full bg-slate-700 hover:bg-slate-600"
        >
          &larr; Back
        </Link>
        <h1 className="text-xl font-semibold">
          {project?.name || `Project #${id}`}
        </h1>

        <button
          onClick={() => setMembersOpen(true)}
          className="ml-auto px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700"
        >
          Manage Members
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/70 rounded-2xl p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <input
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 md:col-span-2"
            placeholder="Search tasks..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mt-3">
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
          <select
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
            value={onlyCompleted}
            onChange={(e) => setOnlyCompleted(e.target.value)}
          >
            <option value="">All</option>
            <option value="true">Completed</option>
            <option value="false">Pending</option>
          </select>
          <button
            className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500"
            onClick={loadTasks}
          >
            Apply
          </button>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[120px] flex items-center justify-center">
          <div className="h-6 w-6 mr-3 rounded-full border-2 border-slate-500 border-t-transparent animate-spin" />
          Loading tasks…
        </div>
      ) : keys.length === 0 ? (
        <div className="opacity-70">No tasks for this project.</div>
      ) : (
        <div className="space-y-4">
          {keys.map((dateKey) => {
            const list = by[dateKey];
            const completed = list.filter((t) => t.is_completed);
            const pending = list.filter((t) => !t.is_completed);
            return (
              <div key={dateKey} className="bg-slate-800/70 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">{dateKey}</div>
                  <div className="text-xs opacity-70">
                    Completed: {completed.length} • Pending: {pending.length} •
                    Total: {list.length}
                  </div>
                </div>
                <ul className="space-y-2">
                  {list.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center justify-between bg-slate-800/60 rounded-xl px-4 py-3"
                    >
                      <div>
                        <Link
                          href={`/tasks/${t.id}`}
                          className={`font-medium ${
                            t.is_completed ? "line-through opacity-70" : ""
                          }`}
                        >
                          {t.title}
                        </Link>
                        <div className="text-xs opacity-70">
                          Priority: {t.priority} • Category:{" "}
                          {t.category || "—"}
                          {t.assignee_name
                            ? ` • Assignee: ${t.assignee_name}`
                            : ""}
                        </div>
                      </div>
                      <div className="text-xs opacity-70">
                        {t.is_completed ? "Done" : "Pending"}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
