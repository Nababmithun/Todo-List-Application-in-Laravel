import { useEffect, useRef, useState } from "react";
import { api } from "../utils/apiClient.js";

export default function UserPicker({ value, onChange, placeholder = "Search users by name/email…" }) {
  const [q, setQ] = useState("");
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!q.trim()) { setList([]); return; }
    const t = setTimeout(async () => {
      try {
        const r = await api.get("/api/users/search", { params: { q }});
        setList(r.data?.data || r.data || []); // allow both
        setOpen(true);
      } catch {
        setList([]);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div ref={boxRef} className="relative">
      {value ? (
        <div className="flex items-center justify-between rounded-lg border border-gray-300 px-3 py-2">
          <div className="min-w-0">
            <div className="font-medium truncate">{value.name}</div>
            <div className="text-xs text-gray-500 truncate">{value.email}</div>
          </div>
          <button className="text-sm px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
                  onClick={() => onChange(null)}>
            Clear
          </button>
        </div>
      ) : (
        <input
          value={q}
          onChange={e=>setQ(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
          onFocus={()=> q && setOpen(true)}
        />
      )}

      {open && list.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-lg border border-gray-200 shadow">
          <ul className="max-h-56 overflow-auto">
            {list.map(u => (
              <li key={u.id}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-gray-50"
                  onClick={() => { onChange(u); setOpen(false); setQ(""); }}
                >
                  <div className="font-medium">{u.name}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
