// resources/js/Pages/Auth/Login.jsx
import { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout.jsx";
import { api } from "../../utils/apiClient.js";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy]   = useState(false);
  const [err, setErr]     = useState("");

  const onChange = e => setForm(p=>({...p, [e.target.name]: e.target.value}));

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const res = await api.post("/api/login", form);
      localStorage.setItem("token", res.data.token);
      if (res.data.user?.is_admin) {
        window.location.href = "/admin";   // ✅ সেফ রুট
      } else {
        window.location.href = "/tasks";
      }
    } catch (e) {
      setErr(e?.response?.data?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppLayout>
      <Head title="Login" />
      <div className="max-w-md mx-auto bg-slate-800/70 p-6 rounded-2xl border border-slate-700">
        <h1 className="text-xl font-semibold mb-4">Sign in</h1>
        {err && <div className="mb-3 text-sm text-red-400">{err}</div>}
        <form onSubmit={onSubmit} className="space-y-3">
          <input className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
                 name="email" type="email" placeholder="Email"
                 value={form.email} onChange={onChange} required />
          <input className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
                 name="password" type="password" placeholder="Password"
                 value={form.password} onChange={onChange} required />
          <button disabled={busy} className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 py-2">
            {busy ? "Signing in..." : "Login"}
          </button>
        </form>
        <div className="mt-3 text-sm">
          No account? <Link className="underline" href="/register">Register</Link>
        </div>
      </div>
    </AppLayout>
  );
}
