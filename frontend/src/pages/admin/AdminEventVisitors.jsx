import { useEffect, useState } from "react";
import {
  Users,
  Loader2,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Mail,
  Phone,
  CalendarDays,
  Download,
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";

import { getEventById, getEventRegistrations } from "../../api/eventApi";
import { exportExcel } from "../../utils/exportExcel";
import ProfileAvatar from "../../components/ProfileAvatar";

export default function AdminEventVisitors() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [eventResponse, visitorsResponse] = await Promise.all([
        getEventById(id),
        getEventRegistrations(id),
      ]);

      setEvent(eventResponse);

      const visitorsArray = Array.isArray(visitorsResponse)
        ? visitorsResponse
        : visitorsResponse?.content || [];

      setVisitors(visitorsArray);
    } catch (err) {
      console.error("Failed to load visitors:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load visitor registrations."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const exportVisitors = () => exportExcel({
    fileName: `event-${id}-visitors`,
    sheetName: "Event Visitors",
    columns: [
      { label: "Registration ID", value: "id" },
      { label: "Visitor ID", value: (row) => row.visitorId || row.userId || row.visitor?.id },
      { label: "Name", value: (row) => row.visitorName || row.visitor?.name || row.user?.name },
      { label: "Email", value: (row) => row.email || row.visitor?.email || row.user?.email },
      { label: "Phone", value: (row) => row.phone || row.visitor?.phone },
      { label: "Event", value: (row) => row.eventTitle || event?.title },
      { label: "Registered At", value: "registeredAt" },
    ],
    rows: visitors,
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F3EA]">
        <div className="flex items-center gap-3 text-[#6B4226]">
          <Loader2 size={28} className="animate-spin" />
          <span className="text-lg font-semibold">Loading visitors...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F3EA]">
      <header className="border-b border-[#D8CDBE] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <Link
              to="/admin/events"
              className="mb-2 inline-flex items-center gap-2 font-medium text-[#6B4226]"
            >
              <ArrowLeft size={18} />
              Back to Events
            </Link>
            <h1 className="text-2xl font-bold text-[#2B2118]">
              Event Visitors
            </h1>

            <p className="mt-1 text-sm text-gray-600">
              {event?.title || "Event"} - Registered Visitors
            </p>
          </div>

          <div className="flex gap-2">
            <button onClick={exportVisitors} className="flex items-center gap-2 rounded-lg border border-[#B4532D] bg-white px-4 py-2 text-sm font-medium text-[#B4532D] hover:bg-[#FFF7F1]"><Download size={16} /> Export Excel</button>
            <button onClick={loadData} disabled={loading} className="flex items-center gap-2 rounded-lg border border-[#B4532D] px-4 py-2 text-sm font-medium text-[#B4532D] hover:bg-[#B4532D] hover:text-white disabled:opacity-60">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            <div className="flex items-start gap-3">
              <AlertCircle size={22} />

              <div>
                <h2 className="font-semibold">Error</h2>

                <p className="mt-1 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-[#E2D8CB] bg-white shadow-sm">
          {visitors.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <Users size={45} className="mx-auto text-[#B4532D]" />

              <h2 className="mt-4 text-xl font-semibold text-[#2B2118]">
                No visitors registered
              </h2>

              <p className="mt-2 text-gray-500">
                No visitors have registered for this event yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-[#F8F3EA]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2B2118]">
                      Visitor
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2B2118]">
                      Email
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2B2118]">
                      Phone
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2B2118]">
                      Registered On
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E2D8CB]">
                  {visitors.map((registration, index) => {
                    const visitor =
                      registration.visitor ||
                      registration.user ||
                      registration;

                    const name =
                      visitor.name ||
                      visitor.fullName ||
                      registration.visitorName ||
                      "Visitor";

                    const email =
                      visitor.email ||
                      registration.email ||
                      "—";

                    const phone =
                      visitor.phone ||
                      visitor.mobile ||
                      visitor.phoneNumber ||
                      registration.phone ||
                      "—";

                    const registeredDate =
                      registration.createdAt ||
                      registration.registeredAt ||
                      registration.registrationDate;

                    return (
                      <tr
                        key={registration.id || index}
                        className="hover:bg-[#FCF9F4]"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <ProfileAvatar src={registration.photoUrl || visitor.photoUrl} name={name} className="h-10 w-10" />

                            <p className="font-semibold text-[#2B2118]">
                              {name}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail size={14} />
                            {email}
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone size={14} />
                            {phone}
                          </div>
                        </td>

                        <td className="px-6 py-5 text-sm text-gray-600">
                          {registeredDate ? (
                            <div className="flex items-center gap-2">
                              <CalendarDays size={14} />
                              {new Date(registeredDate).toLocaleDateString()}
                            </div>
                          ) : (
                            "—"
                          )}
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
