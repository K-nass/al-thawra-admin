import type { UserInterface } from "../LatestUsersSection";

export default function UserCard({ user }: { user: UserInterface }) {
  const formattedDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="text-center">
      <div className="w-20 h-20 rounded-full mx-auto mb-2 overflow-hidden flex items-center justify-center bg-slate-200">
        {user.avatarImageUrl ? (
          <img
            className="w-full h-full object-cover"
            src={user.avatarImageUrl}
            alt={`${user.userName} picture`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-400 to-teal-600 text-white text-2xl font-bold">
            {user.userName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <p className="font-medium text-sm">{user.userName}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{formattedDate}</p>
    </div>
  );
}
