// resources/js/Components/SplashScreen.jsx
import { useEffect, useState } from "react";

/**
 * SplashScreen
 * - প্রথমবার সাইট লোড হলে 1.8s জন্য প্রফেশনাল লোডিং স্ক্রিন দেখায়
 * - sessionStorage দিয়ে একবার দেখানো হয় (refresh করলে আর দেখাবে না)
 * - props.force === true দিলে জোর করে দেখানো যাবে
 */
export default function SplashScreen({ force = false, duration = 1800 }) {
  const [show, setShow] = useState(force || !sessionStorage.getItem("seen_splash"));

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem("seen_splash", "1");
    }, duration);
    return () => clearTimeout(t);
  }, [show, duration]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950">
      {/* Nice gradient ring + logo */}
      <div className="relative flex flex-col items-center">
        <div className="h-28 w-28 rounded-full bg-gradient-to-tr from-indigo-500 via-blue-500 to-cyan-400 animate-spin-slow shadow-[0_0_40px_rgba(59,130,246,0.35)]" />
        <div className="absolute h-24 w-24 rounded-full bg-slate-950 flex items-center justify-center shadow-inner">
          <svg width="40" height="40" viewBox="0 0 24 24" className="animate-float">
            <path d="M9 11l3 3L22 4" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5l-4 3V5a2 2 0 0 1 2-2h12" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>

        <div className="mt-6 text-center">
          <div className="text-2xl font-semibold bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Todo (Inertia)
          </div>
          <div className="mt-2 text-sm text-slate-400 tracking-wide animate-pulse">
            Preparing workspace…
          </div>
        </div>
      </div>

      {/* Local CSS for nice animations */}
      <style>{`
        .animate-spin-slow { animation: spin 2.8s linear infinite; }
        .animate-float { animation: float 2.2s ease-in-out infinite; color: #60a5fa; }
        @keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
        @keyframes float { 0%,100%{ transform: translateY(0);} 50%{ transform: translateY(-6px);} }
      `}</style>
    </div>
  );
}
