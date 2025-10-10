import { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout.jsx";
import { api } from "../../utils/apiClient.js";

export default function Login() {
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("secret123");
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      const res = await api.post("/api/login", { email, password });
      localStorage.setItem("token", res.data.token);
      window.location.href = "/tasks";
    } catch (e) {
      setErr(e?.response?.data?.message || "Login failed");
    }
  }

  return (
    <AppLayout>
      <Head title="Login" />
      <div className="max-w-md mx-auto bg-slate-800/70 rounded-2xl shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Login</h2>
        {err && <div className="mb-3 text-red-400">{err}</div>}
        <form className="space-y-3" onSubmit={submit}>
          <input className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
                 placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
                 placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="w-full rounded-lg px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white">Login</button>
        </form>
        <p className="mt-3 text-sm">New here? <Link href="/register" className="text-blue-400">Register</Link></p>
      </div>
    </AppLayout>
  );
}
