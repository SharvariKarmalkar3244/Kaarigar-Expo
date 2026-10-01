import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2, Users, MapPin, Briefcase, Download } from "lucide-react";
import { getEventById, getEventParticipants } from "../../api/eventApi";
import { getAllKaarigars } from "../../api/kaarigarApi";
import { exportExcel } from "../../utils/exportExcel";
import ProfileAvatar from "../../components/ProfileAvatar";
import WorkImageGallery from "../../components/WorkImageGallery";
import KaarigarProfileModal from "../../components/KaarigarProfileModal";

export default function AdminEventParticipants() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProfile, setSelectedProfile] = useState(null);

  const closeProfile = useCallback(() => setSelectedProfile(null), []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const [eventData, participantsData, firstProfilesPage] = await Promise.all([
        getEventById(id),
        getEventParticipants(id),
        getAllKaarigars({ page: 0, size: 100 }),
      ]);
      setEvent(eventData);
      const list = Array.isArray(participantsData)
        ? participantsData
        : participantsData?.content || [];
      const profiles = Array.isArray(firstProfilesPage) ? firstProfilesPage : [...(firstProfilesPage?.content || [])];
      for (let page = 1; page < (firstProfilesPage?.totalPages || 1); page += 1) {
        const profilePage = await getAllKaarigars({ page, size: 100 });
        profiles.push(...(Array.isArray(profilePage) ? profilePage : profilePage?.content || []));
      }
      setParticipants(list.map((item) => {
        const userId = item.userId || item.kaarigarId;
        const profile = profiles.find((entry) => String(entry.userId) === String(userId));
        return {
          ...item,
          name: profile?.name || item.name,
          craft: profile?.craft || item.craft,
          location: profile?.location || item.location,
          photoUrl: profile?.photoUrl || item.photoUrl,
          workImageUrls: profile?.workImageUrls || item.workImageUrls,
          profile,
        };
      }));
    } catch (err) {
      console.error("Failed to load event participants:", err);
      setError(err.response?.data?.message || "Failed to load participants.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const exportParticipants = () => exportExcel({
    fileName: `event-${id}-kaarigar-participants`,
    sheetName: "Kaarigar Participants",
    columns: [
      { label: "Application ID", value: "id" },
      { label: "Kaarigar User ID", value: (row) => row.kaarigarId || row.userId },
      { label: "Name", value: (row) => row.name || row.kaarigarName },
      { label: "Craft", value: "craft" },
      { label: "Location", value: "location" },
      { label: "Email", value: (row) => row.profile?.email },
      { label: "Phone", value: (row) => row.profile?.phone },
      { label: "Status", value: "status" },
      { label: "Applied At", value: "appliedAt" },
    ],
    rows: participants,
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F3EA]">
        <div className="flex items-center gap-3 text-[#6B4226]">
          <Loader2 size={25} className="animate-spin" />
          Loading event kaarigars...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F3EA] p-6">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/admin/events"
          className="mb-6 inline-flex items-center gap-2 font-medium text-[#6B4226]"
        >
          <ArrowLeft size={18} /> Back to Event Management
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#2B2118]">Kaarigars - {event?.title || "Event"}</h1>
            <p className="mt-1 text-sm text-gray-600">List of registered artisans and stall applicants.</p>
          </div>
          <button onClick={exportParticipants} className="flex items-center gap-2 rounded-lg border border-[#B4532D] bg-white px-4 py-2 text-sm font-semibold text-[#B4532D]"><Download size={16} /> Export Excel</button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {participants.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-[#E2D8CB] bg-white p-12 text-center">
            <Users size={40} className="mx-auto text-[#B4532D]" />
            <p className="mt-3 text-lg font-medium text-[#2B2118]">
              No Kaarigars registered yet.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {participants.map((item, idx) => {
              const k = item.kaarigar || item.artisan || item;
              const profile = item.profile || {};
              const name = profile.name || k.name || k.fullName || item.name || item.kaarigarName || "Kaarigar";
              const workImageUrls = profile.workImageUrls || item.workImageUrls || [];
              return (
                <div
                  key={item.id || idx}
                  className="rounded-2xl border border-[#E2D8CB] bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center gap-3"><ProfileAvatar src={profile.photoUrl || item.photoUrl || k.photoUrl} name={name} className="h-11 w-11" /><h3 className="font-bold text-[#2B2118]">{name}</h3></div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    <Briefcase size={16} /> {profile.craft || k.craft || k.craftType || item.craft || "Artisan"}
                  </div>
                  {(profile.location || k.location || item.location) && (
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                      <MapPin size={16} /> {profile.location || k.location || item.location}
                    </div>
                  )}
                  {profile.email && <p className="mt-2 break-all text-sm text-gray-600">{profile.email}</p>}
                  {profile.phone && <p className="mt-1 text-sm text-gray-600">{profile.phone}</p>}
                  {!profile.phone && <p className="mt-1 text-sm text-gray-500">Phone not provided</p>}
                  <WorkImageGallery images={workImageUrls} title="Work" className="mt-4" />
                  <button
                    type="button"
                    onClick={() => setSelectedProfile({
                      name,
                      craft: profile.craft || k.craft || k.craftType || item.craft,
                      location: profile.location || k.location || item.location,
                      description: profile.description || item.description,
                      photoUrl: profile.photoUrl || item.photoUrl || k.photoUrl,
                      workImageUrls,
                      email: profile.email,
                      phone: profile.phone,
                    })}
                    className="mt-4 w-full rounded-lg border border-[#B4532D] px-4 py-2 text-sm font-semibold text-[#9C4524] transition hover:bg-[#FFF5EE]"
                  >
                    View profile
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <KaarigarProfileModal profile={selectedProfile} onClose={closeProfile} />
    </div>
  );
}
