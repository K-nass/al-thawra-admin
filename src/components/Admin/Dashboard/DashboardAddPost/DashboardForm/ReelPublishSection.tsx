import type { UseMutationResult } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

interface ReelPublishSectionProps {
    mutation: UseMutationResult<unknown, unknown, void, unknown>;
}

export default function ReelPublishSection({ mutation }: ReelPublishSectionProps) {
    const { t } = useTranslation();

    return (
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-slate-200 space-y-3 sm:space-y-4">
            <h3 className="text-sm sm:text-base font-semibold">{t('post.publish')}</h3>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:space-x-2">
                <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-primary bg-[#605CA8] rounded hover:bg-indigo-700 cursor-pointer text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {mutation.isPending ? t('common.creating', 'Creating...') : t('post.publishPost')}
                </button>
            </div>
        </div>
    );
}
