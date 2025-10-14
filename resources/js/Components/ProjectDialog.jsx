import { useEffect, useRef, useState } from "react";

/**
 * Smart Create Project dialog
 * - Clean white card
 * - Black input text & subtle placeholders
 * - Disabled "Create" until name is entered
 * - Esc to close, overlay click to close
 */
export default function ProjectDialog({ open, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  // Reset form when closing
  useEffect(() => {
    if (!open) {
      setName("");
      setDescription("");
      setSubmitting(false);
      setError("");
    }
  }, [open]);

  // Focus name field + ESC to close
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); window.removeEventListener("keydown", onKey); };
  }, [open, onClose]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Project name is required.");
      inputRef.current?.focus();
      return;
    }
    try {
      setSubmitting(true);
      await onCreate({ name: trimmed, description: description.trim() || null });
      onClose?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create project.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Create Project</h3>
            <p className="text-xs text-gray-500 mt-0.5">Add a short name and optional description.</p>
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
        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Project name <span className="text-red-500">*</span>
            </label>
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mobile App"
              className="
                w-full rounded-lg border border-gray-300 bg-white
                px-3 py-2 text-[15px]
                text-slate-900 placeholder:text-gray-400
                focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500
              "
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="
                w-full rounded-lg border border-gray-300 bg-white
                px-3 py-2 text-[15px]
                text-slate-900 placeholder:text-gray-400
                focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500
              "
              placeholder="A short note about the project…"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}

          {/* Footer */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || submitting}
              className="
                px-4 py-2 rounded-lg text-sm font-medium text-white
                bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed
                shadow-sm
              "
            >
              {submitting ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
