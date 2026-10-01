import { useEffect, useState } from "react";
import {
  CalendarDays,
  MapPin,
  Users,
  Loader2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Pencil,
  Plus,
  X,
  ArrowLeft,
  Eye,
  Briefcase,
  ImagePlus,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  getEvents,
  deleteEvent,
  createEvent,
  updateEvent,
} from "../../api/eventApi";
import { resolveImageUrl, uploadImage } from "../../api/mediaApi";

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventImageFile, setEventImageFile] = useState(null);
  const [eventImagePreview, setEventImagePreview] = useState("");
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    city: "",
    craftType: "",
    capacity: "",
    imageUrl: "",
  });

  useEffect(() => {
    if (eventImageFile) {
      const previewUrl = URL.createObjectURL(eventImageFile);
      setEventImagePreview(previewUrl);
      return () => URL.revokeObjectURL(previewUrl);
    }
    setEventImagePreview(resolveImageUrl(formData.imageUrl));
  }, [eventImageFile, formData.imageUrl]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getEvents({ page: 0, size: 50, status: "ALL" });

      console.log("Admin events:", response);

      const data = Array.isArray(response)
        ? response
        : response?.content || [];

      setEvents(data);
    } catch (err) {
      console.error("Failed to load events:", err);

      setError(
        err.response?.data?.message || "Unable to load events."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleDelete = async (id, title) => {
    const confirmed = window.confirm(`Delete "${title}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteEvent(id);
      await loadEvents();
    } catch (err) {
      console.error("Failed to delete event:", err);

      setError(
        err.response?.data?.message || "Unable to delete event."
      );
    }
  };

  const handleCreate = () => {
    setEditingEvent(null);
    setEventImageFile(null);
    setFormData({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      location: "",
      city: "",
      craftType: "",
      capacity: "",
      imageUrl: "",
    });
    setShowModal(true);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setEventImageFile(null);
    setFormData({
      title: event.title || "",
      description: event.description || "",
      startDate: event.startDate || "",
      endDate: event.endDate || "",
      location: event.location || "",
      city: event.city || "",
      craftType: event.craftType || "",
      capacity: event.capacity || "",
      imageUrl: event.imageUrl || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      if (!eventImageFile && !formData.imageUrl) {
        setError("Upload an image for this event before saving.");
        return;
      }
      const imageUrl = eventImageFile ? await uploadImage(eventImageFile, "event") : formData.imageUrl;
      const eventData = { ...formData, imageUrl };
      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData);
      } else {
        await createEvent(eventData);
      }

      setShowModal(false);
      setEventImageFile(null);
      await loadEvents();
    } catch (err) {
      console.error("Failed to save event:", err);

      const responseMessage = err.response?.data?.message || err.response?.data;
      setError(typeof responseMessage === "string" ? responseMessage : err.message || "Unable to save event.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F3EA]">
      <header className="border-b border-[#D8CDBE] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <Link
              to="/admin"
              className="mb-2 inline-flex items-center gap-2 font-medium text-[#6B4226]"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-[#2B2118]">
              Event Management
            </h1>

            <p className="mt-1 text-sm text-gray-600">
              Manage Kaarigar Expo events.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={loadEvents}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-[#B4532D] px-4 py-2 text-sm font-medium text-[#B4532D] hover:bg-[#B4532D] hover:text-white disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              onClick={handleCreate}
              className="flex items-center gap-2 rounded-lg bg-[#B4532D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#963F22]"
            >
              <Plus size={17} />
              Create Event
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            <div className="flex gap-3">
              <AlertCircle size={22} />

              <div>
                <h2 className="font-semibold">Event Error</h2>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-3 text-[#6B4226]">
              <Loader2 size={25} className="animate-spin" />
              Loading events...
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-2xl border border-[#E2D8CB] bg-white p-14 text-center">
            <CalendarDays size={45} className="mx-auto text-[#B4532D]" />
            <h2 className="mt-4 text-xl font-semibold text-[#2B2118]">
              No events found
            </h2>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {events.map((event) => {
              const registered = event.registeredCount || 0;
              const capacity = event.capacity || 0;

              return (
                <div
                  key={event.id}
                  className="rounded-2xl border border-[#E2D8CB] bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-[#2B2118]">
                        {event.title}
                      </h2>

                      <p className="mt-2 text-sm text-gray-600">
                        {event.description}
                      </p>
                    </div>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      {event.status}
                    </span>
                  </div>

                  <div className="mt-5 space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={17} />
                      {event.startDate}
                      {event.endDate &&
                        event.endDate !== event.startDate &&
                        ` — ${event.endDate}`}
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin size={17} />
                      {event.location}, {event.city}
                    </div>

                    <div className="flex items-center gap-2">
                      <Users size={17} />
                      {registered} / {capacity} registered
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <button
                      onClick={() => handleEdit(event)}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-[#B4532D] px-3 py-2 text-xs font-semibold text-[#B4532D] hover:bg-[#B4532D] hover:text-white"
                    >
                      <Pencil size={15} />
                      Edit
                    </button>

                    <Link
                      to={`/admin/events/${event.id}/participants`}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-[#B4532D] bg-[#B4532D] px-3 py-2 text-xs font-semibold text-white hover:bg-[#963F22]"
                    >
                      <Briefcase size={15} />
                      Kaarigars
                    </Link>

                    <Link
                      to={`/admin/events/${event.id}/visitors`}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-[#6B4226] px-3 py-2 text-xs font-semibold text-[#6B4226] hover:bg-[#6B4226] hover:text-white"
                    >
                      <Eye size={15} />
                      Visitors
                    </Link>

                    <button
                      onClick={() => handleDelete(event.id, event.title)}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#2B2118]">
                {editingEvent ? "Edit Event" : "Create Event"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full rounded-lg border border-[#E2D8CB] px-4 py-2 focus:border-[#B4532D] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full rounded-lg border border-[#E2D8CB] px-4 py-2 focus:border-[#B4532D] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Event image <span className="text-red-600">*</span>
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  required={!formData.imageUrl && !eventImageFile}
                  onChange={(e) => setEventImageFile(e.target.files?.[0] || null)}
                  className="block w-full rounded-lg border border-[#E2D8CB] p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[#EFE8DC] file:px-3 file:py-1.5 file:font-semibold"
                />
                <p className="mt-1 text-xs text-gray-500">Choose a JPG, PNG, WebP, or GIF image up to 4 MB. Each event uses its own uploaded image.</p>
                {eventImagePreview ? (
                  <div className="relative mt-3 h-36 overflow-hidden rounded-xl border border-[#E2D8CB] bg-[#EFE8DC]">
                    <img src={eventImagePreview} alt="Event image preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setEventImageFile(null);
                        setFormData((current) => ({ ...current, imageUrl: "" }));
                      }}
                      className="absolute right-2 top-2 rounded-full bg-white/95 p-2 text-gray-700 shadow hover:bg-white"
                      aria-label="Remove event image"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 flex h-24 items-center justify-center gap-2 rounded-xl border border-dashed border-[#D8CDBE] bg-[#FDFBF7] text-sm text-gray-500">
                    <ImagePlus size={18} /> Select an image for this event
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#E2D8CB] px-4 py-2 focus:border-[#B4532D] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#E2D8CB] px-4 py-2 focus:border-[#B4532D] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Craft type</label>
                <input
                  type="text"
                  value={formData.craftType}
                  onChange={(e) => setFormData({ ...formData, craftType: e.target.value })}
                  placeholder="For example, pottery or jewelry"
                  className="w-full rounded-lg border border-[#E2D8CB] px-4 py-2 focus:border-[#B4532D] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#E2D8CB] px-4 py-2 focus:border-[#B4532D] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#E2D8CB] px-4 py-2 focus:border-[#B4532D] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Capacity
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                  className="w-full rounded-lg border border-[#E2D8CB] px-4 py-2 focus:border-[#B4532D] focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-lg border border-[#E2D8CB] px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-[#B4532D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#963F22] disabled:cursor-wait disabled:opacity-70"
                >
                  {saving ? "Saving..." : editingEvent ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
