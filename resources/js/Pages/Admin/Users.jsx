import { useEffect, useState } from "react";
import AppLayout from "../../Layouts/AppLayout.jsx";
import { Head } from "@inertiajs/react";
import { api } from "../../utils/apiClient.js";

export default function AdminUsers() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const perPage = 10;

  async function load(page=1) {
    setLoading(true);
    try {
      const r = await api.get('/api/admin/users', { params: { q, per_page: perPage, page }});
      setRows(r.data.data || r.data); // pagination বা flat — দুইটাই সাপোর্ট
      setMeta(r.data.meta || null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=>{ load(1); }, []);

  return (
    <AppLayout>
      <Head title="Admin • Users" />
      <h1 className="text-xl font-semibold mb-4">Users</h1>

      <div className="flex items-center gap-2 mb-3">
        <input className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
               value={q} onChange={e=>setQ(e.target.value)} placeholder="Search name/email/mobile"/>
        <button className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500" onClick={()=>load(1)}>Search</button>
      </div>

      <div className="rounded-2xl bg-slate-800/70 border border-slate-700 p-4">
        {loading ? 'Loading…' : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-400">
                <tr>
                  <th className="py-2">#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {(rows.data || rows).map(u=>(
                  <tr key={u.id} className="border-t border-slate-700/60">
                    <td className="py-2">{u.id}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.mobile || '—'}</td>
                    <td>{u.is_admin ? 'Admin' : 'User'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta && (
          <div className="flex gap-2 mt-3">
            <button className="px-3 py-1.5 rounded bg-slate-700" disabled={meta.current_page<=1} onClick={()=>load(meta.current_page-1)}>Prev</button>
            <div className="px-3 py-1.5 rounded bg-slate-700">Page {meta.current_page} / {meta.last_page}</div>
            <button className="px-3 py-1.5 rounded bg-slate-700" disabled={meta.current_page>=meta.last_page} onClick={()=>load(meta.current_page+1)}>Next</button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
