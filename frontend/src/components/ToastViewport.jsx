import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const icons = { success: CheckCircle2, error: AlertCircle, info: Info };

export default function ToastViewport() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const onToast = (event) => {
      const id = `${Date.now()}-${Math.random()}`;
      const toast = { id, ...event.detail };
      setToasts((current) => [...current, toast]);
      window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 4500);
    };
    window.addEventListener("app:toast", onToast);
    return () => window.removeEventListener("app:toast", onToast);
  }, []);

  return (
    <div className="fixed right-4 top-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
      {toasts.map(({ id, message, type = "info" }) => {
        const Icon = icons[type] || Info;
        const color = type === "success" ? "text-green-700" : type === "error" ? "text-red-700" : "text-blue-700";
        return <div key={id} role="status" className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-800 shadow-lg">
          <Icon className={`mt-0.5 shrink-0 ${color}`} size={18} />
          <p className="flex-1">{message}</p>
          <button aria-label="Dismiss notification" onClick={() => setToasts((current) => current.filter((item) => item.id !== id))}><X size={16} /></button>
        </div>;
      })}
    </div>
  );
}
