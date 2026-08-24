interface EventImageProps {
  src?: string;
  alt: string;
}

export default function EventImage({ src, alt }: EventImageProps) {
  return (
    <img
      className="h-28 w-full rounded-lg object-cover"
      src={src || '/event_image.webp'}
      alt={alt}
    />
  );
}
