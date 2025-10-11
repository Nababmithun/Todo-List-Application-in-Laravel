import { useState } from "react";

export default function ProjectForm({ onSubmit }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function submit(e) {
    e.preventDefault();
    await onSubmit({ name, description });
    setName("");
    setDescription("");
  }

  return (
    <form className="grid grid-cols-1 md:grid-cols-3 gap-3" onSubmit={submit}>
      <input className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 md:col-span-2"
             placeholder="Project name" value={name} onChange={e=>setName(e.target.value)} required />
      <button className="rounded-lg px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white">Create</button>
      <textarea className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 md:col-span-3"
                placeholder="Description (optional)" value={description} onChange={e=>setDescription(e.target.value)} />
    </form>
  );
}
