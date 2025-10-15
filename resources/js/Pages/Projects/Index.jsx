// resources/js/Pages/Projects/Index.jsx
import { useEffect, useState } from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout.jsx";
import { api } from "../../utils/apiClient.js";
import Toast from "../../Components/Toast.jsx";

export default function ProjectsIndex() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [q, setQ] = useState("");
  const [toast, setToast] = useState({ type: "success", message: "" });

  async function load() {
    setLoading(true);
    try {
      const r = await api.get("/api/projects", { params: { q: q || undefined } });
      setProjects(r.data);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setQ("");
    load();
  }

  async function createQuick() {
    const name = prompt("Project name?");
    if (!name) return;
    try {
      const r = await api.post("/api/projects", { name: name.trim() });
      setProjects((prev) => [r.data, ...prev]);
      setToast({ type: "success", message: "Project created" });
    } catch (e) {
      setToast({
        type: "error",
        message: e?.response?.data?.message || "Failed",
      });
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    load();
  }, []);

  function onKey(e) {
    if (e.key === "Enter") load();
  }

  return (
    <AppLayout>
      <Head title="Projects" />
      <Toast
        {...toast}
        onClose={() => setToast({ type: "success", message: "" })}
      />

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3 justify-between">
        {/* Left: Title */}
        <h1 className="text-xl font-semibold">Projects</h1>

        {/* Middle: Search controls (wrap nicely on mobile) */}
        <div className="order-last w-full sm:order-none sm:w-auto flex items-center gap-2">
          <input
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 w-full sm:w-64 md:w-80"
            placeholder="Search projects..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
          />
          <button
            className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500"
            onClick={load}
          >
            Search
          </button>
          <button
            className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600"
            onClick={reset}
          >
            Reset
          </button>
        </div>

        {/* Right: New Project */}
        <div className="ml-auto">
          <button
            className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500"
            onClick={createQuick}
          >
            + New Project
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="min-h-[120px] flex items-center justify-center">
          <div className="h-6 w-6 mr-3 rounded-full border-2 border-slate-500 border-t-transparent animate-spin" />
          Loading projects…
        </div>
      ) : projects.length === 0 ? (
        <div className="opacity-70">No projects</div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {projects.map((p) => (
            <li
              key={p.id}
              className="bg-slate-800/70 rounded-xl p-4 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="font-medium truncate">{p.name}</div>
                {p.description && (
                  <div className="text-xs opacity-70 truncate">{p.description}</div>
                )}
              </div>
              <Link
                href={`/projects/${p.id}`}
                className="shrink-0 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600"
              >
                Open
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppLayout>
  );
}
