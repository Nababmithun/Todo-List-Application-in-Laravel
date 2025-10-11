import { useEffect, useState } from "react";

export default function TaskForm({ initial = null, projects = [], onSubmit, submitLabel = "Save" }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [priority, setPriority] = useState(initial?.priority || "medium");
  const [dueDate, setDueDate] = useState(initial?.due_date ? initial.due_date.slice(0, 10) : "");
  const [remindAt, setRemindAt] = useState(initial?.remind_at ? initial.remind_at.slice(0, 16) : "");
  const [category, setCategory] = useState(initial?.category || "");
  const [projectId, setProjectId] = useState(initial?.project_id || "");

  useEffect(() => {
    if (!initial) return;
    setTitle(initial.title || "");
    setDescription(initial.description || "");
    setPriority(initial.priority || "medium");
    setDueDate(initial?.due_date ? initial.due_date.slice(0, 10) : "");
    setRemindAt(initial?.remind_at ? initial.remind_at.slice(0, 16) : "");
    setCategory(initial?.category || "");
    setProjectId(initial?.project_id || "");
  }, [initial]);

  function reset() {
    if (!initial) { // create mode only
      setTitle(""); setDescription(""); setPriority("medium");
      setDueDate(""); setRemindAt(""); setCategory(""); /* projectId রাখলে সুবিধা */
    }
  }

  async function submit(e) {
    e.preventDefault();
    await onSubmit({
      project_id: projectId || null,
      title,
      description,
      priority,
      due_date: dueDate || null,
      remind_at: remindAt || null,
      category: category || null,
    });
    reset();
  }

  return (
    <form className="grid grid-cols-1 md:grid-cols-3 gap-3" onSubmit={submit}>
      <input className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 md:col-span-2"
             placeholder="Task title" value={title} onChange={e=>setTitle(e.target.value)} required />
      <select className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
              value={priority} onChange={e=>setPriority(e.target.value)}>
        <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
      </select>

      <input className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 md:col-span-3"
             placeholder="Description (optional)" value={description} onChange={e=>setDescription(e.target.value)} />

      {/* ✅ Project picker */}
      <select className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
              value={projectId} onChange={e=>setProjectId(e.target.value)}>
        <option value="">No project</option>
        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>

      <select className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
              value={category} onChange={e=>setCategory(e.target.value)}>
        <option value="">Category (optional)</option>
        <option>Work</option><option>Personal</option><option>Study</option><option>Other</option>
      </select>

      <input type="date" className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
             value={dueDate} onChange={e=>setDueDate(e.target.value)} />
      <input type="datetime-local" className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
             value={remindAt} onChange={e=>setRemindAt(e.target.value)} />

      <button className="rounded-lg px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white md:col-span-3">
        {submitLabel}
      </button>
    </form>
  );
}
