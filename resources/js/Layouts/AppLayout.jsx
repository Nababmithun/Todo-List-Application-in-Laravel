// resources/js/Layouts/AppLayout.jsx
import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import SplashScreen from '../Components/SplashScreen.jsx';
import { api } from '../utils/apiClient.js';

export default function AppLayout({ children }) {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';

  // current user
  useEffect(() => {
    async function load() {
      try {
        if (!token) return;
        const res = await api.get('/api/me');
        setUser(res.data);
      } catch {
        // ignore; interceptor 401 হলে login এ পাঠাবে
      }
    }
    load();
  }, [token]);

  // close dropdown on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [menuOpen]);

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

  // active nav helper
  const NavLink = ({ href, label, onClick }) => {
    const active = pathname === href || (href !== '/' && pathname.startsWith(href));
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`px-3 py-1 rounded-full text-sm transition ${
          active ? 'bg-slate-700 text-white' : 'bg-slate-800/70 text-slate-200 hover:bg-slate-700'
        }`}
      >
        {label}
      </Link>
    );
  };

  // brand → admin হলে /admin, নাহলে /tasks
  const brandHref = user?.is_admin ? '/admin' : '/tasks';

  const brand = (
    <Link
      href={brandHref}
      className="font-semibold text-lg tracking-wide bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent"
    >
      Project Task Application
    </Link>
  );

  // 🔑 MAIN CHANGE: role-wise nav items
  const navItems = (() => {
    if (!token) return [];
    if (user?.is_admin) {
      // Admin user: only Admin + Profile
      return [
        { href: '/admin', label: 'Admin' },
        { href: '/profile', label: 'Profile' },
      ];
    }
    // Normal user: full app
    return [
      { href: '/tasks', label: 'Tasks' },
      { href: '/projects', label: 'Projects' },
      { href: '/complete', label: 'Complete Task' },
      { href: '/due-soon', label: 'Due Soon' },
      { href: '/profile', label: 'Profile' },
    ];
  })();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <SplashScreen />

      <header className="sticky top-0 z-10 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          {brand}

          {/* Desktop nav */}
          {token && (
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map(item => (
                <NavLink key={item.href} href={item.href} label={item.label} />
              ))}
            </nav>
          )}

          {/* Mobile nav */}
          {token && (
            <div className="md:hidden ml-1 relative">
              <details className="relative">
                <summary className="list-none cursor-pointer px-3 py-1 rounded-full bg-slate-800/70 text-sm">
                  Menu
                </summary>
                <div className="absolute mt-2 left-0 w-44 rounded-xl bg-slate-900 border border-slate-700 shadow p-2 space-y-1">
                  {navItems.map(item => (
                    <NavLink
                      key={item.href}
                      href={item.href}
                      label={item.label}
                      onClick={() => (document.activeElement?.blur?.(), null)}
                    />
                  ))}
                </div>
              </details>
            </div>
          )}

          <div className="ml-auto flex items-center gap-3">
            {token ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(v=>!v)}
                  className="flex items-center gap-2"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  <img
                    src={
                      user?.avatar_url ||
                      `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
                        user?.name || user?.email || 'U'
                      )}`
                    }
                    alt="avatar"
                    className="h-8 w-8 rounded-full border border-slate-700"
                  />
                  <span className="text-sm opacity-90 hidden sm:inline">{user?.name || 'Profile'}</span>
                </button>
                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-44 rounded-xl bg-slate-900 border border-slate-700 shadow overflow-hidden"
                  >
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm hover:bg-slate-800"
                      onClick={() => setMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-slate-800"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">{children}</main>
    </div>
  );
}
