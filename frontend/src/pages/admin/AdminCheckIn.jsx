import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, CameraOff, CheckCircle2, CircleAlert, Loader2, ScanLine, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { getEvents, getEventTickets, verifyEntryTicket } from "../../api/eventApi";

function errorMessage(error) {
  const data = error?.response?.data;
  return data?.message || data?.error || (typeof data === "string" ? data : "Unable to verify this ticket.");
}

export default function AdminCheckIn() {
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [tickets, setTickets] = useState([]);
  const [ticketCode, setTicketCode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraMessage, setCameraMessage] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const scanTimerRef = useRef(null);
  const processingRef = useRef(false);

  const stopCamera = useCallback(() => {
    if (scanTimerRef.current) window.clearTimeout(scanTimerRef.current);
    scanTimerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    detectorRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  }, []);

  const loadTickets = useCallback(async (selectedId = eventId) => {
    if (!selectedId) { setTickets([]); return; }
    try {
      const data = await getEventTickets(selectedId);
      setTickets(Array.isArray(data) ? data : []);
    } catch {
      setTickets([]);
    }
  }, [eventId]);

  useEffect(() => {
    let active = true;
    getEvents().then((data) => {
      if (!active) return;
      const list = Array.isArray(data) ? data : data?.content || [];
      setEvents(list);
      if (list.length) setEventId(String(list[0].id));
    }).catch((err) => {
      if (active) setError(errorMessage(err));
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    loadTickets(eventId);
    setResult(null);
    setError("");
    stopCamera();
  }, [eventId, loadTickets, stopCamera]);

  useEffect(() => () => {
    if (scanTimerRef.current) window.clearTimeout(scanTimerRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const verifyCode = async (rawCode) => {
    const code = rawCode.trim();
    if (!code || !eventId || processingRef.current) return;
    processingRef.current = true;
    setChecking(true);
    setError("");
    setResult(null);
    try {
      const ticket = await verifyEntryTicket(code, eventId);
      setResult(ticket);
      setTicketCode("");
      await loadTickets(eventId);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      processingRef.current = false;
      setChecking(false);
      stopCamera();
    }
  };

  const startCamera = async () => {
    setError("");
    setCameraMessage("");
    if (!("BarcodeDetector" in window)) {
      setCameraMessage("QR scanning is not supported by this browser. Enter the ticket code below to verify it.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraMessage("Camera access requires a secure browser context. Enter the ticket code below to verify it.");
      return;
    }
    try {
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      streamRef.current = stream;
      detectorRef.current = detector;
      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraActive(true);
      const scan = async () => {
        if (!videoRef.current || !detectorRef.current || processingRef.current) return;
        try {
          const codes = await detectorRef.current.detect(videoRef.current);
          if (codes[0]?.rawValue) {
            await verifyCode(codes[0].rawValue);
            return;
          }
        } catch { /* Wait for the next camera frame. */ }
        scanTimerRef.current = window.setTimeout(scan, 250);
      };
      scanTimerRef.current = window.setTimeout(scan, 250);
    } catch (err) {
      stopCamera();
      setCameraMessage(err?.name === "NotAllowedError" ? "Camera permission was denied. Allow camera access or enter the ticket code below." : "Could not start the camera. Enter the ticket code below to verify it.");
    }
  };

  const selectedEvent = events.find((event) => String(event.id) === String(eventId));
  const checkedInCount = tickets.filter((ticket) => ticket.checkedIn).length;

  return (
    <div className="min-h-screen bg-[#F8F3EA] px-5 py-8 text-[#2B2118] sm:px-8">
      <main className="mx-auto max-w-6xl">
        <Link to="/admin" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#6B4226]"><ArrowLeft size={17} /> Admin dashboard</Link>
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Event check-in</h1>
            <p className="mt-1 text-sm text-gray-600">Scan a visitor or approved Kaarigar entry QR to verify and record arrival.</p>
          </div>
          <label className="grid gap-1 text-xs font-semibold">
            Event
            <select value={eventId} onChange={(event) => setEventId(event.target.value)} disabled={loading || !events.length} className="min-w-64 rounded-lg border border-[#D8C9B5] bg-white px-3 py-2 text-sm">
              {events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}
            </select>
          </label>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <section className="rounded-2xl border border-[#E2D8CB] bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-lg font-bold">Scan entry pass</h2>
            <p className="mt-1 text-sm text-gray-500">{selectedEvent?.title || "Choose an event"}</p>
            <div className="relative mt-5 overflow-hidden rounded-xl bg-black">
              <video ref={videoRef} playsInline muted className="aspect-video w-full object-cover" />
              {!cameraActive && (
                <div className="absolute inset-0 flex aspect-video flex-col items-center justify-center gap-3 text-white">
                  <ScanLine size={42} />
                  <span className="text-sm">Camera scanner is paused</span>
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {!cameraActive ? (
                <button onClick={startCamera} disabled={!eventId || checking} className="inline-flex items-center gap-2 rounded-lg bg-[#8B3A1B] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Camera size={17} /> Start camera</button>
              ) : (
                <button onClick={stopCamera} className="inline-flex items-center gap-2 rounded-lg border border-[#B4532D] px-4 py-2.5 text-sm font-semibold text-[#B4532D]"><CameraOff size={17} /> Stop camera</button>
              )}
            </div>
            {cameraMessage && <p className="mt-3 text-sm text-amber-800">{cameraMessage}</p>}
            <form onSubmit={(event) => { event.preventDefault(); verifyCode(ticketCode); }} className="mt-6 border-t border-gray-100 pt-5">
              <label htmlFor="ticket-code" className="text-sm font-semibold">Or enter the ticket code</label>
              <div className="mt-2 flex gap-2">
                <input id="ticket-code" value={ticketCode} onChange={(event) => setTicketCode(event.target.value)} placeholder="Paste ticket code" className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm" />
                <button type="submit" disabled={!eventId || checking || !ticketCode.trim()} className="rounded-lg bg-[#6B4226] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{checking ? <Loader2 size={17} className="animate-spin" /> : "Verify"}</button>
              </div>
            </form>
            {error && <div role="alert" className="mt-4 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"><CircleAlert size={18} className="shrink-0" />{error}</div>}
            {result && (
              <div className={`mt-4 rounded-xl border p-4 ${result.alreadyCheckedIn ? "border-amber-200 bg-amber-50 text-amber-900" : "border-green-200 bg-green-50 text-green-900"}`}>
                <div className="flex items-center gap-2 font-bold"><CheckCircle2 size={19} />{result.alreadyCheckedIn ? "Ticket already checked in" : "Entry verified"}</div>
                <p className="mt-2 text-sm">{result.attendeeName || `${result.attendeeType} #${result.userId}`} · {result.attendeeType}</p>
                {result.attendeeEmail && <p className="mt-1 text-xs opacity-75">{result.attendeeEmail}</p>}
                {result.attendeePhone && <p className="mt-1 text-xs opacity-75">{result.attendeePhone}</p>}
                <p className="mt-1 text-xs opacity-75">Ticket {result.ticketCode}</p>
                {result.checkedInAt && <p className="mt-1 text-xs opacity-75">Checked in {new Date(result.checkedInAt).toLocaleString()}</p>}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-[#E2D8CB] bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div><h2 className="text-lg font-bold">Entry list</h2><p className="mt-1 text-sm text-gray-500">Issued event tickets</p></div>
              <div className="rounded-lg bg-[#F8F3EA] px-3 py-2 text-right text-xs"><span className="font-bold">{checkedInCount}/{tickets.length}</span><br />checked in</div>
            </div>
            {loading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div> : tickets.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-500"><Users size={30} className="mx-auto mb-2 opacity-50" />No entry tickets have been issued for this event.</div>
            ) : (
              <div className="mt-5 max-h-[580px] space-y-2 overflow-y-auto">
                {tickets.map((ticket) => <div key={ticket.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3">
                  <div className="min-w-0"><p className="truncate text-sm font-semibold">{ticket.attendeeName || `${ticket.attendeeType} #${ticket.userId}`}</p><p className="mt-1 text-xs text-gray-500">{ticket.attendeeType} · {ticket.attendeeEmail || `ID ${ticket.userId}`}</p></div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${ticket.checkedIn ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>{ticket.checkedIn ? "CHECKED IN" : "EXPECTED"}</span>
                </div>)}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
