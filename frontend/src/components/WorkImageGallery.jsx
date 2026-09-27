import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { resolveImageUrl } from "../api/mediaApi";

export default function WorkImageGallery({ images = [], title = "Work photos", className = "" }) {
  const [failed, setFailed] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const usableImages = (Array.isArray(images) ? images : []).filter((src) => src && !failed[src]);

  useEffect(() => {
    if (!selectedImage) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setSelectedImage(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedImage]);

  if (!usableImages.length) return null;

  return (
    <section className={className} aria-label={title}>
      <h3 className="mb-3 text-sm font-semibold text-[#6B4226]">{title}</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {usableImages.map((src, index) => (
          <button
            key={`${src}-${index}`}
            type="button"
            onClick={() => setSelectedImage(src)}
            aria-label={`View ${title.toLowerCase()} ${index + 1}`}
            className="group aspect-square w-full overflow-hidden rounded-xl border border-[#E8DED1] bg-[#F8F3EA] focus:outline-none focus:ring-2 focus:ring-[#B4532D]"
          >
            <img
              src={resolveImageUrl(src)}
              alt={`${title} ${index + 1}`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
              onError={() => setFailed((current) => ({ ...current, [src]: true }))}
            />
          </button>
        ))}
      </div>
      {selectedImage && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedImage(null);
          }}
        >
          <button type="button" onClick={() => setSelectedImage(null)} aria-label="Close image" className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white hover:bg-white/25">
            <X size={24} />
          </button>
          <img src={resolveImageUrl(selectedImage)} alt="Enlarged work" className="max-h-[88vh] max-w-full rounded-lg object-contain" />
        </div>
      )}
    </section>
  );
}
