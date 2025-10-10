import { useEffect, useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout.jsx";
import { api } from "../../utils/apiClient.js";
import TaskForm from "../../Components/TaskForm.jsx";
import SubtaskForm from "../../Components/SubtaskForm.jsx";

export default function Show({ id }) {
  const [task, setTask] = useState(null);
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [taskRes, subsRes] = await Promise.all([
      api.get(`/api/tasks/${id}`),
      api.get(`/api/tasks/${id}/subtasks?per_page=50`)
    ]);
    setTask(taskRes.data.data);
    setSubs(subsRes.data.data);
    setLoading(false);
  }

  useEffect(()=>{ load(); }, [id]);

  async function updateTask(data) {
    await api.put(`/api/tasks/${id}`, data);
    await load();
  }

  async function toggleTask() {
    await api.patch(`/api/tasks/${id}/toggle-complete`);
    await load();
  }

  async function deleteTask() {
    if (!confirm("Delete task?")) return;
    await api.delete(`/api/tasks/${id}`);
    window.location.href = "/tasks";
  }

  async function addSubtask(data) {
    await api.post(`/api/tasks/${id}/subtasks`, data);
    await load();
  }

  async function toggleSub(subId) {
    await api.patch(`/api/subtasks/${subId}/toggle-complete`);
    await load();
  }

  async function removeSub(subId) {
    if (!confirm("Delete subtask?")) return;
    await api.delete(`/api/subtasks/${subId}`);
    await load();
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) { if (typeof window !== 'undefined') window.location.href = '/login'; return null; }

  if (loading) return <AppLayout><div>Loading...</div></AppLayout>;
  if (!task) return <AppLayout><div>Not found</div></AppLayout>;

  return (
    <AppLayout>
      <Head title={`Task #${id}`} />
      <div className="flex items-center gap-3">
        <Link href="/tasks" className="px-3 py-1 rounded-full bg-slate-700">&larr; Back</Link>
        <h2 className="text-xl font-semibold">{task.title}</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-800/70 rounded-2xl shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Edit Task</h3>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500" onClick={toggleTask}>
                {task.is_completed ? "Mark Incomplete" : "Mark Complete"}
              </button>
              <button className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500" onClick={deleteTask}>Delete</button>
            </div>
          </div>
          <TaskForm initial={task} onSubmit={updateTask} submitLabel="Update" />
        </div>

        <div className="bg-slate-800/70 rounded-2xl shadow p-4">
          <h3 className="font-semibold mb-3">Add Subtask</h3>
          <SubtaskForm onSubmit={addSubtask} submitLabel="Add" />
        </div>
      </div>

      <div className="bg-slate-800/70 rounded-2xl shadow p-4">
        <h3 className="font-semibold mb-3">Subtasks</h3>
        <ul className="space-y-2">
          {subs.map(s=>(
            <li key={s.id} className="flex items-center justify-between bg-slate-800/60 rounded-xl px-4 py-3">
              <div>
                <div className={`font-medium ${s.is_completed ? "line-through opacity-70" : ""}`}>{s.title}</div>
                <div className="text-xs opacity-70">
                  Priority: {s.priority} • Due: {s.due_date || "—"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500" onClick={()=>toggleSub(s.id)}>
                  {s.is_completed ? "Undone" : "Done"}
                </button>
                <button className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500" onClick={()=>removeSub(s.id)}>Delete</button>
              </div>
            </li>
          ))}
          {subs.length===0 && <div className="opacity-70">No subtasks</div>}
        </ul>
      </div>
    </AppLayout>
  );
}
