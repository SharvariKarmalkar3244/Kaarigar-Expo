import { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock3,
  Loader2,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import ProfileAvatar from "../../components/ProfileAvatar";
import WorkImageGallery from "../../components/WorkImageGallery";
import { Link } from "react-router-dom";

import { getEvents } from "../../api/eventApi";
import {
  getPendingApplications,
  reviewApplication,
} from "../../api/kaarigarApi";

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] =
    useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [appsResponse, eventsResponse] =
        await Promise.all([
          getPendingApplications(),
          getEvents(),
        ]);

      setApplications(
        Array.isArray(appsResponse)
          ? appsResponse
          : appsResponse?.content || []
      );

      setEvents(
        Array.isArray(eventsResponse)
          ? eventsResponse
          : eventsResponse?.content || []
      );
    } catch (err) {
      console.error(
        "Failed to load application management data:",
        err
      );

      setError(
        err.response?.data?.detail || err.response?.data?.message ||
          "Unable to load data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReview = async (
    id,
    status
  ) => {
    try {
      setProcessingId(id);
      setError("");
      setSuccess("");

      let rejectionReason = null;

      if (status === "REJECTED") {
        rejectionReason =
          window.prompt(
            "Enter rejection reason:"
          );

        if (
          rejectionReason === null
        ) {
          setProcessingId(null);
          return;
        }
      }

      await reviewApplication(id, {
        status,
        rejectionReason,
      });

      setSuccess(
        `Application ${status.toLowerCase()} successfully.`
      );

      await loadData();
    } catch (err) {
      console.error(
        "Failed to review application:",
        err
      );

      setError(
        err.response?.data?.detail || err.response?.data?.message ||
          "Unable to review application."
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F3EA]">
      <header className="border-b border-[#D8CDBE] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-[#2B2118]">
              Application Management
            </h1>

            <p className="mt-1 text-sm text-gray-600">
              Review pending Kaarigar applications.
            </p>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-[#B4532D] px-4 py-2 text-sm font-medium text-[#B4532D] hover:bg-[#B4532D] hover:text-white disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Link
          to="/admin"
          className="mb-6 inline-flex items-center gap-2 font-medium text-[#6B4226]"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <div className="flex gap-3">
              <AlertCircle size={21} />

              <div>
                <p className="font-semibold">
                  Error
                </p>

                <p className="text-sm">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
            <div className="flex gap-3">
              <CheckCircle2 size={21} />

              <p className="text-sm font-medium">
                {success}
              </p>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-[#E2D8CB] bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-3 text-[#6B4226]">
                <Loader2
                  size={25}
                  className="animate-spin"
                />
                Loading applications...
              </div>
            </div>
          ) : applications.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <CheckCircle2
                size={45}
                className="mx-auto text-green-600"
              />

              <h2 className="mt-4 text-xl font-semibold text-[#2B2118]">
                No pending applications
              </h2>

              <p className="mt-2 text-gray-500">
                There are currently no applications waiting for review.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead className="bg-[#F8F3EA]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Kaarigar
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Event
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E2D8CB]">
                  {applications.map(
                    (application, index) => {
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

                      const id =
                        application.id;

                      return (
                        <tr
                          key={
                            id || index
                          }
                          className="hover:bg-[#FCF9F4]"
                        >
                          <td className="px-6 py-5">
                            <div className="flex min-w-52 items-center gap-3">
                              <ProfileAvatar src={application.photoUrl} name={kaarigarName} className="h-10 w-10" />
                              <div><p className="font-semibold text-[#2B2118]">{kaarigarName}</p><p className="mt-1 text-xs text-gray-500">{application.phone || "Phone not provided"}</p><p className="text-xs text-gray-500">{application.location || "Location not provided"}</p></div>
                            </div>
                            <WorkImageGallery images={application.workImageUrls} title="Work" className="mt-3 max-w-52" />
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
                            <span className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1.5 text-xs font-semibold text-yellow-700">
                              <Clock3 size={15} />
                              {status}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleReview(
                                    id,
                                    "APPROVED"
                                  )
                                }
                                disabled={
                                  processingId ===
                                  id
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                              >
                                {processingId ===
                                id ? (
                                  <Loader2
                                    size={15}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <CheckCircle2
                                    size={15}
                                  />
                                )}
                                Approve
                              </button>

                              <button
                                onClick={() =>
                                  handleReview(
                                    id,
                                    "REJECTED"
                                  )
                                }
                                disabled={
                                  processingId ===
                                  id
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                              >
                                <XCircle
                                  size={15}
                                />
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
