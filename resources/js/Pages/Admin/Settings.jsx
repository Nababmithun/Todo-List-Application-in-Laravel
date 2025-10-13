// resources/js/Pages/Admin/Settings.jsx
import { useEffect, useState } from "react";
import { Head } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout.jsx";
import { api } from "../../utils/apiClient.js";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const r = await api.get("/api/admin/settings");
      setSettings(r.data);
    } catch (e) {
      const code = e?.response?.status;
      if (code === 403) setError("You are not authorized to view admin settings.");
      else if (code === 401) setError("Please login again.");
      else setError(e?.response?.data?.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function save() {
    try {
      await api.put("/api/admin/settings", settings);
      alert("Saved!");
    } catch (e) {
      alert(e?.response?.data?.message || "Save failed");
    }
  }

  return (
    <AppLayout>
      <Head title="Admin Settings" />
      <div className="bg-slate-800/70 rounded-2xl p-6 border border-slate-700">
        <h1 className="text-xl font-semibold mb-4">Admin Settings</h1>
        {loading && <div>Loading…</div>}
        {!loading && error && <div className="text-red-400">{error}</div>}
        {!loading && !error && (
          <>
            <pre className="bg-slate-900 p-3 rounded overflow-auto">{JSON.stringify(settings, null, 2)}</pre>
            <button onClick={save} className="mt-3 px-4 py-2 rounded bg-blue-600 hover:bg-blue-500">
              Save
            </button>
          </>
        )}
      </div>
    </AppLayout>
  );
}
