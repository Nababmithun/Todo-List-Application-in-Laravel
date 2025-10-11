import { useEffect, useState } from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout.jsx";
import { api } from "../../utils/apiClient.js";
import TaskForm from "../../Components/TaskForm.jsx";
import SubtaskForm from "../../Components/SubtaskForm.jsx";

export default function Show({ id }) {
  const [task, setTask] = useState(null);
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false); // action loading (toggle/delete/save)

  async function load() {
    setLoading(true);
    try {
      const [taskRes, subsRes] = await Promise.all([
        api.get(`/api/tasks/${id}`),
        api.get(`/api/tasks/${id}/subtasks?per_page=50`),
      ]);
      setTask(taskRes.data.data);
      setSubs(subsRes.data.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { 
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/login'; return; }
    load(); 
  }, [id]);

  async function updateTask(data) {
    setBusy(true);
    try {
      await api.put(`/api/tasks/${id}`, data);
      await load();
      alert("Task updated!");
    } finally {
      setBusy(false);
    }
  }

  async function toggleTask() {
    setBusy(true);
    try {
      await api.patch(`/api/tasks/${id}/toggle-complete`);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function deleteTask() {
    if (!confirm("Delete task?")) return;
    setBusy(true);
    try {
      await api.delete(`/api/tasks/${id}`);
      window.location.href = "/tasks";
    } finally {
      setBusy(false);
    }
  }

  async function addSubtask(data) {
    setBusy(true);
    try {
      await api.post(`/api/tasks/${id}/subtasks`, data);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function toggleSub(subId) {
    setBusy(true);
    try {
      await api.patch(`/api/subtasks/${subId}/toggle-complete`);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function removeSub(subId) {
    if (!confirm("Delete subtask?")) return;
    setBusy(true);
    try {
      await api.delete(`/api/subtasks/${subId}`);
      await load();
    } finally {
      setBusy(false);
    }
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) { if (typeof window !== 'undefined') window.location.href = '/login'; return null; }

  if (loading) {
    return (
      <AppLayout>
        <Head title={`Task #${id}`} />
        <div className="min-h-[40vh] flex items-center justify-center text-slate-300">
          <div className="h-6 w-6 mr-3 rounded-full border-2 border-slate-500 border-t-transparent animate-spin" />
          Loading task…
        </div>
      </AppLayout>
    );
  }

  if (!task) return <AppLayout><Head title="Task Not Found" /><div>Not found</div></AppLayout>;

  return (
    <AppLayout>
      <Head title={`Task #${id}`} />

      <div className="flex items-center gap-3 mb-2">
        <Link href="/tasks" className="px-3 py-1 rounded-full bg-slate-700 hover:bg-slate-600">&larr; Back</Link>
        <h2 className="text-xl font-semibold">{task.title}</h2>
        <span className={`ml-auto text-xs px-2 py-1 rounded-full ${task.is_completed ? "bg-emerald-700/50" : "bg-slate-700/70"}`}>
          {task.is_completed ? "Completed" : "Pending"}
        </span>
      </div>

      {/* Quick facts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-800/70 rounded-xl p-3">
          <div className="text-xs opacity-70">Category</div>
          <div className="font-medium">{task.category || "—"}</div>
        </div>
        <div className="bg-slate-800/70 rounded-xl p-3">
          <div className="text-xs opacity-70">Priority</div>
          <div className="font-medium">{task.priority}</div>
        </div>
        <div className="bg-slate-800/70 rounded-xl p-3">
          <div className="text-xs opacity-70">Due date</div>
          <div className="font-medium">{task.due_date ? task.due_date.slice(0,10) : "—"}</div>
        </div>
        <div className="bg-slate-800/70 rounded-xl p-3">
          <div className="text-xs opacity-70">Remind at</div>
          <div className="font-medium">{task.remind_at ? task.remind_at.slice(0,16) : "—"}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Edit Task */}
        <div className="bg-slate-800/70 rounded-2xl shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Edit Task</h3>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60"
                disabled={busy}
                onClick={toggleTask}
              >
                {task.is_completed ? "Mark Incomplete" : "Mark Complete"}
              </button>
              <button
                className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-60"
                disabled={busy}
                onClick={deleteTask}
              >
                Delete
              </button>
            </div>
          </div>

          <TaskForm initial={task} onSubmit={updateTask} submitLabel={busy ? "Saving…" : "Update"} />
        </div>

        {/* Add Subtask */}
        <div className="bg-slate-800/70 rounded-2xl shadow p-4">
          <h3 className="font-semibold mb-3">Add Subtask</h3>
          <SubtaskForm onSubmit={addSubtask} submitLabel={busy ? "Adding…" : "Add"} />
        </div>
      </div>

      {/* Subtasks List */}
      <div className="bg-slate-800/70 rounded-2xl shadow p-4 mt-6">
        <h3 className="font-semibold mb-3">Subtasks</h3>
        {subs.length === 0 ? (
          <div className="opacity-70">No subtasks</div>
        ) : (
          <ul className="space-y-2">
            {subs.map((s) => (
              <li key={s.id} className="flex items-center justify-between bg-slate-800/60 rounded-xl px-4 py-3">
                <div>
                  <div className={`font-medium ${s.is_completed ? "line-through opacity-70" : ""}`}>{s.title}</div>
                  <div className="text-xs opacity-70">
                    Priority: {s.priority} • Due: {s.due_date ? s.due_date.slice(0,10) : "—"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60"
                    disabled={busy}
                    onClick={() => toggleSub(s.id)}
                  >
                    {s.is_completed ? "Undone" : "Done"}
                  </button>
                  <button
                    className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-60"
                    disabled={busy}
                    onClick={() => removeSub(s.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppLayout>
  );
}
