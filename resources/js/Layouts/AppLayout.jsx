// resources/js/Layouts/AppLayout.jsx
import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import SplashScreen from '../Components/SplashScreen.jsx';
import { api } from '../utils/apiClient.js';

export default function AppLayout({ children }) {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);      // profile dropdown
  const [mobileOpen, setMobileOpen] = useState(false);  // mobile nav
  const menuRef = useRef(null);
  const mobileRef = useRef(null);

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

  // close profile dropdown on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [menuOpen]);

  // close mobile menu on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (!mobileRef.current) return;
      if (!mobileRef.current.contains(e.target)) setMobileOpen(false);
    }
    if (mobileOpen) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [mobileOpen]);

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
  const NavLink = ({ href, label, onClick, className = '' }) => {
    const active = pathname === href || (href !== '/' && pathname.startsWith(href));
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`px-3 py-1 rounded-full text-sm transition
          ${active ? 'bg-slate-700 text-white' : 'bg-slate-800/70 text-slate-200 hover:bg-slate-700'}
          ${className}`}
      >
        {label}
      </Link>
    );
  };

  // brand → admin হলে /admin, নাহলে /tasks (আপনার আগের লজিক অপরিবর্তিত)
  const brandHref = user?.is_admin ? '/admin' : '/tasks';

  const brand = (
    <Link
      href={brandHref}
      className="font-semibold text-lg tracking-wide bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent"
    >
      Project Task Application
    </Link>
  );

  // role-wise nav items (আগের মতোই)
  const navItems = (() => {
    if (!token) return [];
    if (user?.is_admin) {
      return [
        { href: '/admin', label: 'Admin' },
        { href: '/profile', label: 'Profile' },
      ];
    }
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

      <header className="sticky top-0 z-20 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            {/* Mobile hamburger (design same, শুধু যোগ করা হলো) */}
            {token && (
              <button
                className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-800/70"
                aria-label="Open menu"
                onClick={() => setMobileOpen(true)}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            )}

            {brand}

            {/* Desktop nav (unchanged) */}
            {token && (
              <nav className="hidden md:flex items-center gap-2 ml-2">
                {navItems.map(item => (
                  <NavLink key={item.href} href={item.href} label={item.label} />
                ))}
              </nav>
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
        </div>

        {/* Mobile slide-down menu (same style palette) */}
        {token && mobileOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900/98" ref={mobileRef}>
            <div className="max-w-5xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm opacity-80">Menu</span>
                <button
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-800/70"
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {navItems.map(item => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    className="w-full text-center"
                    onClick={() => setMobileOpen(false)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">{children}</main>
    </div>
  );
}
