import { useEffect, useState } from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout.jsx";
import { api } from "../../utils/apiClient.js";
import Toast from "../../Components/Toast.jsx";

export default function Login() {
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("secret123");
  const [err, setErr] = useState("");
  const [toast, setToast] = useState({ type:"success", message:"" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) { window.location.href = "/tasks"; return; }
  }, []);

  function onFocusClear(setter) {
    return () => setter((v) => (v === "demo@example.com" || v === "secret123" ? "" : v));
  }

  async function submit(e) {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const res = await api.post("/api/login", { email, password });
      localStorage.setItem("token", res.data.token);
      setToast({ type:"success", message:"Login successful!" });
      setTimeout(() => window.location.href = "/tasks", 800);
    } catch (e) {
      setErr(e?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <Head title="Login" />
      <Toast {...toast} onClose={()=>setToast({type:"success", message:""})} />
      <div className="max-w-md mx-auto bg-slate-800/70 rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-1">Welcome back</h2>
        <p className="text-sm text-slate-400 mb-4">Log in to manage your tasks.</p>
        {err && <div className="mb-3 text-sm px-3 py-2 rounded bg-red-600/20 text-red-300">{err}</div>}
        <form className="space-y-3" onSubmit={submit}>
          <input className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
                 placeholder="Email" autoComplete="email"
                 value={email} onChange={e=>setEmail(e.target.value)} onFocus={onFocusClear(setEmail)} />
          <input className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
                 placeholder="Password" type="password" autoComplete="current-password"
                 value={password} onChange={e=>setPassword(e.target.value)} onFocus={onFocusClear(setPassword)} />
          <button disabled={loading}
                  className="w-full rounded-lg px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-60">
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>
        <p className="mt-3 text-sm">New here? <Link href="/register" className="text-blue-400">Create account</Link></p>
      </div>
    </AppLayout>
  );
}
