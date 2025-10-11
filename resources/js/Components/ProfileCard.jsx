// resources/js/Components/ProfileCard.jsx
export default function ProfileCard({ user }) {
  if (!user) return null;
  return (
    <div className="bg-slate-800/70 rounded-2xl shadow p-4 flex items-center gap-4">
      <img
        src={user.avatar_url || "https://api.dicebear.com/9.x/initials/svg?seed=" + encodeURIComponent(user.name || user.email || "User")}
        alt="avatar"
        className="h-16 w-16 rounded-full object-cover border border-slate-700"
      />
      <div className="space-y-1">
        <div className="text-lg font-semibold">{user.name || "User"}</div>
        <div className="text-sm opacity-80">{user.email}</div>
        <div className="text-xs opacity-70">
          {user.mobile ? `Mobile: ${user.mobile}` : `Mobile: —`} • {user.gender ? `Gender: ${user.gender}` : `Gender: —`}
        </div>
      </div>
    </div>
  );
}
