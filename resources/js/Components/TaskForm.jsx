import { useEffect, useMemo, useState } from "react";
import { api } from "../utils/apiClient.js";

/**
 * TaskForm
 * - Project select করলে সেই প্রজেক্টের members ফেচ করে
 * - Assignee dropdown দেখায়
 * - Start / End Dates + Estimated / Worked Hours
 * - Submit শেষে (create mode) ফিল্ডগুলো ক্লিয়ার হয়
 */
export default function TaskForm({
  initial = null,
  projects = [],
  onSubmit,
  submitLabel = "Save",
}) {
  // base fields
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [priority, setPriority] = useState(initial?.priority || "medium");
  const [category, setCategory] = useState(initial?.category || "");

  // NEW: start/end date
  const [startDate, setStartDate] = useState(
    initial?.start_date ? initial.start_date.slice(0, 10) : ""
  );
  const [endDate, setEndDate] = useState(
    initial?.end_date ? initial.end_date.slice(0, 10) : ""
  );

  // NEW: hours
  const [estimated, setEstimated] = useState(
    initial?.estimated_hours ?? ""
  );
  const [worked, setWorked] = useState(
    initial?.worked_hours ?? ""
  );

  // project + assignee
  const [projectId, setProjectId] = useState(
    initial?.project_id ? String(initial.project_id) : ""
  );
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [assigneeId, setAssigneeId] = useState(
    initial?.assignee_id ? String(initial.assignee_id) : ""
  );

  // when initial changes (edit mode re-open)
  useEffect(() => {
    if (!initial) return;
    setTitle(initial.title || "");
    setDescription(initial.description || "");
    setPriority(initial.priority || "medium");
    setCategory(initial.category || "");

    setStartDate(initial?.start_date ? initial.start_date.slice(0, 10) : "");
    setEndDate(initial?.end_date ? initial.end_date.slice(0, 10) : "");
    setEstimated(initial?.estimated_hours ?? "");
    setWorked(initial?.worked_hours ?? "");

    setProjectId(initial?.project_id ? String(initial.project_id) : "");
    setAssigneeId(initial?.assignee_id ? String(initial.assignee_id) : "");
  }, [initial]);

  // 🔧 fetch members when project changes
  useEffect(() => {
    async function loadMembers(pid) {
      if (!pid) {
        setMembers([]);
        setAssigneeId("");
        return;
      }
      setMembersLoading(true);
      try {
        const r = await api.get(`/api/projects/${pid}/members`);
        // response হতে পারে array অথবা {data: []}
        const list = Array.isArray(r.data) ? r.data : (r.data?.data || []);
        setMembers(list);
        // edit mode না হলে default assignee clear
        if (!initial) setAssigneeId("");
      } catch (e) {
        console.warn("members fetch failed:", e?.response?.data || e.message);
        setMembers([]);
        setAssigneeId("");
      } finally {
        setMembersLoading(false);
      }
    }
    loadMembers(projectId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // create mode হলে submit শেষে reset
  function resetIfCreate() {
    if (!initial) {
      setTitle("");
      setDescription("");
      setPriority("medium");
      setCategory("");
      setStartDate("");
      setEndDate("");
      setEstimated("");
      setWorked("");
      // project সিলেক্টটা অনেক সময়ে ইউজার রেখে কাজ করতে চান—ইচ্ছে হলে clear করো
      // setProjectId("");
      setAssigneeId("");
      // members থাকবে, কারণ projectId আগেরটাই; ইউজার চাইলে সাথে সাথে আরেকটা টাস্ক অ্যাসাইন করতে পারবেন
    }
  }

  async function submit(e) {
    e.preventDefault();

    const payload = {
      project_id: projectId || null,
      title,
      description,
      priority,
      category: category || null,

      start_date: startDate || null,
      end_date: endDate || null,

      estimated_hours: estimated !== "" ? Number(estimated) : null,
      worked_hours: worked !== "" ? Number(worked) : null,

      assignee_id: assigneeId ? Number(assigneeId) : null,
    };

    await onSubmit(payload);
    resetIfCreate();
  }

  // nice labels
  const projectOptions = useMemo(
    () => projects.map((p) => ({ value: String(p.id), label: p.name })),
    [projects]
  );

  return (
    <form className="grid grid-cols-1 md:grid-cols-3 gap-3" onSubmit={submit}>
      {/* title */}
      <input
        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 md:col-span-2"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      {/* priority */}
      <select
        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      {/* description */}
      <input
        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 md:col-span-3"
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* project */}
      <select
        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
        value={projectId}
        onChange={(e) => setProjectId(e.target.value)}
      >
        <option value="">No project</option>
        {projectOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {/* category */}
      <select
        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">Category (optional)</option>
        <option>Work</option>
        <option>Personal</option>
        <option>Study</option>
        <option>Other</option>
      </select>

      {/* assignee (depends on project) */}
      <select
        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 disabled:opacity-60"
        value={assigneeId}
        onChange={(e) => setAssigneeId(e.target.value)}
        disabled={!projectId || membersLoading || members.length === 0}
        title={!projectId ? "Select a project first" : undefined}
      >
        {!projectId ? (
          <option value="">Select project first</option>
        ) : membersLoading ? (
          <option value="">Loading members…</option>
        ) : members.length === 0 ? (
          <option value="">No members</option>
        ) : (
          <>
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </>
        )}
      </select>

      {/* start / end dates */}
      <input
        type="date"
        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        placeholder="Start date"
      />
      <input
        type="date"
        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        placeholder="End date"
      />

      {/* hours */}
      <input
        type="number"
        min="0"
        step="0.25"
        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
        placeholder="Estimated hours"
        value={estimated}
        onChange={(e) => setEstimated(e.target.value)}
      />
      <input
        type="number"
        min="0"
        step="0.25"
        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
        placeholder="Worked hours"
        value={worked}
        onChange={(e) => setWorked(e.target.value)}
      />

      {/* submit */}
      <button className="rounded-lg px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white md:col-span-3">
        {submitLabel}
      </button>
    </form>
  );
}

