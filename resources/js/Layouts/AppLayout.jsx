import { Link } from '@inertiajs/react';

export default function AppLayout({ children }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  function logout() {
    if (token) {
      fetch(`${import.meta.env.VITE_API_BASE_URL || window.location.origin}/api/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(()=>{});
    }
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  return (
    <div>
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/tasks" className="font-semibold text-lg tracking-wide">Todo (Inertia)</Link> {/* ✅ */}
          {token && (
            <>
              <Link href="/tasks" className="px-3 py-1 rounded-full bg-slate-700 text-sm">Tasks</Link>
              <Link href="/due-soon" className="px-3 py-1 rounded-full bg-slate-700 text-sm">Due Soon</Link>
              <Link href="/admin/settings" className="px-3 py-1 rounded-full bg-slate-700 text-sm">Admin</Link>
            </>
          )}
          <div className="ml-auto flex items-center gap-3">
            {token ? (
              <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white" onClick={logout}>Logout</button>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white">Login</Link>
                <Link href="/register" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white">Register</Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">{children}</main>
    </div>
  );
}
