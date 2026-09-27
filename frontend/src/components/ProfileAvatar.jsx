import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { resolveImageUrl } from "../api/mediaApi";

export default function ProfileAvatar({ src, name, className = "h-14 w-14" }) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => setImageFailed(false), [src]);

  const imageUrl = resolveImageUrl(src);

  return (
    <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#B4532D] font-semibold text-white ${className}`}>
      {imageUrl && !imageFailed ? (
        <img
          src={imageUrl}
          alt={`${name || "Profile"} profile`}
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : name ? (
        <span>{name.trim().charAt(0).toUpperCase()}</span>
      ) : (
        <UserRound size={22} aria-hidden="true" />
      )}
    </div>
  );
}
