interface LikeButtonProps {
  eventId: string;
  interestedUsersCount?: number;
}

export default function LikeButton({ eventId, interestedUsersCount = 0 }: LikeButtonProps) {
  return (
    <button
      type="button"
      className="flex w-fit items-center gap-2 text-xs text-slate-300 transition-colors hover:text-orange-400"
      aria-label={`Marquer l'événement ${eventId} comme intéressant`}
    >
      <span aria-hidden="true">♥</span>
      <span>
        {interestedUsersCount} intéressé{interestedUsersCount === 1 ? '' : 's'}
      </span>
    </button>
  );
}
