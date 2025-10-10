export default function FullScreenLoader({ text = "Loading..." }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="h-6 w-6 rounded-full border-2 border-slate-500 border-t-transparent animate-spin" />
        <span className="text-slate-300">{text}</span>
      </div>
    </div>
  );
}
