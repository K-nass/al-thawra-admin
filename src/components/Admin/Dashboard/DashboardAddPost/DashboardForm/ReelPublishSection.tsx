import type { UseMutationResult } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Send, Loader2, ShieldCheck } from "lucide-react";

interface ReelPublishSectionProps {
    mutation: UseMutationResult<unknown, unknown, void, unknown>;
}

export default function ReelPublishSection({ mutation }: ReelPublishSectionProps) {
    const { t } = useTranslation();

    return (
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 relative overflow-hidden group">
            <div className="flex items-center gap-3 mb-6 relative">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm border border-primary/20">
                    <Send size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">{t("post.publish")}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("reels.reelPublication")}</p>
                </div>
            </div>

            <div className="space-y-6 relative">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <ShieldCheck className="text-primary w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium text-slate-700">{t("reels.instantPublishHint")}</span>
                </div>

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
                                {t("post.publishPost")}
                            </>
                        )}
                    </button>
                    <p className="mt-4 text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest leading-relaxed">
                        {t("reels.instantDistribution")}
                    </p>
                </div>
            </div>
        </div>
    );
}
