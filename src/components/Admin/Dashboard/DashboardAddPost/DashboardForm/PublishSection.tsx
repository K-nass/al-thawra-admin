import type { UseMutationResult } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { ShardedInitialStateInterface } from "./usePostReducer/postData";

interface PublishSectionProps {
  mutation: UseMutationResult<unknown, unknown, void, unknown>;
  isEditMode?: boolean;
  state: any; // Using any to avoid complex type union issues
  handleChange: (e: any) => void;
  fieldErrors?: Record<string, string[]>;
}

export default function PublishSection({ mutation: _mutation, isEditMode = false, state, handleChange, fieldErrors }: PublishSectionProps) {
  const { t } = useTranslation();

  // Format the UTC date to local datetime-local input format
  const getLocalDateTime = (utcDateString: string | null) => {
    if (!utcDateString) return "";
    const date = new Date(utcDateString);
    // Adjust to local time for display
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().slice(0, 16);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const localValue = e.target.value;
    if (!localValue) {
      handleChange({
        target: {
          name: "scheduledAt",
          value: null,
          type: "text"
        }
      });
      return;
    }

    // Convert local time to UTC
    const date = new Date(localValue);
    const utcString = date.toISOString();

    handleChange({
      target: {
        name: "scheduledAt",
        value: utcString,
        type: "text"
      }
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (checked) {
      // Set default to now if checked
      const now = new Date();
      handleChange({
        target: {
          name: "scheduledAt",
          value: now.toISOString(),
          type: "text"
        }
      });
    } else {
      handleChange({
        target: {
          name: "scheduledAt",
          value: null,
          type: "text"
        }
      });
    }
  };

  const scheduledAtErrors = fieldErrors?.scheduledat || fieldErrors?.ScheduledAt;

  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-slate-200 space-y-3 sm:space-y-4">
      <h3 className="text-sm sm:text-base font-semibold">{t('post.publish')}</h3>
      <div className="space-y-3">
        <label className="flex items-center cursor-pointer select-none">
          <input
            className="rounded text-primary focus:ring-primary w-4 h-4"
            type="checkbox"
            checked={!!state.scheduledAt}
            onChange={handleCheckboxChange}
          />
          <span className="ml-2 text-sm font-medium text-slate-700">{t('post.scheduledPost')}</span>
        </label>

        {state.scheduledAt && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200 space-y-1">
            <div className="relative">
              <input
                type="datetime-local"
                className={`w-full px-3 py-2 border rounded-md text-sm shadow-sm transition-colors
                  focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                  ${scheduledAtErrors ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-300 hover:border-slate-400'}
                `}
                value={getLocalDateTime(state.scheduledAt)}
                onChange={handleDateChange}
                min={new Date().toISOString().slice(0, 16)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                {/* Calendar icon could go here if we hide the native indicator */}
              </div>
            </div>

            {scheduledAtErrors ? (
              <p className="text-xs text-red-500 font-medium mt-1">
                {scheduledAtErrors[0]}
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                {t('post.scheduledTimeUtc', 'Scheduled time will be saved in UTC')}
              </p>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:space-x-2">
        <button
          type="button"
          className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-[#DEA530] text-white rounded hover:bg-amber-600 cursor-pointer"
        >
          {t('post.saveAsDraft')}
        </button>
        <button
          type="submit"
          className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-primary bg-[#605CA8] rounded hover:bg-indigo-700 cursor-pointer text-white"
        >
          {isEditMode ? t('post.updatePost', 'Update Post') : t('post.publishPost')}
        </button>
      </div>
    </div>
  );
}
