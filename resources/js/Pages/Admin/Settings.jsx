import { useEffect, useState } from "react";
import { Head } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout.jsx";
import { api } from "../../utils/apiClient.js";

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    auto_reminders_enabled: true,
    default_reminder_offset_hours: 24,
    priority_offsets: { "1":12, "2":24, "3":24, "4":24, "5":24 }
  });
  const [msg, setMsg] = useState("");

  function update(k, v) { setForm(s => ({...s, [k]: v})); }

  useEffect(() => {
    async function fetch() {
      try {
        const res = await api.get("/api/admin/settings");
        setForm(res.data);
      } finally { setLoading(false); }
    }
    fetch();
  }, []);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) { if (typeof window !== 'undefined') window.location.href = '/login'; return null; }

  async function save() {
    setMsg("");
    const payload = {
      auto_reminders_enabled: !!form.auto_reminders_enabled,
      default_reminder_offset_hours: Number(form.default_reminder_offset_hours),
      priority_offsets: Object.fromEntries(Object.entries(form.priority_offsets||{}).map(([k,v])=>[k, Number(v)])),
    };
    await api.put("/api/admin/settings", payload);
    setMsg("Saved!");
  }

  if (loading) return <AppLayout><div>Loading...</div></AppLayout>;

  return (
    <AppLayout>
      <Head title="Admin Settings" />
      <div className="bg-slate-800/70 rounded-2xl shadow p-4 space-y-4">
        <h2 className="text-lg font-semibold">Admin Settings</h2>

        <label className="flex items-center gap-3">
          <input type="checkbox" checked={!!form.auto_reminders_enabled} onChange={e=>update("auto_reminders_enabled", e.target.checked)} />
          <span>Auto Reminders Enabled</span>
        </label>

        <div>
          <label className="block text-sm mb-1">Default reminder offset (hours)</label>
          <input className="w-40 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" type="number"
                 value={form.default_reminder_offset_hours} onChange={e=>update("default_reminder_offset_hours", e.target.value)} />
        </div>

        <div>
          <label className="block text-sm mb-1">Priority offsets</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[1,2,3,4,5].map(p=>(
              <div key={p} className="space-y-1">
                <div className="text-xs opacity-70">Priority {p}</div>
                <input className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" type="number"
                       value={form.priority_offsets?.[p] ?? form.priority_offsets?.[String(p)] ?? 24}
                       onChange={e=>{
                         const v = e.target.value;
                         update("priority_offsets", { ...(form.priority_offsets||{}), [p]: Number(v) });
                       }} />
              </div>
            ))}
          </div>
        </div>

        <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white" onClick={save}>Save</button>
        {msg && <div className="text-green-400">{msg}</div>}
      </div>
    </AppLayout>
  );
}
