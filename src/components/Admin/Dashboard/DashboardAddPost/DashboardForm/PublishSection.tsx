import { useTranslation } from "react-i18next";
import type { HandleChangeType } from "./types";
import { 
  Send, 
  Clock, 
  ShieldCheck, 
  CheckCircle2,
  Loader2,
  ChevronDown
} from "lucide-react";

interface Props {
  mutation: any;
  state: any;
  handleChange: HandleChangeType;
  fieldErrors?: Record<string, string[]>;
  isEditMode?: boolean;
}

export default function PublishSection({ mutation, state, handleChange, fieldErrors = {}, isEditMode = false }: Props) {
  const { t } = useTranslation();

  // Handle date formatting
  const getLocalDateTime = (utcDateString: string | null) => {
    if (!utcDateString) return "";
    const date = new Date(utcDateString);
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().slice(0, 16);
  };

  const scheduledAtErrors =
    fieldErrors?.scheduledAt || fieldErrors?.scheduledat || fieldErrors?.ScheduledAt;

  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-6 relative">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm border border-primary/20">
              <Send size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                {isEditMode ? t('post.update') : t('post.publish')}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('post.visibilityAndScheduling')}</p>
            </div>
          </div>

      <div className="space-y-6 relative">
        {/* Status Select */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
            <ShieldCheck size={10} /> {t('formLabels.status')} <span className="text-rose-500 ml-1 font-bold">*</span>
          </label>
          <div className="relative group/select">
            <select
              name="status"
              value={state.status}
              onChange={(e) => handleChange(e as any)}
              style={{ paddingInlineEnd: "2.5rem" }}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none"
            >
              <option value="Published">{t('common.published') || "Published"}</option>
              <option value="Draft">{t('common.draft') || "Draft"}</option>
            </select>
            <div className="absolute top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" style={{ insetInlineEnd: "1rem" }}>
              <ChevronDown size={16} />
            </div>
          </div>
          {fieldErrors.status && (
            <p className="text-rose-500 text-[10px] font-black uppercase tracking-tight mt-1 ml-1">{fieldErrors.status}</p>
          )}
        </div>

        {/* Scheduled At (Date Picker) */}
        <div className="space-y-3" data-error-field={scheduledAtErrors ? "scheduledAt" : undefined}>
            <label className="flex items-center cursor-pointer select-none group/check">
              <input
                className="sr-only"
                type="checkbox"
                checked={!!state.scheduledAt}
                onChange={(e) => {
                    if (e.target.checked) {
                        handleChange({ target: { name: "scheduledAt", value: new Date().toISOString(), type: "text" } } as any);
                    } else {
                        handleChange({ target: { name: "scheduledAt", value: null, type: "text" } } as any);
                    }
                }}
              />
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  state.scheduledAt ? 'bg-primary border-primary' : 'bg-transparent border-slate-200 group-hover/check:border-primary/50'
              }`}>
                  {state.scheduledAt && <CheckCircle2 size={12} className="text-white" />}
              </div>
              <span className="ml-3 text-xs font-bold text-slate-600 uppercase tracking-wider">{t('post.scheduledPost')}</span>
            </label>

            {state.scheduledAt && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-1.5">
                <div className="relative group/input">
                    <input
                        name="scheduledAt"
                        type="datetime-local"
                        className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 transition-all appearance-none ${
                            scheduledAtErrors ? 'border-rose-300 focus:ring-rose-500/10' : 'border-slate-200 focus:ring-primary/10'
                        }`}
                        value={getLocalDateTime(state.scheduledAt)}
                        onChange={(e) => {
                            const date = new Date(e.target.value);
                            handleChange({ target: { name: 'scheduledAt', value: date.toISOString(), type: 'text' } } as any);
                        }}
                        min={new Date().toISOString().slice(0, 16)}
                    />
                    <div className="absolute top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" style={{ insetInlineEnd: "1rem" }}>
                        <Clock size={16} />
                    </div>
                </div>
                {scheduledAtErrors && (
                    <p className="text-rose-500 text-[10px] font-black uppercase tracking-tight mt-1 ml-1">{scheduledAtErrors[0]}</p>
                )}
              </div>
            )}
        </div>

        {/* Action Button */}
        <div className="pt-2">
           <button
             type="submit"
             disabled={mutation.isPending}
             className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-[0.15em] shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed group/btn"
           >
              {mutation.isPending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <Send size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                  {isEditMode ? t('post.updatePost') : t('post.publishPost')}
                </>
              )}
           </button>
           <p className="mt-4 text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest leading-relaxed">
             {t('post.confirmDetailsBeforePublish')}
           </p>
        </div>
      </div>
    </div>
  );
}
