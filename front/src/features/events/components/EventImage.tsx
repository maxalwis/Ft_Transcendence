interface EventImageProps {
  src?: string;
  alt: string;
}

export default function EventImage({ src, alt }: EventImageProps) {
  return (
    <img
      className="w-full rounded-lg object-cover"
      src={src || '/event_image.webp'}
      alt={alt}
      referrerPolicy="no-referrer"
    />
  );
}
