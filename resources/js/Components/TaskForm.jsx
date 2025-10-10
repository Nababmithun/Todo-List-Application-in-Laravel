import { useEffect, useState } from "react";

export default function TaskForm({ initial, onSubmit, submitLabel="Save" }) {
  const [form, setForm] = useState({
    title: "", description: "", due_date: "", priority: 3, is_completed: false, remind_at: ""
  });

  useEffect(()=>{ if(initial) setForm(prev=>({...prev, ...initial})) }, [initial]);
  function update(k, v){ setForm(s=>({ ...s, [k]: v })); }

  return (
    <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={(e)=>{e.preventDefault(); onSubmit(form);}}>
      <input className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 md:col-span-2" placeholder="Title"
             value={form.title} onChange={e=>update("title", e.target.value)} required />
      <input className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" placeholder="Due date (YYYY-MM-DD)"
             value={form.due_date||""} onChange={e=>update("due_date", e.target.value)} />
      <input className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" placeholder="Remind at (YYYY-MM-DD HH:MM:SS)"
             value={form.remind_at||""} onChange={e=>update("remind_at", e.target.value)} />
      <textarea rows="3" className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 md:col-span-2"
                placeholder="Description" value={form.description||""} onChange={e=>update("description", e.target.value)} />
      <div className="flex items-center gap-3">
        <label>Priority</label>
        <select className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
                value={form.priority} onChange={e=>update("priority", Number(e.target.value))}>
          {[1,2,3,4,5].map(p=><option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <button className="rounded-lg px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white md:col-span-2">{submitLabel}</button>
    </form>
  );
}
