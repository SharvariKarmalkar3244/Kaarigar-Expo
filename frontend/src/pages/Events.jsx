import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  MapPin,
  CalendarDays,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { getEvents } from "../api/eventApi";
import { useAuth } from "../context/AuthContext";
import EventImage from "../components/EventImage";

export default function Events() {
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [city, setCity] = useState("ALL");
  const [status, setStatus] = useState("UPCOMING");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // Load Events
  // --------------------------------------------------
  const loadEvents = useCallback(async (pageNumber = page) => {
    try {
      setLoading(true);
      setError("");

      const data = await getEvents({ page: pageNumber, size: 9, status, city: city === "ALL" ? undefined : city, q: submittedSearch || undefined });

      if (Array.isArray(data?.content)) {
        setEvents(data.content);
        setTotalPages(data.totalPages || 0);
      } else if (Array.isArray(data)) {
        setEvents(data);
        setTotalPages(1);
      } else if (Array.isArray(data?.data)) {
        setEvents(data.data);
      } else {
        setEvents([]);
      }
    } catch (err) {
      console.error("Failed to load events:", err);
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Unable to load events.";
      setError(String(message));
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [city, page, status, submittedSearch]);

  useEffect(() => {
    const timer = window.setTimeout(() => loadEvents(page), 0);
    return () => window.clearTimeout(timer);
  }, [loadEvents, page]);

  // --------------------------------------------------
  // Cities List
  // --------------------------------------------------
  const cities = useMemo(() => {
    const uniqueCities = events
      .map((event) => event.city || event.location)
      .filter(Boolean);

    return ["ALL", ...new Set(uniqueCities)];
  }, [events]);

  // --------------------------------------------------
  // Filter Events
  // --------------------------------------------------
  const filteredEvents = events;

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

          <div className="flex items-center gap-3">
            {!isAuthenticated && (
              <>
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
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Search Bar */}
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center overflow-hidden rounded-full border border-gray-200 bg-white p-1.5 shadow-sm focus-within:border-[#8B3A1B]">
            <div className="flex flex-1 items-center gap-3 px-4">
              <Search className="h-5 w-5 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search events by name or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
              />
            </div>

            <button
              onClick={() => { setPage(0); setSubmittedSearch(search.trim()); }}
              className="rounded-full bg-[#8B3A1B] px-7 py-2.5 text-sm font-medium text-white transition hover:bg-[#722F15]"
            >
              Search
            </button>
          </div>

          {/* Filters Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-gray-600">
            <div className="flex items-center gap-2">
              <span>Filter City:</span>
              <select
                value={city}
                onChange={(e) => { setCity(e.target.value); setPage(0); }}
                className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs focus:outline-none"
              >
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span>Status:</span>
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(0); }}
                className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs focus:outline-none"
              >
                <option value="UPCOMING">Upcoming Only</option>
                <option value="ALL">All Statuses</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section Title dynamically updates */}
        <div className="mt-12">
          <h1 className="font-serif text-3xl font-bold text-[#2B2118]">
            {status === "UPCOMING"
              ? "Upcoming Melas"
              : status === "COMPLETED"
              ? "Completed Melas"
              : status === "ONGOING"
              ? "Ongoing Melas"
              : "All Melas"}
          </h1>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-start gap-4">
              <AlertCircle size={24} className="mt-1 shrink-0 text-red-600" />
              <div className="flex-1">
                <h2 className="font-bold text-red-800">
                  Unable to Load Events
                </h2>
                <p className="mt-1 text-sm text-red-700">{error}</p>
                <button
                  onClick={loadEvents}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  <RefreshCw size={16} />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && totalPages > 1 && (
          <nav className="mt-8 flex items-center justify-center gap-4" aria-label="Event pages">
            <button onClick={() => setPage((current) => Math.max(0, current - 1))} disabled={page === 0}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-40">Previous</button>
            <span className="text-sm text-gray-600">Page {page + 1} of {totalPages}</span>
            <button onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))} disabled={page + 1 >= totalPages}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-40">Next</button>
          </nav>
        )}

        {/* Loading / Empty / Grid States */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex items-center gap-3 text-[#6B4226]">
              <Loader2 size={28} className="animate-spin" />
              <span className="text-base font-semibold">
                Loading events...
              </span>
            </div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="mt-10 rounded-2xl bg-[#EFE8DC]/50 py-16 text-center">
            <p className="text-lg font-medium text-gray-700">
              {status === "UPCOMING"
                ? "No upcoming events found matching your search criteria."
                : status === "COMPLETED"
                ? "No completed events found matching your search criteria."
                : status === "ONGOING"
                ? "No ongoing events found matching your search criteria."
                : "No events found matching your search criteria."}
            </p>
          </div>
        ) : (
          /* Event Grid */
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => {
              const eventId = event.id || event._id;

              return (
                <div
                  key={eventId}
                  className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* Event Thumbnail */}
                  <div className="h-52 w-full overflow-hidden bg-gray-100">
                    <EventImage
                      src={event.imageUrl}
                      alt={event.title}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>

                  {/* Card Details */}
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="font-serif text-xl font-bold text-[#2B2118]">
                      {event.title}
                    </h2>

                    <div className="mt-3 space-y-1.5 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin size={15} className="shrink-0 text-gray-400" />
                        <span>
                          {event.location || event.city || "Location TBA"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <CalendarDays
                          size={15}
                          className="shrink-0 text-gray-400"
                        />
                        <span>
                          {event.startDate
                            ? `${event.startDate} ${
                                event.endDate ? `- ${event.endDate}` : ""
                              }`
                            : "Dates TBA"}
                        </span>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <div className="mt-6 pt-2">
                      <Link
                        to={`/events/${eventId}`}
                        className="block w-full rounded-xl bg-[#8B3A1B] py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#722F15]"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
