import { useEffect } from "react";
import { X, Briefcase, MapPin, Mail, Phone } from "lucide-react";
import ProfileAvatar from "./ProfileAvatar";
import WorkImageGallery from "./WorkImageGallery";

export default function KaarigarProfileModal({ profile, onClose }) {
  useEffect(() => {
    if (!profile) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [profile, onClose]);

  if (!profile) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="kaarigar-profile-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <ProfileAvatar src={profile.photoUrl} name={profile.name} className="h-16 w-16 sm:h-20 sm:w-20" />
            <div className="min-w-0">
              <h2 id="kaarigar-profile-title" className="truncate text-xl font-bold text-[#2B2118] sm:text-2xl">
                {profile.name || "Kaarigar"}
              </h2>
              <p className="mt-1 text-sm text-gray-600">{profile.craft || "Artisan"}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close profile" className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {profile.location && <ProfileFact icon={<MapPin size={17} />} label="Location" value={profile.location} />}
          {profile.email && <ProfileFact icon={<Mail size={17} />} label="Email" value={profile.email} />}
          {profile.phone && <ProfileFact icon={<Phone size={17} />} label="Phone" value={profile.phone} />}
          {profile.craft && <ProfileFact icon={<Briefcase size={17} />} label="Craft" value={profile.craft} />}
        </div>

        {profile.description && (
          <div className="mt-5 rounded-xl bg-[#FDFBF7] p-4">
            <h3 className="text-sm font-semibold text-[#6B4226]">About their work</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">{profile.description}</p>
          </div>
        )}

        {Array.isArray(profile.workImageUrls) && profile.workImageUrls.length > 0 ? (
          <WorkImageGallery images={profile.workImageUrls} title="Photos of their work" className="mt-5" />
        ) : (
          <p className="mt-5 rounded-xl bg-[#FDFBF7] p-4 text-sm text-gray-500">No work photos have been added yet.</p>
        )}
      </section>
    </div>
  );
}

function ProfileFact({ icon, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-2 rounded-xl border border-[#EEE6DC] p-3 text-sm">
      <span className="mt-0.5 shrink-0 text-[#8B3A1B]">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="break-words font-medium text-[#2B2118]">{value}</p>
      </div>
    </div>
  );
}
