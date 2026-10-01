import { useEffect, useState } from "react";
import {
  CalendarDays,
  Users,
  FileText,
  CheckCircle2,
  Clock3,
  XCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
  LayoutDashboard,
  CalendarRange,
  TicketCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

import { getAuditLog, getEventAnalytics, getEvents } from "../../api/eventApi";
import {
  getAllKaarigars,
  getPendingApplications,
} from "../../api/kaarigarApi";

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [kaarigarCount, setKaarigarCount] = useState(0);
  const [applications, setApplications] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [auditRows, setAuditRows] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        eventsResponse,
        kaarigarsResponse,
        applicationsResponse,
        analyticsResponse,
        auditResponse,
      ] = await Promise.all([
        getEvents({ page: 0, size: 9 }),
        getAllKaarigars({ page: 0, size: 1 }),
        getPendingApplications({ page: 0, size: 5 }),
        getEventAnalytics(),
        getAuditLog(),
      ]);

      setAnalytics(analyticsResponse);
      setAuditRows(auditResponse?.content || []);

      setEvents(
        Array.isArray(eventsResponse)
          ? eventsResponse
          : eventsResponse?.content || []
      );

      setKaarigarCount(
        kaarigarsResponse?.totalElements ?? kaarigarsResponse?.length ?? 0
      );

      setApplications(
        Array.isArray(applicationsResponse)
          ? applicationsResponse
          : applicationsResponse?.content || []
      );
    } catch (err) {
      console.error(
        "Failed to load admin dashboard:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadDashboard();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F3EA] text-[#2B2118]">
      {/* Navbar */}
      <header className="border-b border-[#D8C9B5] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-5 px-6 py-4">
          <div className="flex min-w-0 items-center gap-8">
            <div className="shrink-0">
              <Link to="/admin" className="text-xl font-bold text-[#6B4226]">
                Kaarigar Expo
              </Link>
              <p className="text-xs text-gray-500">Admin Dashboard</p>
            </div>

            <nav className="hidden items-center gap-6 lg:flex">
              <Link
                to="/admin"
                className="flex items-center gap-2 text-sm font-medium text-[#B4532D]"
              >
                <LayoutDashboard size={17} />
                Dashboard
              </Link>

              <Link
                to="/admin/applications"
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#B4532D]"
              >
                <FileText size={17} />
                Applications
              </Link>

              <Link
                to="/admin/events"
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#B4532D]"
              >
                <CalendarRange size={17} />
                Events
              </Link>

              <Link
                to="/admin/kaarigars"
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#B4532D]"
              >
                <Users size={17} />
                Kaarigars
              </Link>
            </nav>
          </div>

          <Link
            to="/events"
            className="shrink-0 rounded-lg bg-[#B4532D] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#963F21]"
          >
            Browse Events
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Heading */}
        <div className="mb-7 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#2B2118]">
              Admin Dashboard
            </h1>

            <p className="mt-1 text-sm text-[#5B6B82]">
              Manage events, kaarigars and applications.
            </p>
          </div>

          <button
            onClick={loadDashboard}
            disabled={loading}
            className="flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[#B4532D] bg-white px-4 py-2 text-sm font-medium text-[#B4532D] hover:bg-[#FFF7F1] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={
                loading ? "animate-spin" : ""
              }
            />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            <div className="flex items-start gap-3">
              <AlertCircle size={22} />

              <div>
                <h2 className="font-semibold">
                  Dashboard Error
                </h2>

                <p className="mt-1 text-sm">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Total Events"
            value={analytics?.totalEvents ?? events.length}
            icon={<CalendarDays size={24} />}
            iconClass="bg-blue-100 text-blue-700"
          />

          <StatCard
            title="Total Kaarigars"
            value={kaarigarCount}
            icon={<Users size={24} />}
            iconClass="bg-purple-100 text-purple-700"
          />

          <StatCard
            title="Pending Applications"
            value={analytics?.pendingApplications ?? applications.length}
            icon={<Clock3 size={24} />}
            iconClass="bg-yellow-100 text-yellow-700"
          />

          <StatCard
            title="Attendees Checked In"
            value={`${analytics?.checkedInTickets ?? 0} / ${analytics?.totalTickets ?? 0}`}
            icon={<TicketCheck size={24} />}
            iconClass="bg-green-100 text-green-700"
          />

          <StatCard
            title="Seat Capacity"
            value={`${analytics?.registeredCapacity ?? 0} / ${analytics?.totalCapacity ?? 0} (${analytics?.capacityUtilizationPercent ?? 0}%)`}
            icon={<Users size={24} />}
            iconClass="bg-orange-100 text-orange-700"
          />
        </div>

        <section className="mt-8 overflow-hidden rounded-xl border border-[#E2D6C7] bg-white shadow-sm">
          <div className="border-b border-[#E2D6C7] px-5 py-4"><h2 className="font-bold">Recent activity</h2><p className="mt-1 text-xs text-[#5B6B82]">Event changes and ticket scans recorded for accountability.</p></div>
          {auditRows.length === 0 ? <p className="px-5 py-8 text-sm text-gray-500">No audited activity yet.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="bg-[#F8F3EA] text-xs"><tr><th className="px-5 py-3">Action</th><th className="px-5 py-3">Actor</th><th className="px-5 py-3">Details</th><th className="px-5 py-3">When</th></tr></thead><tbody>{auditRows.map((row) => <tr key={row.id} className="border-t border-gray-100"><td className="px-5 py-3 font-semibold">{row.action}</td><td className="px-5 py-3">{row.actorEmail || "Admin"}</td><td className="max-w-[260px] truncate px-5 py-3">{row.details || `${row.entityType} #${row.entityId}`}</td><td className="px-5 py-3 text-gray-600">{new Date(row.occurredAt).toLocaleString()}</td></tr>)}</tbody></table></div>}
        </section>

        {/* Pending applications */}
        <section className="mt-8 overflow-hidden rounded-xl border border-[#E2D6C7] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E2D6C7] px-5 py-4">
            <div>
              <h2 className="font-bold text-[#2B2118]">
                Pending Applications
              </h2>

              <p className="mt-1 text-xs text-[#5B6B82]">
                Applications waiting for admin review.
              </p>
            </div>

            <Link
              to="/admin/applications"
              className="text-sm font-semibold text-[#B4532D] hover:underline"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <div className="flex min-h-[220px] items-center justify-center">
              <div className="flex items-center gap-3 text-[#6B4226]">
                <Loader2
                  size={24}
                  className="animate-spin"
                />
                Loading dashboard...
              </div>
            </div>
          ) : applications.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <CheckCircle2
                size={40}
                className="mx-auto text-green-600"
              />

              <h3 className="mt-4 font-semibold text-[#2B2118]">
                No pending applications
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                All applications have been reviewed.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-[#F8F3EA]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2B2118]">
                      Kaarigar
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2B2118]">
                      Event
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2B2118]">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E2D8CB]">
                  {applications
                    .slice(0, 5)
                    .map((application, index) => {
                      const kaarigarName =
                        application.kaarigarName ||
                        application.artisanName ||
                        "Kaarigar";

                      // Lookup matching event from loaded events list by eventId
                      const matchingEvent = events.find(
                        (e) => e.id === application.eventId
                      );

                      const eventTitle =
                        matchingEvent?.title ||
                        matchingEvent?.name ||
                        (application.eventTitle &&
                        !application.eventTitle.startsWith("Event #")
                          ? application.eventTitle
                          : null) ||
                        `Event #${application.eventId}`;

                      const status =
                        application.status?.toUpperCase() ||
                        "PENDING";

                      return (
                        <tr
                          key={
                            application.id || index
                          }
                          className="hover:bg-[#FCF9F4]"
                        >
                          <td className="px-6 py-5">
                            <p className="font-semibold text-[#2B2118]">
                              {kaarigarName}
                            </p>
                          </td>

                          <td className="px-6 py-5">
                            <p className="font-medium text-[#2B2118]">
                              {eventTitle}
                            </p>

                            {matchingEvent?.city && (
                              <p className="mt-1 text-sm text-gray-500">
                                {matchingEvent.city}
                              </p>
                            )}
                          </td>

                          <td className="px-6 py-5">
                            <StatusBadge
                              status={status}
                            />
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  iconClass,
}) {
  return (
    <div className="rounded-xl border border-[#E2D6C7] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#5B6B82]">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-[#2B2118]">
            {value}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  let className =
    "bg-yellow-100 text-yellow-700";

  let icon = <Clock3 size={16} />;

  if (status === "APPROVED") {
    className = "bg-green-100 text-green-700";
    icon = <CheckCircle2 size={16} />;
  }

  if (status === "REJECTED") {
    className = "bg-red-100 text-red-700";
    icon = <XCircle size={16} />;
  }

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${className}`}
    >
      {icon}
      {status}
    </span>
  );
}
