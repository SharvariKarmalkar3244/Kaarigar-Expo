import { useRef } from "react";
import { Download, QrCode } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

export default function EntryTicketQr({
  ticketCode,
  eventTitle,
  eventStartDate,
  eventEndDate,
  eventLocation,
  attendeeName,
  attendeeType,
  ticketNumber,
  issuedAt,
}) {
  const qrContainerRef = useRef(null);

  if (!ticketCode) return null;

  const downloadQr = () => {
    const canvas = qrContainerRef.current?.querySelector("canvas");
    if (!canvas) return;

    const width = 1000;
    const height = 1520;
    const output = document.createElement("canvas");
    output.width = width;
    output.height = height;
    const context = output.getContext("2d");
    if (!context) return;

    context.fillStyle = "#f7f1e8";
    context.fillRect(0, 0, width, height);
    context.fillStyle = "#ffffff";
    context.fillRect(36, 36, width - 72, height - 72);
    context.strokeStyle = "#dfd2c2";
    context.lineWidth = 2;
    context.strokeRect(36, 36, width - 72, height - 72);

    let y = 105;
    context.textAlign = "center";
    context.fillStyle = "#6b4226";
    context.font = "bold 26px Arial, sans-serif";
    context.fillText("KAARIGAR EXPO", width / 2, y);
    y += 38;
    context.fillStyle = "#9c4524";
    context.font = "bold 17px Arial, sans-serif";
    context.fillText("EVENT ENTRY PASS", width / 2, y);
    y += 28;
    drawRule(context, 84, y, width - 84);
    y += 46;

    context.fillStyle = "#847566";
    context.font = "bold 16px Arial, sans-serif";
    context.fillText("EVENT", width / 2, y);
    y += 40;
    context.fillStyle = "#2b2118";
    context.font = "bold 38px Arial, sans-serif";
    y = drawCenteredText(context, eventTitle || "Event", width / 2, y, 820, 47) + 28;

    const eventDate = formatEventDate(eventStartDate, eventEndDate);
    if (eventDate) y = drawDetail(context, "DATE", eventDate, width / 2, y);
    if (eventLocation) y = drawDetail(context, "VENUE", eventLocation, width / 2, y);

    y += 8;
    const qrSize = 360;
    context.drawImage(canvas, (width - qrSize) / 2, y, qrSize, qrSize);
    y += qrSize + 28;
    drawRule(context, 84, y, width - 84);
    y += 42;

    context.fillStyle = "#847566";
    context.font = "bold 16px Arial, sans-serif";
    context.fillText("TICKET HOLDER", width / 2, y);
    y += 38;
    context.fillStyle = "#2b2118";
    context.font = "bold 30px Arial, sans-serif";
    y = drawCenteredText(context, attendeeName || "Guest", width / 2, y, 820, 38) + 8;
    context.fillStyle = "#6b4226";
    context.font = "bold 17px Arial, sans-serif";
    context.fillText((attendeeType || "ATTENDEE").toUpperCase(), width / 2, y);
    y += 36;

    context.fillStyle = "#847566";
    context.font = "bold 15px Arial, sans-serif";
    context.fillText("TICKET CODE", width / 2, y);
    y += 30;
    context.fillStyle = "#40372f";
    context.font = "18px monospace";
    context.fillText(ticketCode, width / 2, y);
    y += 30;
    if (ticketNumber) {
      context.fillStyle = "#6d6257";
      context.font = "16px Arial, sans-serif";
      context.fillText(`Registration / application #${ticketNumber}`, width / 2, y);
      y += 26;
    }
    if (issuedAt) {
      context.fillStyle = "#6d6257";
      context.font = "16px Arial, sans-serif";
      context.fillText(`Issued ${formatDate(issuedAt)}`, width / 2, y);
      y += 26;
    }
    context.fillStyle = "#847566";
    context.font = "16px Arial, sans-serif";
    context.fillText("Keep this pass ready for event entry.", width / 2, Math.min(y + 16, height - 62));

    const eventSlug = (eventTitle || "event")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const downloadLink = document.createElement("a");
    downloadLink.download = `${eventSlug || "event"}-entry-pass.png`;
    downloadLink.href = output.toDataURL("image/png");
    downloadLink.click();
  };

  return (
    <details className="ticket-card mt-3 rounded-xl border border-[#E2D6C7] bg-white p-3">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-[#6B4226]">
        <QrCode size={17} /> Show event entry QR
      </summary>
      <div className="mt-3 flex flex-col items-center gap-2 border-t border-[#E2D6C7] pt-3">
        <div ref={qrContainerRef} className="rounded-lg bg-white p-2">
          <QRCodeCanvas value={ticketCode} size={240} level="M" includeMargin className="h-44 w-44" />
        </div>
        {eventTitle && <p className="text-center text-xs font-semibold">{eventTitle}</p>}
        {eventStartDate && <p className="text-center text-[11px] opacity-75">{formatEventDate(eventStartDate, eventEndDate)}</p>}
        {eventLocation && <p className="text-center text-[11px] opacity-75">{eventLocation}</p>}
        {attendeeName && <p className="text-center text-[11px]">For: {attendeeName}{attendeeType ? ` · ${attendeeType}` : ""}</p>}
        <p className="break-all text-center font-mono text-[10px] opacity-70">Ticket: {ticketCode}</p>
        <p className="text-center text-[11px] opacity-70">Keep this QR code ready for event entry.</p>
        <button
          type="button"
          onClick={downloadQr}
          className="mt-1 inline-flex items-center gap-2 rounded-lg border border-[#B4532D] px-3 py-2 text-xs font-semibold text-[#9C4524] transition hover:bg-[#FFF5EE]"
        >
          <Download size={15} /> Download ticket PNG
        </button>
      </div>
    </details>
  );
}

function drawRule(context, x1, y, x2) {
  context.strokeStyle = "#dfd2c2";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(x1, y);
  context.lineTo(x2, y);
  context.stroke();
}

function drawDetail(context, label, value, centerX, y) {
  context.textAlign = "center";
  context.fillStyle = "#847566";
  context.font = "bold 15px Arial, sans-serif";
  context.fillText(label, centerX, y);
  y += 28;
  context.fillStyle = "#2b2118";
  context.font = "24px Arial, sans-serif";
  y = drawCenteredText(context, value, centerX, y, 820, 30);
  return y + 22;
}

function drawCenteredText(context, text, centerX, y, maxWidth, lineHeight) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && context.measureText(next).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  lines.forEach((lineText, index) => context.fillText(lineText, centerX, y + index * lineHeight));
  return y + Math.max(lines.length, 1) * lineHeight;
}

function formatEventDate(startDate, endDate) {
  if (!startDate) return "";
  const start = formatDate(startDate);
  const end = endDate ? formatDate(endDate) : "";
  return end && end !== start ? `${start} – ${end}` : start;
}

function formatDate(value) {
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
