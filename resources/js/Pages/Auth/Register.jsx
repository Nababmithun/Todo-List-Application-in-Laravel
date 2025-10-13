import { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout.jsx";
import { api } from "../../utils/apiClient.js";

export default function Register() {
  const [form, setForm] = useState({
    name:"", email:"", password:"",
    mobile:"", gender:"", avatar:null
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState("");
  const [ok, setOk]     = useState("");

  function onChange(e) {
    const { name, value, files } = e.target;
    if (name === "avatar") setForm(p=>({...p, avatar: files?.[0] || null}));
    else setForm(p=>({...p, [name]: value}));
  }

  async function onSubmit(e) {
    e.preventDefault(); setBusy(true); setErr(""); setOk("");
    try {
      const fd = new FormData();
      for (const k of ["name","email","password","mobile","gender"]) {
        if (form[k]) fd.append(k, form[k]);
      }
      if (form.avatar) fd.append("avatar", form.avatar);

      const res = await api.post("/api/register", fd, { headers:{ "Content-Type":"multipart/form-data" }});
      // রেজিস্টারের পর সরাসরি লগইন করতে চাইলে:
      localStorage.setItem("token", res.data.token);
      window.location.href = "/tasks";
      // অথবা শুধু Login পেজে পাঠাতে চাইলে:
      // setOk("Registered successfully. Please login."); setTimeout(()=>window.location.href="/login", 700);
    } catch (e) {
      setErr(e?.response?.data?.message || "Register failed");
      console.warn("Register errors:", e?.response?.data?.errors);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppLayout>
      <Head title="Register" />
      <div className="max-w-md mx-auto bg-slate-800/70 p-6 rounded-2xl border border-slate-700">
        <h1 className="text-xl font-semibold mb-4">Create an account</h1>
        {err && <div className="mb-3 text-sm text-red-400">{err}</div>}
        {ok &&  <div className="mb-3 text-sm text-emerald-400">{ok}</div>}
        <form onSubmit={onSubmit} className="space-y-3">
          <input className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
                 name="name" placeholder="Full name" value={form.name} onChange={onChange} required />
          <input className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
                 name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} required />
          <input className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
                 name="password" type="password" placeholder="Password (min 6)" value={form.password} onChange={onChange} required />
          <div className="grid grid-cols-2 gap-2">
            <input className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
                   name="mobile" placeholder="Mobile (optional)" value={form.mobile} onChange={onChange} />
            <select className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
                    name="gender" value={form.gender} onChange={onChange}>
              <option value="">Gender (optional)</option>
              <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-sm opacity-80">Profile image (optional)</label>
            <input className="mt-1 w-full text-sm" name="avatar" type="file" accept="image/*" onChange={onChange} />
          </div>
          <button disabled={busy}
                  className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 py-2">
            {busy ? "Registering..." : "Register"}
          </button>
        </form>
        <div className="mt-3 text-sm">
          Already have an account? <Link className="underline" href="/login">Login</Link>
        </div>
      </div>
    </AppLayout>
  );
}
