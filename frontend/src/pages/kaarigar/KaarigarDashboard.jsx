import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  XCircle,
  FileText,
  Loader2,
  AlertCircle,
  User,
  LayoutDashboard,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getEventById } from "../../api/eventApi";
import { getMyApplications } from "../../api/kaarigarApi";

export default function KaarigarDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyApplications();
      let data = response;

      if (Array.isArray(response)) {
        data = response;
      } else if (Array.isArray(response?.content)) {
        data = response.content;
      } else if (Array.isArray(response?.data)) {
        data = response.data;
      } else {
        data = [];
      }

      const applicationsWithEvents = await Promise.all(
        data.map(async (app) => {
          if (!app.event && !app.eventDetails && app.eventId) {
            try {
              const eventDetails = await getEventById(app.eventId);
              return { ...app, event: eventDetails };
            } catch (err) {
              console.warn(`Event ${app.eventId} not found (404), using fallback.`);
              return {
                ...app,
                event: { title: app.eventTitle || `Event #${app.eventId}` }
              };
            }
          }
          return app;
        })
      );

      setApplications(applicationsWithEvents);
    } catch (err) {
      console.error("Failed to load Kaarigar applications:", err);
      setError(
        err.response?.data?.message || "Unable to load applications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const approved = applications.filter(
    (a) => a.status?.toUpperCase() === "APPROVED"
  ).length;

  const pending = applications.filter(
    (a) => a.status?.toUpperCase() === "PENDING"
  ).length;

  const rejected = applications.filter(
    (a) => a.status?.toUpperCase() === "REJECTED"
  ).length;

  return (
    <div className="min-h-screen bg-[#F7F3EB] text-[#2B2118]">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-100 px-8 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-10">
            <Link
              to="/kaarigar"
              className="font-serif text-xl font-bold text-[#6B4226]"
            >
              Kaarigar Expo
            </Link>

            <nav className="flex items-center gap-6 text-sm">
              <Link
                to="/kaarigar"
                className="flex items-center gap-1.5 font-semibold text-[#B4532D]"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
              <Link
                to="/kaarigar/profile"
                className="flex items-center gap-1.5 font-medium text-gray-500 transition hover:text-[#B4532D]"
              >
                <User size={16} />
                My Profile
              </Link>
              <Link
                to="/kaarigar/applications"
                className="flex items-center gap-1.5 font-medium text-gray-500 transition hover:text-[#B4532D]"
              >
                <FileText size={16} />
                My Applications
              </Link>
            </nav>
          </div>

          <Link
            to="/events"
            className="rounded-lg bg-[#B4532D] px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#963F22]"
          >
            Browse Events
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-8 py-8">
        {/* Dashboard Title Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#2B2118]">
              Kaarigar Dashboard
            </h1>
            <p className="mt-1 text-xs text-gray-500">
              Manage your applications and profile.
            </p>
          </div>

          <button
            onClick={loadApplications}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-[#B4532D] bg-white px-3.5 py-1.5 text-xs font-medium text-[#B4532D] transition hover:bg-[#FDFBF7] disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
            <AlertCircle size={16} className="shrink-0 text-red-600" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Metric Cards Grid */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total"
            value={applications.length}
            icon={<FileText size={18} className="text-[#3B82F6]" />}
            iconBg="bg-[#EFF6FF]"
          />
          <StatCard
            title="Approved"
            value={approved}
            icon={<CheckCircle2 size={18} className="text-[#22C55E]" />}
            iconBg="bg-[#F0FDF4]"
          />
          <StatCard
            title="Pending"
            value={pending}
            icon={<Clock3 size={18} className="text-[#EAB308]" />}
            iconBg="bg-[#FEFCE8]"
          />
          <StatCard
            title="Rejected"
            value={rejected}
            icon={<XCircle size={18} className="text-[#EF4444]" />}
            iconBg="bg-[#FEF2F2]"
          />
        </div>

        {/* Applications List Section */}
        <div className="mt-8 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2B2118]">
                My Applications
              </h2>
              <p className="mt-0.5 text-xs text-gray-400">
                Track the status of your event applications.
              </p>
            </div>
            <Link
              to="/kaarigar/applications"
              className="text-xs font-semibold text-[#B4532D] hover:underline"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                <Loader2 size={18} className="animate-spin text-[#B4532D]" />
                Loading applications...
              </div>
            </div>
          ) : applications.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FileText size={36} className="mx-auto text-gray-300" />
              <h3 className="mt-3 font-semibold text-[#2B2118]">
                No applications yet
              </h3>
              <p className="mt-1 text-xs text-gray-400">
                Apply for an event to see your applications here.
              </p>
              <Link
                to="/events"
                className="mt-4 inline-block rounded-lg bg-[#B4532D] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#963F22]"
              >
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FBF8F3] border-b border-gray-100 text-[11px] font-semibold text-gray-600">
                    <th className="px-6 py-3.5">Event</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Applied On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {applications.slice(0, 5).map((application, index) => {
                    const status =
                      application.status?.toUpperCase() || "PENDING";
                    const event =
                      application.event || application.eventDetails || {};
                    const eventTitle =
                      event.title ||
                      event.name ||
                      application.eventTitle ||
                      application.eventName ||
                      application.title ||
                      (application.eventId
                        ? `Event #${application.eventId}`
                        : "Event");
                    const locationName =
                      event.city ||
                      event.location ||
                      application.location ||
                      application.city;
                    const appliedDate =
                      application.createdAt ||
                      application.appliedAt ||
                      application.applicationDate;

                    return (
                      <tr
                        key={application.id || index}
                        className="transition hover:bg-[#FAF8F5]"
                      >
                        <td className="px-6 py-4">
                          <p className="font-bold text-[#2B2118]">
                            {eventTitle}
                          </p>
                          {locationName && (
                            <p className="mt-0.5 text-[11px] text-gray-400">
                              {locationName}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={status} />
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {appliedDate
                            ? new Date(appliedDate).toLocaleDateString()
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, iconBg }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs font-medium text-gray-400">{title}</p>
        <p className="mt-1 font-serif text-3xl font-bold text-[#2B2118]">
          {value}
        </p>
      </div>
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBg}`}
      >
        {icon}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  let badgeStyle = "bg-[#FEF9C3] text-[#854D0E]";
  let icon = <Clock3 size={13} className="text-[#854D0E]" />;

  if (status === "APPROVED") {
    badgeStyle = "bg-[#DCFCE7] text-[#166534]";
    icon = <CheckCircle2 size={13} className="text-[#166534]" />;
  } else if (status === "REJECTED") {
    badgeStyle = "bg-[#FEE2E2] text-[#991B1B]";
    icon = <XCircle size={13} className="text-[#991B1B]" />;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide ${badgeStyle}`}
    >
      {icon}
      {status}
    </span>
  );
}