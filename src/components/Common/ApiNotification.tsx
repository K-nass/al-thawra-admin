import { useEffect } from "react";

type Props = {
  type: "success" | "error";
  message: string;
  onClose?: () => void;
  duration?: number; // ms
};

export default function ApiNotification({ type, message, onClose, duration = 5000 }: Props) {
  useEffect(() => {
    if (!duration) return;
    const t = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  const bg = type === "success" ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300";
  const text = type === "success" ? "text-green-800" : "text-red-800";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed right-4 top-4 z-50 max-w-md w-full border px-4 py-3 rounded shadow ${bg}`}
    >
      <div className={`flex items-start gap-3 ${text}`}>
        <div className="flex-1">
          <div className="font-medium">{type === "success" ? "Success" : "Error"}</div>
          <div className="text-sm mt-1 wrap-break-word">{message}</div>
        </div>
        <button
          onClick={() => onClose?.()}
          aria-label="Close notification"
          className="ml-3 text-sm opacity-70 hover:opacity-100"
        >
          ✕
        </button>
      </div>
    </div>
  );
}