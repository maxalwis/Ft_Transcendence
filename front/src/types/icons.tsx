/**
 * Design System — Icons
 *
 * Icons are presentation primitives.
 *
 * Rules:
 * - Icons accept standard SVG props.
 * - Icons should not implement button behavior.
 * - Icons should inherit color through currentColor.
 * - Consumers/components control sizing.
 * - Icons are aria-hidden by default.
 *
 * Example:
 *
 *   <CloseIcon className="h-4 w-4" />
 *
 *   <Button variant="icon" aria-label="Close">
 *     <CloseIcon />
 *   </Button>
 */

import type { SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement>;

const defaultIconProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/* -------------------------------------------------------------------------- */
/* Navigation                                                                 */
/* -------------------------------------------------------------------------- */

export const ArrowLeftIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...defaultIconProps} {...props}>
    <path d="m15 18-6-6 6-6" strokeWidth="2.5" />
  </svg>
);

export const ArrowRightIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...defaultIconProps} {...props}>
    <path d="m9 18 6-6-6-6" strokeWidth="2.5" />
  </svg>
);

export const ArrowUpIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...defaultIconProps} {...props}>
    <path d="m18 15-6-6-6 6" strokeWidth="2.5" />
  </svg>
);

export const ArrowDownIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...defaultIconProps} {...props}>
    <path d="m6 9 6 6 6-6" strokeWidth="2.5" />
  </svg>
);

/**
 * Semantic alias for ArrowLeftIcon.
 *
 * Use ArrowLeftIcon when the meaning is directional.
 * Use BackIcon when the meaning is specifically "go back".
 */
export const BackIcon = ArrowLeftIcon;

/* -------------------------------------------------------------------------- */
/* Actions                                                                    */
/* -------------------------------------------------------------------------- */

export const CloseIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...defaultIconProps} {...props}>
    <path d="M6 6l12 12M18 6 6 18" strokeWidth="2.5" />
  </svg>
);

export interface MenuIconProps extends IconProps {
  open?: boolean;
}

export const MenuIcon = ({ open = false, ...props }: MenuIconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...defaultIconProps} {...props}>
    {open ? (
      <path d="M6 18 18 6M6 6l12 12" strokeWidth="2" />
    ) : (
      <path d="M4 6h16M4 12h16m-7 6h7" strokeWidth="2" />
    )}
  </svg>
);

export const ExternalLinkIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...defaultIconProps} {...props}>
    <path
      d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5"
      strokeWidth="2"
    />
    <path d="M15.75 3H21v5.25M21 3 10.5 13.5" strokeWidth="2" />
  </svg>
);

export const ExpandIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...defaultIconProps} {...props}>
    <path d="M15 3h6v6" />
    <path d="M9 21H3v-6" />
    <path d="m21 3-7 7" />
    <path d="m3 21 7-7" />
  </svg>
);

export const SendIcon = (props: IconProps) => (
  <svg viewBox="0 0 512 512" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M476.59,227.05l-.16-.07L49.35,49.84A23.56,23.56,0,0,0,27.14,52,24.65,24.65,0,0,0,16,72.59V185.88a24,24,0,0,0,19.52,23.57l232.93,43.07a4,4,0,0,1,0,7.86L35.53,303.45A24,24,0,0,0,16,327V440.31A23.57,23.57,0,0,0,26.59,460a23.94,23.94,0,0,0,13.22,4,24.55,24.55,0,0,0,9.52-1.93L476.4,285.94l.19-.09a32,32,0,0,0,0-58.8Z" />
  </svg>
);

/* -------------------------------------------------------------------------- */
/* Feedback                                                                   */
/* -------------------------------------------------------------------------- */

export const WarningIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true" {...props}>
    <path
      d="M12 3.5 1.8 20.5c-.5.8.1 1.8 1 1.8h18.4c.9 0 1.5-1 1-1.8L12 3.5Z"
      fill="currentColor"
      stroke="none"
    />

    <path d="M12 9v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />

    <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export interface LikeIconProps extends IconProps {
  liked?: boolean;
}

export const LikeIcon = ({ liked = false, ...props }: LikeIconProps) => (
  <svg viewBox="-4 -4 98 98" aria-hidden="true" {...props}>
    <path
      d="M 45 84.334 L 6.802 46.136 C 2.416 41.75 0 35.918 0 29.716 c 0 -6.203 2.416 -12.034 6.802 -16.42 c 4.386 -4.386 10.217 -6.802 16.42 -6.802 c 6.203 0 12.034 2.416 16.42 6.802 L 45 18.654 l 5.358 -5.358 c 4.386 -4.386 10.218 -6.802 16.42 -6.802 c 6.203 0 12.034 2.416 16.42 6.802 l 0 0 l 0 0 C 87.585 17.682 90 23.513 90 29.716 c 0 6.203 -2.415 12.034 -6.802 16.42 L 45 84.334 z"
      fill={liked ? 'hsl(12, 87%, 50%)' : 'none'}
      stroke={liked ? '#cf2b3c' : '#ff4000'}
      strokeWidth="7%"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* -------------------------------------------------------------------------- */
/* Utility                                                                    */
/* -------------------------------------------------------------------------- */

export const CheckIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...defaultIconProps} {...props}>
    <path d="m5 12 4 4L19 6" strokeWidth="2.5" />
  </svg>
);

export const PlusIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...defaultIconProps} {...props}>
    <path d="M12 5v14M5 12h14" strokeWidth="2" />
  </svg>
);

export const MinusIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...defaultIconProps} {...props}>
    <path d="M5 12h14" strokeWidth="2" />
  </svg>
);

export const InfoIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...defaultIconProps} {...props}>
    <circle cx="12" cy="12" r="9" />

    <path d="M12 11v5" strokeWidth="2" />

    <path d="M12 8h.01" strokeWidth="2.5" />
  </svg>
);
