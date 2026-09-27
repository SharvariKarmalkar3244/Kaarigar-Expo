import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  XCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  FileText,
} from "lucide-react";
import { getMyApplications } from "../../api/kaarigarApi";
import { getEventById } from "../../api/eventApi";
import EntryTicketQr from "../../components/EntryTicketQr";
import { Link } from "react-router-dom";

function getStatusIcon(status) {
  switch (status) {
    case "APPROVED":
      return <CheckCircle2 size={13} className="text-[#166534]" />;
    case "REJECTED":
      return <XCircle size={13} className="text-[#991B1B]" />;
    case "PENDING":
    default:
      return <Clock3 size={13} className="text-[#854D0E]" />;
  }
}

function getStatusClass(status) {
  switch (status) {
    case "APPROVED":
      return "bg-[#DCFCE7] text-[#166534]";
    case "REJECTED":
      return "bg-[#FEE2E2] text-[#991B1B]";
    case "PENDING":
    default:
      return "bg-[#FEF9C3] text-[#854D0E]";
  }
}

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyApplications();

      let data = Array.isArray(response)
        ? response
        : response?.content || response?.data || [];

      const applicationsWithEvents = await Promise.all(
        data.map(async (app) => {
          if (!app.event && !app.eventDetails && app.eventId) {
            try {
              const eventDetails = await getEventById(app.eventId);
              return { ...app, event: eventDetails };
            } catch (err) {
              return app;
            }
          }
          return app;
        })
      );

      setApplications(applicationsWithEvents);
    } catch (err) {
      console.error("Failed to load applications:", err);
      setError(
        err.response?.data?.message || "Unable to load your applications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F3EB] text-[#2B2118]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-8 py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <Link
              to="/kaarigar"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8B3A1B] transition hover:underline"
            >
              <ArrowLeft size={14} />
              Back to Dashboard
            </Link>
            <h1 className="mt-2 font-serif text-2xl font-bold text-[#2B2118]">
              My Applications
            </h1>
            <p className="mt-0.5 text-xs text-gray-400">
              View and track your event applications
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
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-8 py-8">
        {/* Loading */}
        {loading && (
          <div className="flex min-h-[250px] items-center justify-center">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <Loader2 size={18} className="animate-spin text-[#B4532D]" />
              <span>Loading applications...</span>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
            <AlertCircle size={16} className="shrink-0 text-red-600" />
            <div className="flex-1">
              <p className="font-semibold">Unable to load applications</p>
              <p className="mt-0.5 text-[#2B2118]/70">{error}</p>
            </div>
            <button
              onClick={loadApplications}
              className="rounded-lg bg-[#B4532D] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#963F22]"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && applications.length === 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
            <FileText size={38} className="mx-auto text-gray-300" />
            <h2 className="mt-3 font-serif text-lg font-bold text-[#2B2118]">
              No applications yet
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              Your event applications will appear here.
            </p>
            <Link
              to="/events"
              className="mt-4 inline-block rounded-lg bg-[#B4532D] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#963F22]"
            >
              Browse Events
            </Link>
          </div>
        )}

        {/* Applications Table Card */}
        {!loading && !error && applications.length > 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FBF8F3] border-b border-gray-100 text-[11px] font-semibold text-gray-600">
                    <th className="px-6 py-3.5">Event</th>
                    <th className="px-6 py-3.5">Status / Entry ticket</th>
                    <th className="px-6 py-3.5">Applied On</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 text-xs">
                  {applications.map((application, index) => {
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
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide ${getStatusClass(
                              status
                            )}`}
                          >
                            {getStatusIcon(status)}
                            {status}
                          </span>
                          {status === "APPROVED" && (
                            <EntryTicketQr
                              ticketCode={application.entryTicketCode}
                              eventTitle={eventTitle}
                              eventStartDate={event.startDate}
                              eventEndDate={event.endDate}
                              eventLocation={event.location || event.city || application.location}
                              attendeeName={application.kaarigarName || application.name}
                              attendeeType="Kaarigar"
                              ticketNumber={application.id}
                              issuedAt={application.reviewedAt || application.appliedAt}
                            />
                          )}
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
          </div>
        )}
      </main>
    </div>
  );
}
