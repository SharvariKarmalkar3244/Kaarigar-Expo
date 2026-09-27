import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
} from "lucide-react";

import { getEventById, getEventParticipants } from "../api/eventApi";
import { registerForEvent, getMyRegistrations } from "../api/visitorApi";
import { applyForEvent } from "../api/kaarigarApi";
import { getMyApplications } from "../api/kaarigarApi";
import EntryTicketQr from "../components/EntryTicketQr";
import ProfileAvatar from "../components/ProfileAvatar";
import WorkImageGallery from "../components/WorkImageGallery";
import KaarigarProfileModal from "../components/KaarigarProfileModal";
import EventImage from "../components/EventImage";

import { useAuth } from "../context/AuthContext";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [entryTicketCode, setEntryTicketCode] = useState("");

  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --------------------------------------------------
  // Load Event & Participants
  // --------------------------------------------------
  useEffect(() => {
    loadEvent();
  }, [id]);

  useEffect(() => {
    if (event) {
      loadParticipants();
    }
  }, [event]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getEventById(id);
      setEvent(data);
    } catch (err) {
      console.error("Failed to load event:", err);
      setError(
        err.response?.data?.message || "Unable to load event details."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadParticipants = async () => {
    try {
      setLoadingParticipants(true);
      const data = await getEventParticipants(id);

      const participantsArray = Array.isArray(data)
        ? data
        : data?.content || data?.participants || data?.kaarigars || [];

      setParticipants(participantsArray);
    } catch (err) {
      console.error("Failed to load participants:", err);
      setParticipants([]);
    } finally {
      setLoadingParticipants(false);
    }
  };

  // Check registration status
  useEffect(() => {
    const checkRegistration = async () => {
      if (isAuthenticated && user?.role === "VISITOR") {
        try {
          const userRegistrations = await getMyRegistrations();
          const registeredList = Array.isArray(userRegistrations)
            ? userRegistrations
            : userRegistrations?.content || userRegistrations?.data || [];

          const registration = registeredList.find(
            (reg) =>
              String(reg.eventId) === String(id) ||
              String(reg.event?.id) === String(id)
          );
          setIsAlreadyRegistered(!!registration);
          if (registration?.ticketCode) setEntryTicketCode(registration.ticketCode);
        } catch (err) {
          console.error("Failed to check registration status:", err);
        }
      }
    };

    checkRegistration();
  }, [id, isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "KAARIGAR") {
      getMyApplications().then((items) => {
        const list = Array.isArray(items) ? items : items?.content || [];
        setHasApplied(list.some((item) => String(item.eventId) === String(id)));
      }).catch(() => {});
    }
  }, [id, isAuthenticated, user]);

  // --------------------------------------------------
  // Capacity & Status Calculations
  // --------------------------------------------------
  const registeredCount = event?.registeredCount ?? 0;
  const capacity = event?.capacity ?? 0;
  const isFull = capacity > 0 && registeredCount >= capacity;
  const remainingSeats = capacity > 0 ? Math.max(capacity - registeredCount, 0) : 0;
  const capacityPercentage =
    capacity > 0 ? Math.min((registeredCount / capacity) * 100, 100) : 0;

  const eventStatus = String(event?.status || "UPCOMING").toUpperCase();

  const canRegister =
    eventStatus === "UPCOMING" && !isFull && !isAlreadyRegistered;
  const canApply = eventStatus === "UPCOMING" && !hasApplied;

  // --------------------------------------------------
  // Handlers
  // --------------------------------------------------
  const handleRSVP = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.role !== "VISITOR") {
      setError("Only visitors can register for an event.");
      return;
    }

    if (isAlreadyRegistered) {
      setError("You are already registered for this event.");
      return;
    }

    if (eventStatus !== "UPCOMING") {
      if (eventStatus === "COMPLETED") {
        setError("Registration is closed because this event has completed.");
      } else if (eventStatus === "ONGOING") {
        setError("Registration is closed because this event is currently ongoing.");
      } else if (eventStatus === "CANCELLED") {
        setError("Registration is unavailable because this event has been cancelled.");
      } else {
        setError("Registration is not available for this event.");
      }
      return;
    }

    if (isFull) {
      setError("This event is currently full.");
      return;
    }

    try {
      setRegistering(true);
      setError("");
      setSuccess("");

      const registration = await registerForEvent(event.id);
      setEntryTicketCode(registration?.ticketCode || "");
      setSuccess("Successfully registered for this event!");
      setIsAlreadyRegistered(true);

      const updatedEvent = await getEventById(event.id);
      setEvent(updatedEvent);
    } catch (err) {
      console.error("Event registration failed:", err);
      let message = "Registration failed. Please try again.";

      if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (typeof err.response?.data === "string") {
        message = err.response.data;
      } else if (err.response?.status === 409) {
        message = "You are already registered for this event.";
        setIsAlreadyRegistered(true);
      }
      if (err.response?.data?.message?.includes("visitor profile")) {
        navigate("/visitor/profile", { state: { returnTo: `/events/${id}` } });
        return;
      }
      setError(message);
    } finally {
      setRegistering(false);
    }
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (user?.role !== "KAARIGAR") {
      setError("Only kaarigars can apply for an event.");
      return;
    }
    if (eventStatus !== "UPCOMING") {
      setError("Kaarigar applications are available only for upcoming events.");
      return;
    }
    if (hasApplied) return;
    try {
      setApplying(true);
      setError("");
      setSuccess("");
      await applyForEvent({ eventId: Number(id) });
      setHasApplied(true);
      setSuccess("Application submitted. Your entry QR will be available here after approval.");
    } catch (err) {
      console.error("Event application failed:", err);

      // Safely extract string message from error response
      let message = "Failed to submit application. Please try again.";

      const data = err.response?.data;
      if (typeof data === "string") message = data;
      else if (data) message = data.detail || data.message || data.error || message;
      if (/already applied/i.test(message)) setHasApplied(true);
      if (err.response?.status === 403) message = data?.detail || data?.message || "Only a signed-in Kaarigar account can apply.";
      if (/complete your Kaarigar profile/i.test(message)) {
        navigate("/kaarigar/profile", { state: { returnTo: `/events/${id}` } });
        return;
      }

      setError(message);
    } finally {
      setApplying(false);
    }
  };

  // --------------------------------------------------
  // Loading & Error Views
  // --------------------------------------------------
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FDFBF7]">
        <div className="flex items-center gap-3 text-[#6B4226]">
          <Loader2 size={28} className="animate-spin" />
          <span className="text-base font-semibold">Loading event...</span>
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-[#2B2118]">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <Link
            to="/events"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#6B4226] hover:text-[#B4532D]"
          >
            <ArrowLeft size={16} />
            Back to Events
          </Link>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
            <AlertCircle size={40} className="mx-auto text-red-600" />
            <h1 className="mt-4 text-xl font-bold text-red-800">
              Unable to Load Event
            </h1>
            <p className="mt-2 text-sm text-red-700">{error}</p>

            <button
              onClick={loadEvent}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#8B3A1B] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#722F15]"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFBF7] text-[#2B2118]">
        <h1 className="font-serif text-3xl font-bold">Event Not Found</h1>
        <Link
          to="/events"
          className="mt-6 rounded-full bg-[#8B3A1B] px-7 py-2.5 text-sm font-medium text-white transition hover:bg-[#722F15]"
        >
          Back to Events
        </Link>
      </div>
    );
  }

  // --------------------------------------------------
  // Main View
  // --------------------------------------------------
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2B2118]">
      {/* Header / Navbar */}
      <header className="w-full bg-[#FDFBF7] px-8 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 font-serif text-2xl font-bold text-[#6B4226]"
          >
            <span className="text-[#B4532D]">🌸</span> Kaarigar Expo
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-gray-700 md:flex">
            <Link to="/" className="hover:text-[#B4532D]">
              Home
            </Link>
            <Link to="/events" className="font-semibold text-[#6B4226]">
              Events
            </Link>
{/*             <Link to="/artisans" className="hover:text-[#B4532D]"> */}
{/*               Artisans */}
{/*             </Link> */}
{/*             <Link to="/about" className="hover:text-[#B4532D]"> */}
{/*               About */}
{/*             </Link> */}
          </nav>

          {!isAuthenticated && (
            <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:border-gray-400"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-[#8B3A1B] px-6 py-2 text-sm font-medium text-white transition hover:bg-[#722F15]"
                >
                  Register
                </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Link
          to="/events"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#6B4226] transition hover:text-[#B4532D]"
        >
          <ArrowLeft size={16} />
          Back to Events
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* LEFT SIDE: Image, Info, Kaarigars */}
          <div className="space-y-8 lg:col-span-2">
            {/* Event Header Image */}
            <div className="h-[380px] w-full overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
              <EventImage src={event.imageUrl} alt={event.title} className="h-full w-full object-cover" />
            </div>

            {/* Event Information Block */}
            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded-full bg-[#EFE8DC] px-3.5 py-1 text-xs font-semibold text-[#6B4226]">
                  {eventStatus}
                </span>

                {isFull && (
                  <span className="rounded-full bg-red-100 px-3.5 py-1 text-xs font-semibold text-red-700">
                    FULL
                  </span>
                )}
              </div>

              <h1 className="mt-4 font-serif text-3xl font-bold text-[#2B2118] md:text-4xl">
                {event.title}
              </h1>

              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                {event.description ||
                  "Join us for this exciting craft exhibition and discover traditional Indian craftsmanship."}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <EventInfoTile
                  icon={<CalendarDays size={18} />}
                  title="Start Date"
                  value={event.startDate || "Not specified"}
                />

                <EventInfoTile
                  icon={<CalendarDays size={18} />}
                  title="End Date"
                  value={event.endDate || "Not specified"}
                />

                <EventInfoTile
                  icon={<MapPin size={18} />}
                  title="Location"
                  value={event.location || event.city || "Not specified"}
                />

                <EventInfoTile
                  icon={<Users size={18} />}
                  title="Capacity"
                  value={`${registeredCount} / ${capacity || "Unlimited"}`}
                />
              </div>
            </div>

            {/* Participating Kaarigars Section */}
            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <h2 className="font-serif text-2xl font-bold text-[#2B2118]">
                Participating Kaarigars
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Artisans taking part in this event.
              </p>

              {loadingParticipants ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3 text-[#6B4226]">
                    <Loader2 size={24} className="animate-spin" />
                    <span className="text-sm font-semibold">
                      Loading participants...
                    </span>
                  </div>
                </div>
              ) : participants.length === 0 ? (
                <div className="mt-6 rounded-2xl bg-[#EFE8DC]/50 py-12 text-center">
                  <Users size={36} className="mx-auto text-[#8B3A1B]" />
                  <p className="mt-3 text-sm font-medium text-gray-600">
                    No kaarigars have applied for this event yet.
                  </p>
                </div>
              ) : (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {participants.map((participant, index) => {
                    const kaarigar =
                      participant.kaarigar ||
                      participant.artisan ||
                      participant.user ||
                      participant;

                    const name =
                      kaarigar.name ||
                      kaarigar.fullName ||
                      participant.name ||
                      "Kaarigar";

                    const craft =
                      kaarigar.craft ||
                      kaarigar.craftType ||
                      kaarigar.specialization ||
                      participant.craft ||
                      "Artisan";

                    const location =
                      kaarigar.location ||
                      kaarigar.city ||
                      participant.location ||
                      "";

                    return (
                      <div
                        key={participant.id || index}
                        className="rounded-xl border border-gray-100 bg-[#FDFBF7] p-4 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <ProfileAvatar src={participant.photoUrl || kaarigar.photoUrl} name={name} className="h-11 w-11" />

                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-[#2B2118] text-sm">
                              {name}
                            </p>
                            <p className="truncate text-xs text-gray-500">
                              {craft}
                            </p>
                          </div>
                        </div>

                        {location && (
                          <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                            <MapPin size={13} className="shrink-0 text-gray-400" />
                            <span className="truncate">{location}</span>
                          </div>
                        )}
                        <WorkImageGallery images={participant.workImageUrls || kaarigar.workImageUrls} title="Work" className="mt-4" />
                        <button
                          type="button"
                          onClick={() => setSelectedProfile({
                            name,
                            craft,
                            location,
                            description: participant.description || kaarigar.description,
                            photoUrl: participant.photoUrl || kaarigar.photoUrl,
                            workImageUrls: participant.workImageUrls || kaarigar.workImageUrls || [],
                          })}
                          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#B4532D] px-3 py-2 text-xs font-semibold text-[#9C4524] transition hover:bg-[#FFF5EE]"
                        >
                          <Eye size={15} /> View profile
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: RSVP Action Card */}
          <div>
            <div className="sticky top-6 rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
              <h2 className="font-serif text-2xl font-bold text-[#2B2118]">
                Event Registration
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Reserve your place at this event.
              </p>

              {/* Capacity Progress */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                  <span>Registration</span>
                  <span>
                    {registeredCount} / {capacity || "N/A"}
                  </span>
                </div>

                <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-[#8B3A1B] transition-all duration-300"
                    style={{ width: `${capacityPercentage}%` }}
                  />
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  {capacity === 0
                    ? "Open registration"
                    : isFull
                    ? "No seats available"
                    : `${remainingSeats} seats remaining`}
                </p>
              </div>

              {/* Event Quick Details */}
              <div className="mt-6 space-y-3.5 border-t border-gray-100 pt-5 text-xs text-gray-700">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[#EFE8DC]/60 p-2 text-[#8B3A1B]">
                    <CalendarDays size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400">Date</p>
                    <p className="font-semibold text-[#2B2118]">
                      {event.startDate || "TBA"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[#EFE8DC]/60 p-2 text-[#8B3A1B]">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400">Venue</p>
                    <p className="font-semibold text-[#2B2118]">
                      {event.location || event.city || "TBA"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Success Alert */}
              {success && (
                <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-green-200 bg-green-50 p-3.5 text-xs text-green-800">
                  <CheckCircle size={18} className="mt-0.5 shrink-0 text-green-600" />
                  <div className="font-medium">
                    <p>{success}</p>
                  </div>
                </div>
              )}
              {user?.role === "VISITOR" && entryTicketCode && (
                <EntryTicketQr
                  ticketCode={entryTicketCode}
                  eventTitle={event.title}
                  eventStartDate={event.startDate}
                  eventEndDate={event.endDate}
                  eventLocation={event.location || event.city}
                  attendeeName={user?.name}
                  attendeeType={user?.role === "KAARIGAR" ? "Kaarigar" : "Visitor"}
                />
              )}

              {/* Error Alert */}
              {error && event && (
                <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800">
                  <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
                  <p className="font-medium">{error}</p>
                </div>
              )}

              {/* RSVP Action (Visitor) */}
              {user?.role === "VISITOR" && (
                <>
                  <button
                    onClick={handleRSVP}
                    disabled={!canRegister || registering || isAlreadyRegistered}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#8B3A1B] py-3 text-sm font-semibold text-white transition hover:bg-[#722F15] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                  >
                    {registering ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Registering...
                      </>
                    ) : isAlreadyRegistered ? (
                      "Already Registered"
                    ) : eventStatus === "COMPLETED" ? (
                      "Event Completed"
                    ) : eventStatus === "ONGOING" ? (
                      "Event Ongoing"
                    ) : eventStatus === "CANCELLED" ? (
                      "Event Cancelled"
                    ) : isFull ? (
                      "Event Full"
                    ) : (
                      "Register for Event"
                    )}
                  </button>

                  {isAlreadyRegistered && (
                    <p className="mt-3 text-center text-xs font-medium text-green-700">
                      You are registered for this event.
                    </p>
                  )}
                </>
              )}

              {/* Apply Action (Kaarigar) */}
              {user?.role === "KAARIGAR" && (
                <button
                  onClick={handleApply}
                  disabled={applying || !canApply}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#6B4226] py-3 text-sm font-semibold text-white transition hover:bg-[#51321E] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                >
                  {applying ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Applying...
                    </>
                  ) : (
                    hasApplied ? "Application submitted" : eventStatus === "UPCOMING" ? "Apply for Event" : "Applications closed"
                  )}
                </button>
              )}

              {/* Unauthenticated Guest */}
              {!isAuthenticated && (
                <div className="mt-6 text-center">
                  <Link
                    to="/login"
                    className="block w-full rounded-xl bg-[#8B3A1B] py-3 text-center text-sm font-semibold text-white transition hover:bg-[#722F15]"
                  >
                    Login to Register
                  </Link>
                  <p className="mt-2 text-xs text-gray-500">
                    Sign in to reserve your place or participate.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <KaarigarProfileModal profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
    </div>
  );
}

// Helper Component for Info Tiles matching theme
function EventInfoTile({ icon, title, value }) {
  return (
    <div className="flex items-center gap-3.5 rounded-xl border border-gray-100 bg-[#FDFBF7] p-4 shadow-sm">
      <div className="text-[#8B3A1B]">{icon}</div>
      <div className="min-w-0">
        <p className="text-[11px] text-gray-400">{title}</p>
        <p className="truncate text-xs font-semibold text-[#2B2118]">{value}</p>
      </div>
    </div>
  );
}
