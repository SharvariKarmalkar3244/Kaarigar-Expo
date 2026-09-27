import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Ticket,
  RefreshCw,
  ArrowRight,
  AlertCircle,
  User,
  FileText,
  ArrowLeft,
} from "lucide-react";

import { getMyRegistrations } from "../../api/visitorApi";

function VisitorDashboard() {
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
      console.error("Visitor registrations error:", err);

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

  const totalRegistrations = registrations.length;

  /*
   * Your current EventRegistrationResponse only contains:
   *
   * id
   * userId
   * eventId
   * registeredAt
   *
   * Therefore we cannot reliably calculate an "attended"
   * count from the current backend response.
   *
   * For now, Upcoming is treated as registrations that exist.
   */
  const upcomingRegistrations = registrations.length;

  return (
    <div className="min-h-screen bg-[#F8F3EA] text-[#2B2118]">
      {/* Header */}
      <header className="border-b border-[#D8C9B5] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <div>
              <h1 className="text-xl font-bold text-[#6B4226]">
                Kaarigar Expo
              </h1>
              <p className="text-xs text-gray-500">
                Visitor Dashboard
              </p>
            </div>

            <nav className="hidden items-center gap-6 md:flex">
              <Link
                to="/visitor"
                className="flex items-center gap-2 text-sm font-medium text-[#B4532D]"
              >
                <Ticket size={17} />
                Dashboard
              </Link>

              <Link
                to="/visitor/registrations"
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#B4532D]"
              >
                <FileText size={17} />
                My Registrations
              </Link>

              <Link
                to="/visitor/profile"
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#B4532D]"
              >
                <User size={17} />
                Profile
              </Link>
            </nav>
          </div>

          <Link
            to="/events"
            className="rounded-lg bg-[#B4532D] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#963F21]"
          >
            Browse Events
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Page title */}
        <div className="mb-7 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">
              Visitor Dashboard
            </h2>

            <p className="mt-1 text-sm text-[#5B6B82]">
              Manage your event registrations and profile.
            </p>
          </div>

          <button
            onClick={loadRegistrations}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-[#B4532D] bg-white px-4 py-2 text-sm font-medium text-[#B4532D] hover:bg-[#FFF7F1] disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />

            <div>
              <p className="font-semibold">
                Unable to load registrations
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Total */}
          <div className="rounded-xl border border-[#E2D6C7] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#5B6B82]">
                  Total Registrations
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {loading ? "—" : totalRegistrations}
                </p>
              </div>

              <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                <Ticket size={22} />
              </div>
            </div>
          </div>

          {/* Upcoming */}
          <div className="rounded-xl border border-[#E2D6C7] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#5B6B82]">
                  Upcoming Events
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {loading ? "—" : upcomingRegistrations}
                </p>
              </div>

              <div className="rounded-xl bg-yellow-100 p-3 text-yellow-700">
                <Clock3 size={22} />
              </div>
            </div>
          </div>

          {/* Attended */}
          <div className="rounded-xl border border-[#E2D6C7] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#5B6B82]">
                  Attended Events
                </p>

                <p className="mt-2 text-3xl font-bold">
                  0
                </p>
              </div>

              <div className="rounded-xl bg-green-100 p-3 text-green-600">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Registrations */}
        <section className="mt-8 overflow-hidden rounded-xl border border-[#E2D6C7] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E2D6C7] px-5 py-4">
            <div>
              <h3 className="font-bold">
                My Registrations
              </h3>

              <p className="mt-1 text-xs text-[#5B6B82]">
                View your event registrations.
              </p>
            </div>

            <Link
              to="/visitor/registrations"
              className="flex items-center gap-1 text-sm font-medium text-[#B4532D] hover:underline"
            >
              View All
              <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-14">
              <RefreshCw
                size={25}
                className="animate-spin text-[#B4532D]"
              />
            </div>
          ) : registrations.length === 0 ? (
            <div className="py-14 text-center">
              <CalendarDays
                size={38}
                className="mx-auto text-gray-400"
              />

              <h4 className="mt-4 font-semibold">
                No registrations yet
              </h4>

              <p className="mt-1 text-sm text-gray-500">
                Register for an event to see it here.
              </p>

              <Link
                to="/events"
                className="mt-5 inline-flex rounded-lg bg-[#B4532D] px-5 py-2.5 text-sm font-semibold text-white"
              >
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#E2D6C7]">
              {registrations.slice(0, 5).map((registration) => (
                <div
                  key={registration.id}
                  className="grid gap-3 px-5 py-4 md:grid-cols-3 md:items-center"
                >
                  {/* Replace this in VisitorDashboard.jsx */}
                  <div>
                    <p className="font-semibold">
                      {registration.eventTitle || registration.event?.title || `Event #${registration.eventId}`}
                    </p>

                    <p className="text-xs text-gray-500">
                      Registration ID: #{registration.id}
                    </p>
                  </div>

                  <div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      <CheckCircle2 size={13} />
                      REGISTERED
                    </span>
                  </div>

                  <div className="text-sm text-gray-500 md:text-right">
                    {registration.registeredAt
                      ? new Date(
                          registration.registeredAt
                        ).toLocaleDateString("en-IN")
                      : "—"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default VisitorDashboard;