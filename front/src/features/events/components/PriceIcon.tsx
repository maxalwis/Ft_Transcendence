import styles from '../Event.module.css';

export const PriceIcon = ({ paid }) => (
  <svg
    className={`${styles.priceIcon} ${paid ? styles.paid : styles.free}`}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M17 7.5C15.9 6.6 14.5 6 13 6C10.2 6 8 8.7 8 12C8 15.3 10.2 18 13 18C14.5 18 15.9 17.4 17 16.5M6 10.5H13M6 13.5H13"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
