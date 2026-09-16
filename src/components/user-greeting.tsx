import { getCurrentUser } from "@/lib/auth-server";
import { getDisplayName, pickAvatarUrl } from "@/lib/auth-helpers";

export default async function UserGreeting() {
  const profile = await getCurrentUser();
  if (!profile) return null;

  const name = getDisplayName(profile) || profile.username || "Thành viên";
  const avatarUrl = pickAvatarUrl(profile);
  const initial = (name?.[0] || "U").toUpperCase();

  return (
    <div className="w-full mb-6">
      <div className="glass-control flex items-center gap-3 rounded-2xl p-3">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={name}
            className="h-11 w-11 rounded-full object-cover border border-pink-200"
          />
        ) : (
          <div className="h-11 w-11 rounded-full bg-pink-200 text-pink-700 flex items-center justify-center font-semibold">
            {initial}
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">Xin chào</span>
          <span className="text-base font-semibold text-gray-900">{name}</span>
        </div>
      </div>
    </div>
  );
}

