import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";
import { resolveImageUrl } from "../api/mediaApi";

export default function EventImage({ src, alt, className = "" }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={`${alt || "Event"} image unavailable`}
        className={`flex flex-col items-center justify-center gap-2 bg-[#EFE8DC] px-4 text-center text-[#8A7865] ${className}`}
      >
        <ImageOff size={30} aria-hidden="true" />
        <span className="text-sm font-medium">Event image not available</span>
      </div>
    );
  }

  return (
    <img
      src={resolveImageUrl(src)}
      alt={alt || "Event"}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
