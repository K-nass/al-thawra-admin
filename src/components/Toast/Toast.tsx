import { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X as XIcon } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
  };

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className={`${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md animate-slide-in`}>
      {(() => {
        const IconComponent = icons[type];
        return <IconComponent className="w-5 h-5 flex-shrink-0" />;
      })()}
      <p className="flex-1 text-sm whitespace-pre-line">{message}</p>
      <button
        type="button"
        onClick={onClose}
        className="text-white hover:text-gray-200 transition-colors flex-shrink-0"
      >
        <XIcon className="w-5 h-5" />
      </button>
    </div>
  );
}
