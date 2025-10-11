import { useEffect } from "react";

/**
 * Props:
 *  - open        : boolean
 *  - title       : string
 *  - message     : string | JSX
 *  - confirmText : string (default "Yes")
 *  - cancelText  : string (default "No")
 *  - onClose     : () => void
 *  - onConfirm   : () => Promise|void
 */
export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Yes",
  cancelText = "No",
  onClose = () => {},
  onConfirm = () => {},
}) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* modal */}
      <div
        role="dialog"
        aria-modal="true"
        className="absolute inset-0 flex items-center justify-center p-4"
      >
        <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-xl">
          <div className="px-5 py-4 border-b border-slate-800">
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <div className="px-5 py-4 text-sm text-slate-200/90">
            {typeof message === "string" ? <p>{message}</p> : message}
          </div>
          <div className="px-5 py-4 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600"
            >
              {cancelText}
            </button>
            <button
              onClick={async () => {
                await onConfirm();
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
