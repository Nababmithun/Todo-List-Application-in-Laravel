import { useEffect, useState } from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout.jsx";
import { api } from "../../utils/apiClient.js";

export default function DueSoon() {
  const [items, setItems] = useState([]);
  const [hours, setHours] = useState(24);

  async function load() {
    const res = await api.get(`/api/tasks-due-soon`, { params: { hours, per_page: 50 }});
    setItems(res.data.data);
  }

  useEffect(()=>{ load(); }, []);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) { if (typeof window !== 'undefined') window.location.href = '/login'; return null; }

  return (
    <AppLayout>
      <Head title="Due Soon" />
      <div className="bg-slate-800/70 rounded-2xl shadow p-4">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold">Due Soon</h2>
          <input className="w-32 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" type="number"
                 value={hours} onChange={e=>setHours(Number(e.target.value))} />
          <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white" onClick={load}>Refresh</button>
        </div>
        <ul className="space-y-2">
          {items.map(t=>(
            <li key={t.id} className="flex items-center justify-between bg-slate-800/60 rounded-xl px-4 py-3">
              <div>
                <Link href={`/tasks/${t.id}`} className="font-medium">{t.title}</Link>
                <div className="text-xs opacity-70">
                  Due: {t.due_date || "—"} • Remind: {t.remind_at?.slice(0,16) || "—"}
                </div>
              </div>
              <Link className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white" href={`/tasks/${t.id}`}>Open</Link>
            </li>
          ))}
          {items.length===0 && <div className="opacity-70">Nothing due soon</div>}
        </ul>
      </div>
    </AppLayout>
  );
}
