import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BriefcaseBusiness, Mail, MapPin, Phone, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getMyProfile } from "../api/kaarigarApi";
import { getVisitorProfile } from "../api/visitorApi";
import ProfileAvatar from "../components/ProfileAvatar";
import WorkImageGallery from "../components/WorkImageGallery";

export default function Profile() {
  const { user } = useAuth();
  const [details, setDetails] = useState(null);
  const [profileMessage, setProfileMessage] = useState("");

  useEffect(() => {
    let active = true;
    const load = user?.role === "KAARIGAR" ? getMyProfile : user?.role === "VISITOR" ? getVisitorProfile : null;
    if (!load) return undefined;
    load().then((data) => {
      if (active) setDetails(data);
    }).catch(() => {
      if (active) setProfileMessage("Your event profile has not been completed yet.");
    });
    return () => { active = false; };
  }, [user?.role]);

  const fields = [
    ["Name", details?.name || user?.name, <UserRound size={17} />],
    ["Email", details?.email || user?.email, <Mail size={17} />],
    ["Role", user?.role, <BriefcaseBusiness size={17} />],
    ...(user?.role === "KAARIGAR" ? [
      ["Craft", details?.craft, <BriefcaseBusiness size={17} />],
      ["Location", details?.location, <MapPin size={17} />],
      ["Phone", details?.phone, <Phone size={17} />],
      ["About", details?.description, <UserRound size={17} />],
    ] : user?.role === "VISITOR" ? [
      ["Phone", details?.phone, <Phone size={17} />],
    ] : []),
  ];

  const detailRoute = user?.role === "KAARIGAR" ? "/kaarigar/profile" : user?.role === "VISITOR" ? "/visitor/profile" : null;

  return (
    <main className="account-page min-h-screen px-5 py-12 sm:px-8">
      <section className="account-card mx-auto max-w-3xl rounded-2xl border p-7 shadow-sm sm:p-10">
        <Link to={user?.role === "ADMIN" ? "/admin" : user?.role === "KAARIGAR" ? "/kaarigar" : "/visitor"} className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-[#8B3A1B] hover:underline">
          <ArrowLeft size={16} /> Back to dashboard
        </Link>
        <div className="flex items-center gap-4 border-b pb-6">
          <ProfileAvatar src={details?.photoUrl} name={details?.name || user?.name} />
          <div>
            <h1 className="text-2xl font-bold">My profile</h1>
            <p className="mt-1 text-sm opacity-70">Your Kaarigar Expo account details</p>
          </div>
        </div>
        {profileMessage && <p className="mt-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{profileMessage}</p>}
        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          {fields.map(([label, value, icon]) => (
            <div key={label} className="account-field rounded-xl p-4">
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#8B3A1B]">{icon}{label}</dt>
              <dd className="mt-2 break-words text-sm font-medium">{value || "Not provided"}</dd>
            </div>
          ))}
        </dl>
        {user?.role === "KAARIGAR" && <WorkImageGallery images={details?.workImageUrls} title="Photos of my work" className="mt-7" />}
        {detailRoute && <Link to={detailRoute} className="mt-6 inline-flex rounded-lg bg-[#B4532D] px-4 py-2.5 text-sm font-semibold text-white">View profile details</Link>}
      </section>
    </main>
  );
}
