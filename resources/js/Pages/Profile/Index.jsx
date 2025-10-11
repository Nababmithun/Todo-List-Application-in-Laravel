// resources/js/Pages/Profile/Index.jsx
import { useEffect, useState } from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout.jsx";
import { api } from "../../utils/apiClient.js";

function StatCard({ title, value, hint }) {
  return (
    <div className="rounded-2xl bg-slate-800/70 border border-slate-700 p-4 shadow hover:shadow-lg transition">
      <div className="text-xs uppercase tracking-wide text-slate-400">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {hint && <div className="text-xs mt-1 text-slate-400">{hint}</div>}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="font-medium">{value || "—"}</div>
    </div>
  );
}

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-slate-700/40 ${className}`} />;
}

export default function ProfileIndex() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    (async () => {
      try {
        const [meRes, statsRes, recentRes] = await Promise.all([
          api.get("/api/me"),
          api.get("/api/tasks-stats"),
          api.get("/api/tasks", {
            params: {
              per_page: 5,
              page: 1,
              // সর্বশেষ তৈরি—ডিফল্ট sort: controller-এ orderByDesc('id')
            },
          }),
        ]);
        setUser(meRes.data);
        setStats(statsRes.data);
        setRecent(recentRes.data?.data || []);
      } catch (e) {
        // token invalid হলে login এ পাঠাও
        localStorage.removeItem("token");
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const avatar =
    user?.avatar_url ||
    `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
      user?.name || user?.email || "U"
    )}`;

  return (
    <AppLayout>
      <Head title="Profile" />

      {/* Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800">
        <div className="h-36 bg-gradient-to-r from-indigo-700 via-fuchsia-600 to-cyan-600" />
        <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
             style={{ backgroundImage: "radial-gradient(circle at 20% 10%, rgba(255,255,255,.25), transparent 35%), radial-gradient(circle at 80% 0%, rgba(255,255,255,.18), transparent 25%)" }} />
        <div className="p-6 md:p-8 bg-slate-900">
          <div className="flex items-end gap-5 -mt-16">
            {/* Avatar */}
            {loading ? (
              <Skeleton className="h-24 w-24 rounded-full border border-slate-700" />
            ) : (
              <img
                src={avatar}
                alt="Avatar"
                className="h-24 w-24 rounded-full border-4 border-slate-900 shadow-lg object-cover bg-slate-900"
              />
            )}
            <div className="flex-1">
              {loading ? (
                <>
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </>
              ) : (
                <>
                  <h1 className="text-xl md:text-2xl font-semibold leading-tight">
                    {user?.name}
                  </h1>
                  <p className="text-slate-300/80 text-sm">{user?.email}</p>
                </>
              )}
            </div>

            {!loading && (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/tasks"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow"
                >
                  Go to Tasks
                </Link>
                <Link
                  href="/projects"
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700"
                >
                  View Projects
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {loading ? (
          <>
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24 hidden md:block" />
            <Skeleton className="h-24 hidden md:block" />
          </>
        ) : (
          <>
            <StatCard title="Today Completed" value={stats?.today_completed ?? 0} hint="Tasks finished today" />
            <StatCard title="Upcoming" value={stats?.upcoming_count ?? 0} hint="Due today or later" />
            <StatCard title="Name Length" value={(user?.name || "").length} hint="Just for fun 😄" />
            <StatCard title="Member Since" value={user?.created_at ? new Date(user.created_at).getFullYear() : "—"} hint="Year joined" />
          </>
        )}
      </section>

      {/* Details + Recent */}
      <section className="grid md:grid-cols-3 gap-6">
        {/* Info Panel */}
        <div className="md:col-span-1 space-y-3">
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4">
            <h2 className="text-sm font-semibold mb-3 text-slate-200">Profile Info</h2>
            {loading ? (
              <>
                <Skeleton className="h-14 mb-2" />
                <Skeleton className="h-14 mb-2" />
                <Skeleton className="h-14 mb-2" />
                <Skeleton className="h-14" />
              </>
            ) : (
              <div className="space-y-2">
                <InfoRow label="Full Name" value={user?.name} />
                <InfoRow label="Email" value={user?.email} />
                <InfoRow label="Mobile" value={user?.mobile} />
                <InfoRow label="Gender" value={user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : "—"} />
                <InfoRow
                  label="Joined"
                  value={user?.created_at ? new Date(user.created_at).toLocaleString() : "—"}
                />
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4">
            <h2 className="text-sm font-semibold mb-3 text-slate-200">Quick Actions</h2>
            <div className="flex flex-wrap gap-2">
              <Link href="/tasks" className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm">
                Create Task
              </Link>
              <Link href="/projects" className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm">
                New Project
              </Link>
              <Link href="/complete" className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm">
                Completed
              </Link>
              <Link href="/due-soon" className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm">
                Due Soon
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="md:col-span-2 rounded-2xl bg-slate-900/70 border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-200">Recent Tasks</h2>
            <Link href="/tasks" className="text-xs opacity-80 hover:opacity-100">View all</Link>
          </div>

          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ) : recent.length === 0 ? (
            <div className="text-slate-400">No tasks yet. Create your first one!</div>
          ) : (
            <ul className="space-y-2">
              {recent.map((t) => (
                <li
                  key={t.id}
                  className="group flex items-center justify-between gap-3 bg-slate-800/60 rounded-xl px-4 py-3 border border-slate-700/60 hover:border-slate-600 transition"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/tasks/${t.id}`}
                      className={`font-medium truncate block ${
                        t.is_completed ? "line-through opacity-70" : "opacity-95 group-hover:opacity-100"
                      }`}
                      title={t.title}
                    >
                      {t.title}
                    </Link>
                    <div className="text-xs opacity-70 truncate">
                      {t.category || "—"} • Priority: {t.priority} •
                      {" "}Due: {t.due_date?.slice(0, 10) || "—"}
                    </div>
                  </div>
                  <div className="text-xs shrink-0">
                    <span
                      className={`px-2 py-1 rounded-lg border ${
                        t.is_completed
                          ? "border-emerald-600/50 bg-emerald-600/10 text-emerald-300"
                          : "border-amber-600/50 bg-amber-600/10 text-amber-300"
                      }`}
                    >
                      {t.is_completed ? "Completed" : "Pending"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </AppLayout>
  );
}
