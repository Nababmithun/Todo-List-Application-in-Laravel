// resources/js/Pages/Profile/Index.jsx
import { useEffect, useState } from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout.jsx";
import { api } from "../../utils/apiClient.js";
import ProfileCard from "../../Components/ProfileCard.jsx";

export default function ProfileIndex() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=> {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/login'; return; }
    async function load() {
      try {
        const res = await api.get('/api/me');
        setUser(res.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <Head title="Profile" />
        <div className="min-h-[50vh] flex items-center justify-center text-slate-300">
          <div className="h-6 w-6 mr-3 rounded-full border-2 border-slate-500 border-t-transparent animate-spin" />
          Loading profile…
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Head title="Profile" />
      <div className="flex items-center gap-3 mb-2">
        <Link href="/tasks" className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700">&larr; Back</Link>
        <h2 className="text-xl font-semibold">Your Profile</h2>
      </div>

      <ProfileCard user={user} />

      <div className="bg-slate-800/70 rounded-2xl shadow p-4">
        <h3 className="font-semibold mb-2">Account details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="bg-slate-800/60 rounded-xl p-3">
            <div className="opacity-70">Name</div>
            <div className="font-medium">{user?.name || '—'}</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3">
            <div className="opacity-70">Email</div>
            <div className="font-medium">{user?.email || '—'}</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3">
            <div className="opacity-70">Mobile</div>
            <div className="font-medium">{user?.mobile || '—'}</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3">
            <div className="opacity-70">Gender</div>
            <div className="font-medium">{user?.gender || '—'}</div>
          </div>
        </div>
        <p className="mt-3 text-xs opacity-70">Note: This page is read-only.</p>
      </div>
    </AppLayout>
  );
}
