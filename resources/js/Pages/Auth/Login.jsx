import { useEffect, useState } from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout.jsx";
import { api } from "../../utils/apiClient.js";
import Toast from "../../Components/Toast.jsx";
import FullScreenLoader from "../../Components/FullScreenLoader.jsx";

export default function Login() {
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("secret123");
  const [toast, setToast] = useState({ type: "error", message: "" });
  const [ready, setReady] = useState(false);   // ✅ 2s পরে ফর্ম দেখাও

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // আগেই লগইন থাকলে সরাসরি tasks এ
      window.location.href = "/tasks";
      return;
    }
    // 2 সেকেন্ড লোডিং
    const t = setTimeout(() => setReady(true), 2000);
    return () => clearTimeout(t);
  }, []);

  async function submit(e) {
    e.preventDefault();
    setToast({ type: "error", message: "" });
    try {
      const res = await api.post("/api/login", { email, password });
      localStorage.setItem("token", res.data.token);
      window.location.href = "/tasks";
    } catch (e) {
      const msg = e?.response?.data?.message || "Login failed";
      setToast({ type: "error", message: msg });
    }
  }

  return (
    <AppLayout>
      <Head title="Login" />
      <Toast {...toast} onClose={()=>setToast({type:"error", message:""})} />

      {/* ✅ 2s আগে শুধু লোডার দেখাও */}
      {!ready ? (
        <FullScreenLoader text="Preparing login..." />
      ) : (
        <div className="max-w-md mx-auto bg-slate-800/70 rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Login</h2>
          <form className="space-y-3" onSubmit={submit}>
            <input className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
                   placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
            <input className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
                   placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
            <button className="w-full rounded-lg px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white">Log in</button>
          </form>
          <p className="mt-3 text-sm">New here? <Link href="/register" className="text-blue-400">Create account</Link></p>
        </div>
      )}
    </AppLayout>
  );
}
