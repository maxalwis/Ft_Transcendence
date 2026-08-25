interface LikeButtonProps {
  eventId: string;
  interestedUsersCount?: number;
}

export default function LikeButton({ eventId, interestedUsersCount = 0 }: LikeButtonProps) {
  return (
    <button
      type="button"
      className="like-button !flex !w-fit !items-center !justify-center !gap-1 !text-[5px] text-slate-300 transition-colors hover:text-orange-400"
      aria-label={`Marquer l'événement ${eventId} comme intéressant`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 90 90"
        className="h-3.5 w-3.5 shrink-0"
        aria-hidden="true"
      >
        <path
          d="M 45 84.334 L 6.802 46.136 C 2.416 41.75 0 35.918 0 29.716 c 0 -6.203 2.416 -12.034 6.802 -16.42 c 4.386 -4.386 10.217 -6.802 16.42 -6.802 c 6.203 0 12.034 2.416 16.42 6.802 L 45 18.654 l 5.358 -5.358 c 4.386 -4.386 10.218 -6.802 16.42 -6.802 c 6.203 0 12.034 2.416 16.42 6.802 l 0 0 l 0 0 C 87.585 17.682 90 23.513 90 29.716 c 0 6.203 -2.415 12.034 -6.802 16.42 L 45 84.334 z"
          fill="#FF6507"
        />
      </svg>
      <span className="text-xs">
        {interestedUsersCount} intéressé{interestedUsersCount === 1 ? '' : 's'}
      </span>
    </button>
  );
}
