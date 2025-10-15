// resources/js/Components/ProjectMembersDialog.jsx
import { useEffect, useRef, useState } from "react";
import { api } from "../utils/apiClient.js";

export default function ProjectMembersDialog({ open, projectId, onClose }) {
  const [members, setMembers] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const inputRef = useRef(null);

  function isValidEmail(v) {
    if (!v) return false;
    // Very simple email check is fine here; backend will do real validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  }

  async function loadMembers() {
    setLoadingList(true);
    setError("");
    setInfo("");
    try {
      const r = await api.get(`/api/projects/${projectId}/members`);
      const arr = Array.isArray(r.data) ? r.data : r.data?.data || [];
      setMembers(arr);
    } catch (e) {
      setError(e?.response?.data?.message || "Could not load members.");
      setMembers([]);
    } finally {
      setLoadingList(false);
    }
  }

  async function addMember(e) {
    e?.preventDefault?.();
    setError("");
    setInfo("");

    const val = email.trim();
    if (!isValidEmail(val)) {
      setError("Please enter a valid email address.");
      inputRef.current?.focus();
      return;
    }

    try {
      setAdding(true);
      await api.post(`/api/projects/${projectId}/members`, { email: val });
      setInfo("Member added.");
      setEmail("");
      await loadMembers(); // refresh list
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          (e?.response?.status === 404
            ? "User not found for this email."
            : "Failed to add member.")
      );
    } finally {
      setAdding(false);
    }
  }

  async function removeMember(userId) {
    if (!confirm("Remove this member?")) return;
    setError("");
    setInfo("");
    try {
      await api.delete(`/api/projects/${projectId}/members/${userId}`);
      setInfo("Member removed.");
      await loadMembers();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to remove member.");
    }
  }

  // Reset when close
  useEffect(() => {
    if (!open) {
      setEmail("");
      setAdding(false);
      setError("");
      setInfo("");
      setMembers([]);
      return;
    }
    // When opened: focus + load
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    loadMembers();
    const onKey = (ev) => {
      if (ev.key === "Escape") onClose?.();
      if (ev.key === "Enter" && isValidEmail(email) && !adding) {
        addMember();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, projectId]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Project Members</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Add or remove members who can work under this project.
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Add form */}
          <form onSubmit={addMember} className="flex flex-col sm:flex-row gap-2">
            <input
              ref={inputRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="
                w-full rounded-lg border border-gray-300 bg-white
                px-3 py-2 text-[15px]
                text-slate-900 placeholder:text-gray-400
                focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500
              "
            />
            <button
              type="submit"
              disabled={!isValidEmail(email) || adding}
              className="
                sm:w-auto w-full px-4 py-2 rounded-lg text-sm font-medium text-white
                bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed
                shadow-sm
              "
            >
              {adding ? "Adding…" : "Add Member"}
            </button>
          </form>

          {/* Alerts */}
          {error && <div className="text-sm text-red-600">{error}</div>}
          {info && <div className="text-sm text-emerald-600">{info}</div>}

          {/* Members list */}
          <div className="rounded-xl border border-gray-200">
            <div className="px-4 py-2 text-xs font-medium text-gray-600 border-b border-gray-200 bg-gray-50">
              Members ({members.length})
            </div>
            {loadingList ? (
              <div className="p-4 text-gray-500 text-sm">Loading…</div>
            ) : members.length === 0 ? (
              <div className="p-4 text-gray-500 text-sm">No members yet.</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {members.map((m) => (
                  <li key={m.id} className="px-4 py-3 flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {m.name || m.email}
                      </div>
                      <div className="text-xs text-gray-500 truncate">{m.email}</div>
                    </div>
                    <button
                      onClick={() => removeMember(m.id)}
                      className="px-3 py-1.5 rounded-lg text-sm text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
