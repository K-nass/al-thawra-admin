import type { UseMutationResult } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Send, Loader2, Sparkles, ShieldCheck } from "lucide-react";

interface ReelPublishSectionProps {
    mutation: UseMutationResult<unknown, unknown, void, unknown>;
}

export default function ReelPublishSection({ mutation }: ReelPublishSectionProps) {
    const { t } = useTranslation();

    return (
        <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-6 relative">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-primary shadow-inner border border-white/10">
                    <Sparkles size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-black text-white tracking-tight">
                        {t('post.publish')}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t("reels.reelPublication")}</p>
                </div>
            </div>

            <div className="space-y-6 relative">
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <ShieldCheck className="text-primary w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium text-slate-300">{t("reels.instantPublishHint")}</span>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-[0.15em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                    >
                        {mutation.isPending ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <>
                                <Send size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                {t('post.publishPost')}
                            </>
                        )}
                    </button>
                    <p className="mt-4 text-[10px] font-bold text-slate-500 text-center uppercase tracking-widest leading-relaxed">
                        {t("reels.instantDistribution")}
                    </p>
                </div>
            </div>
        </div>
    );
}
