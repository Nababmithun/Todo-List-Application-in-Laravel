// resources/js/Pages/Auth/Register.jsx
import { useEffect, useState } from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout.jsx";
import { api } from "../../utils/apiClient.js";

export default function Register() {
  const [name, setName] = useState("Demo User");
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("secret123");
  const [mobile, setMobile] = useState("");
  const [gender, setGender] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) window.location.href = "/tasks";
  }, []);

  function handleAvatar(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatar(f);
    setPreview(URL.createObjectURL(f));
  }

  function onFocusClear(setter) {
    return () => setter((v) => (v === "Demo User" || v === "demo@example.com" || v === "secret123" ? "" : v));
  }

  async function submit(e) {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    setLoading(true);
    try {
      const form = new FormData();
      form.append("name", name);
      form.append("email", email);
      form.append("password", password);
      if (mobile) form.append("mobile", mobile);
      if (gender) form.append("gender", gender);
      if (avatar) form.append("avatar", avatar);

      await api.post("/api/register", form, { headers: { "Content-Type": "multipart/form-data" } });

      // ✅ Register সফল: টোকেন সেভ নয়; Login-এ পাঠাও
      setMsg({ type: "success", text: "Registration successful! Redirecting to login…" });
      setTimeout(() => (window.location.href = "/login"), 1200);
    } catch (e) {
      const text =
        e?.response?.data?.message ||
        (e?.response?.status === 422 ? "Validation failed (maybe email or mobile already taken)" : "Register failed");
      setMsg({ type: "error", text });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <Head title="Register" />
      <div className="max-w-lg mx-auto bg-slate-800/70 rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-1">Create account</h2>
        <p className="text-sm text-slate-400 mb-4">Join to manage your tasks & subtasks easily.</p>

        {msg.text && (
          <div className={`mb-3 text-sm px-3 py-2 rounded ${msg.type === "success" ? "bg-emerald-600/20 text-emerald-300" : "bg-red-600/20 text-red-300"}`}>
            {msg.text}
          </div>
        )}

        <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={submit}>
          <input className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 md:col-span-2"
                 placeholder="Full name" autoComplete="name"
                 value={name} onChange={e=>setName(e.target.value)} onFocus={onFocusClear(setName)} />
          <input className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 md:col-span-2"
                 placeholder="Email" autoComplete="email"
                 value={email} onChange={e=>setEmail(e.target.value)} onFocus={onFocusClear(setEmail)} />
          <input className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 md:col-span-2"
                 placeholder="Password" type="password" autoComplete="new-password"
                 value={password} onChange={e=>setPassword(e.target.value)} onFocus={onFocusClear(setPassword)} />

          <input className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
                 placeholder="Mobile (e.g. 01xxxxxxxxx)" inputMode="numeric" pattern="[0-9]*"
                 value={mobile} onChange={e=>setMobile(e.target.value.replace(/[^\d]/g,''))} />

          <select className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
                  value={gender} onChange={e=>setGender(e.target.value)}>
            <option value="">Gender (optional)</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm opacity-80">Profile image (max 2MB)</label>
            <input type="file" accept="image/*"
                   className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                   onChange={handleAvatar} />
            {preview && (
              <img src={preview} alt="preview" className="mt-2 h-24 w-24 rounded-full object-cover border border-slate-700" />
            )}
          </div>

          <button disabled={loading}
                  className="rounded-lg px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white md:col-span-2 disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>

        <p className="mt-3 text-sm">Already have an account? <Link href="/login" className="text-blue-400">Log in</Link></p>
      </div>
    </AppLayout>
  );
}
