import { useEffect, useState } from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout.jsx";
import { api } from "../../utils/apiClient.js";
import Toast from "../../Components/Toast.jsx";

export default function Register() {
  const [name, setName] = useState("Demo User");
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("secret123");
  const [toast, setToast] = useState({ type: "error", message: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) window.location.href = "/tasks";
  }, []);

  async function submit(e) {
    e.preventDefault();
    setToast({ type: "error", message: "" });
    try {
      const res = await api.post("/api/register", { name, email, password });
      localStorage.setItem("token", res.data.token);
      setToast({ type: "success", message: "Account created!" });
      window.location.href = "/tasks";
    } catch (e) {
      // 422 হলে same email ইত্যাদি দেখাবে
      const msg = e?.response?.data?.message
        || (e?.response?.status === 422 ? "Validation failed (maybe email already taken)" : "Register failed");
      setToast({ type: "error", message: msg });
    }
  }

  return (
    <AppLayout>
      <Head title="Register" />
      <Toast {...toast} onClose={()=>setToast({type:"error", message:""})} />
      <div className="max-w-md mx-auto bg-slate-800/70 rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Create account</h2>
        <form className="space-y-3" onSubmit={submit}>
          <input className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
                 placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
          <input className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
                 placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
                 placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="w-full rounded-lg px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white">Create account</button>
        </form>
        <p className="mt-3 text-sm">Already have an account? <Link href="/login" className="text-blue-400">Log in</Link></p>
      </div>
    </AppLayout>
  );
}
