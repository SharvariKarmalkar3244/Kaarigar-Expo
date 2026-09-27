import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

import { getMyRegistrations } from "../../api/visitorApi";
import EntryTicketQr from "../../components/EntryTicketQr";

function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyRegistrations();

      const data = Array.isArray(response)
        ? response
        : response?.content ||
          response?.data ||
          response?.registrations ||
          [];

      setRegistrations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("My registrations error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load your registrations."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F3EA] text-[#2B2118]">
      <header className="border-b border-[#D8C9B5] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-[#6B4226]">
              Kaarigar Expo
            </h1>

            <p className="text-xs text-gray-500">
              My Registrations
            </p>
          </div>

          <Link
            to="/events"
            className="rounded-lg bg-[#B4532D] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Browse Events
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Link
          to="/visitor"
          className="mb-6 inline-flex items-center gap-2 font-medium text-[#6B4226]"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <div className="mb-7 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">
              My Registrations
            </h2>

            <p className="mt-1 text-sm text-[#5B6B82]">
              View and track your event registrations.
            </p>
          </div>

          <button
            onClick={loadRegistrations}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-[#B4532D] bg-white px-4 py-2 text-sm text-[#B4532D] disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} />

            <div>
              <p className="font-semibold">
                Unable to load registrations
              </p>

              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-[#E2D6C7] bg-white shadow-sm">
          {loading ? (
            <div className="flex justify-center py-16">
              <RefreshCw
                size={28}
                className="animate-spin text-[#B4532D]"
              />
            </div>
          ) : registrations.length === 0 ? (
            <div className="py-16 text-center">
              <CalendarDays
                size={40}
                className="mx-auto text-gray-400"
              />

              <h3 className="mt-4 font-semibold">
                No registrations found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                You have not registered for any events yet.
              </p>

              <Link
                to="/events"
                className="mt-5 inline-block rounded-lg bg-[#B4532D] px-5 py-2.5 text-sm font-semibold text-white"
              >
                Browse Events
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-2 border-b border-[#E2D6C7] bg-[#F8F3EA] px-5 py-3 text-xs font-semibold sm:grid-cols-4">
                <span>Event</span>
                <span>Status</span>
                <span>Registered On</span>
                <span>Entry QR</span>
              </div>

              {registrations.map((registration) => (
                <div
                  key={registration.id}
                  className="grid grid-cols-1 items-center gap-3 border-b border-[#E2D6C7] px-5 py-5 last:border-b-0 sm:grid-cols-4"
                >
                  <div>
                    <p className="font-semibold">
                      {registration.eventTitle || `Event #${registration.eventId}`}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Registration #{registration.id}
                    </p>
                  </div>

                  <div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      <CheckCircle2 size={13} />
                      REGISTERED
                    </span>
                  </div>

                  <div className="text-sm text-gray-500">
                    {registration.registeredAt
                      ? new Date(
                          registration.registeredAt
                        ).toLocaleDateString("en-IN")
                      : "—"}
                  </div>
                  <EntryTicketQr
                    ticketCode={registration.ticketCode}
                    eventTitle={registration.eventTitle || `Event #${registration.eventId}`}
                    eventStartDate={registration.eventStartDate}
                    eventEndDate={registration.eventEndDate}
                    eventLocation={registration.eventLocation}
                    attendeeName={registration.visitorName}
                    attendeeType="Visitor"
                    ticketNumber={registration.id}
                    issuedAt={registration.registeredAt}
                  />
                </div>
              ))}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default MyRegistrations;
