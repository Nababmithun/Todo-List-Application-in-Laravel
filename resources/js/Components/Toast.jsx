import { useEffect } from "react";

export default function Toast({ type="error", message="", onClose=()=>{}, duration=3000 }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  if (!message) return null;

  const base = "fixed right-4 top-4 z-[100] rounded-lg shadow px-4 py-3";
  const color = type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white";

  return (
    <div className={`${base} ${color}`}>
      <div className="font-medium">{message}</div>
    </div>
  );
}
