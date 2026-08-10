// Interface for friends who are interested
export interface Friend {
  id: string;
  name: string;
}

interface MarkerHoverCardProps {
  title: string;
  category: string;
  isOpen: boolean;
  closingTime: string;
  interestedUsersCount: number;
  isConnected?: boolean;
  interestedFriends?: Friend[];
  imageUrl?: string;
  position: { x: number; y: number };
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
}

export default function MarkerHoverCard({
  title = 'Event Title',
  category = 'Category',
  isOpen = false,
  closingTime = 'Closing Time',
  interestedUsersCount = 0,
  isConnected = false,
  interestedFriends = [],
  imageUrl = '/event_image.webp',
  position,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: MarkerHoverCardProps) {
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className="glassmorphism-popup cursor-pointer"
      style={{
        position: 'fixed',
        top: `${position.y - 15}px`,
        left: `${position.x}px`,
        transform: 'translate(-50%, -100%)',
        width: '300px',

        zIndex: 1000,

        // Pop-out & scale animation from the pinpoint position
        transformOrigin: 'bottom center',
        animation: 'markerPopupAnimation 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      {/* Bubble Image Container */}
      <style>
        {`
                    @keyframes markerPopupAnimation {
                        0% {
                            opacity: 0;
                            transform: translate(-50%, -100%) scale(0.6);
                        }
                        100% {
                            opacity: 1;
                            transform: translate(-50%, -100%) scale(1);
                        }
                    }
                `}
      </style>

      <div
        style={{
          width: '100%',
          height: '130px',
          position: 'relative',
          padding: '10px 10px 0 10px',
          boxSizing: 'border-box',
        }}
      >
        <img
          src={imageUrl}
          alt={title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        />
      </div>

      {/* Content Section */}
      <div style={{ padding: '14px 18px 18px 18px' }}>
        <div
          style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#1f1f1f',
            marginBottom: '8px',
            lineHeight: '1.2',
          }}
        >
          {title}
        </div>

        {/* Interested Users & Friends Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}
        >
          {/* Left: Heart + Count */}
          <div
            style={{
              fontSize: '13px',
              color: '#5f6368',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              style={{ width: '13px', height: '13px', display: 'block' }}
            >
              <g
                style={{
                  stroke: 'none',
                  strokeWidth: 0,
                  strokeDasharray: 'none',
                  strokeLinecap: 'butt',
                  strokeLinejoin: 'miter',
                  strokeMiterlimit: 10,
                  fill: 'none',
                  fillRule: 'nonzero',
                  opacity: 1,
                }}
                transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)"
              >
                <path
                  d="M 45 84.334 L 6.802 46.136 C 2.416 41.75 0 35.918 0 29.716 c 0 -6.203 2.416 -12.034 6.802 -16.42 c 4.386 -4.386 10.217 -6.802 16.42 -6.802 c 6.203 0 12.034 2.416 16.42 6.802 L 45 18.654 l 5.358 -5.358 c 4.386 -4.386 10.218 -6.802 16.42 -6.802 c 6.203 0 12.034 2.416 16.42 6.802 l 0 0 l 0 0 C 87.585 17.682 90 23.513 90 29.716 c 0 6.203 -2.415 12.034 -6.802 16.42 L 45 84.334 z"
                  style={{
                    stroke: 'none',
                    strokeWidth: 1,
                    strokeDasharray: 'none',
                    strokeLinecap: 'butt',
                    strokeLinejoin: 'miter',
                    strokeMiterlimit: 10,
                    fill: '#FF6507',
                    fillRule: 'nonzero',
                    opacity: 1,
                  }}
                  transform=" matrix(1 0 0 1 0 0) "
                  strokeLinecap="round"
                />
              </g>
            </svg>
            <span style={{ fontWeight: 600, color: '#1f1f1f' }}>{interestedUsersCount}</span>
            <span>interested</span>
          </div>

          {/* Right: Friends Initials Circles (Only shown if connected) */}
          {isConnected && interestedFriends.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', pointerEvents: 'auto' }}>
              {interestedFriends.slice(0, 3).map((friend, index) => {
                // Extract first 1 or 2 letters for initials
                const initials = friend.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase();

                return (
                  <div
                    key={friend.id}
                    title={friend.name} // Shows full name on hover natively
                    className="glassmorphism-element"
                    style={{
                      width: '26px',
                      height: '26px',
                      cursor: 'pointer',
                      borderRadius: '50%',
                      marginLeft: index > 0 ? '-8px' : '0px',
                    }}
                  >
                    {initials}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ fontSize: '13px', color: '#5f6368', marginBottom: '4px' }}>{category}</div>

        <div style={{ fontSize: '13px' }}>
          <span style={{ fontWeight: 600, color: isOpen ? '#137333' : '#d93025' }}>
            {isOpen ? 'Open' : 'Closed'}
          </span>
          <span style={{ color: '#70757a' }}> · Closes {closingTime}</span>
        </div>
      </div>
    </div>
  );
}
