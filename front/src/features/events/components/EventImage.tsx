import styles from '../Event.module.css';

interface EventImageProps {
  src?: string;
  alt: string;
}

export default function EventImage({ src, alt }: EventImageProps) {
  return (
    <img
      className={`${styles['event-details-image']}`}
      src={src || '/event_image.webp'}
      alt={alt}
      referrerPolicy="no-referrer"
    />
  );
}
