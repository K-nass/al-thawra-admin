import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Save, Loader2, Film, AlertCircle, Eye, History, Activity } from "lucide-react";
import { reelsApi, apiClient } from "@/api";
import { usePostReducer } from "../DashboardAddPost/DashboardForm/usePostReducer/usePostReducer";
import type { ReelInitialStateInterface } from "../DashboardAddPost/DashboardForm/usePostReducer/postData";
import ReelForm from "../DashboardAddPost/DashboardForm/ReelForm";
import Loader from "@/components/Common/Loader";
import type { TagInterface } from "../DashboardAddPost/DashboardForm/PostDetailsForm";
import { useToast } from "@/components/Toast/ToastContainer";
import {
  extractApiErrorMessage,
  focusFirstErrorField,
  parseApiValidationErrors,
} from "@/utils/apiFormErrors";

interface TagResponse {
  data: {
    items: TagInterface[];
  };
}

export default function DashboardEditReel() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const serverFieldAliases = {
    videourl: "videoUrl",
    thumbnailurl: "thumbnailUrl",
    caption: "caption",
    tags: "tags",
    tags0: "tags",
    authorid: "authorId",
    userid: "authorId",
  } as const;

  const [state, dispatch] = usePostReducer("reel");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const { data: reel, isLoading: isLoadingReel, error: reelError } = useQuery({
    queryKey: ["reel", id],
    queryFn: () => reelsApi.getById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (!reel) return;
    const fieldsToSync = {
      videoUrl: reel.videoUrl,
      thumbnailUrl: reel.thumbnailUrl,
      caption: reel.caption,
      tags: reel.tags || [],
      authorId: reel.userId,
    };
    Object.entries(fieldsToSync).forEach(([key, value]) => {
      dispatch({ type: "set-field", field: key, payload: value as never });
    });
  }, [reel, dispatch]);

  const { data: tagsData, isLoading: isLoadingTags } = useQuery<TagResponse>({
    queryKey: ["tags"],
    queryFn: () => apiClient.get("/tags"),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: any) => reelsApi.update(id!, payload),
    onSuccess: () => {
      toast.success(t("reels.updateSuccess"));
      queryClient.invalidateQueries({ queryKey: ["reels"] });
      queryClient.invalidateQueries({ queryKey: ["reel", id] });
      setTimeout(() => navigate("/admin/reels"), 700);
    },
    onError: (error: any) => {
      const parsed = parseApiValidationErrors(error, serverFieldAliases);
      if (Object.keys(parsed.fieldErrors).length > 0) {
        const mappedErrors = Object.entries(parsed.fieldErrors).reduce<Record<string, string[]>>(
          (acc, [field, message]) => {
            if (!message) return acc;
            acc[field] = [message];
            return acc;
          },
          {},
        );
        setFieldErrors(mappedErrors);
        focusFirstErrorField(parsed.fieldErrors);
        toast.error(parsed.messages[0] || t("reels.updateError"));
        return;
      }

      toast.error(extractApiErrorMessage(error, t("reels.updateError")));
    },
  });

  const handleChange = (e: any, newTags?: string[]) => {
    const { name, value, type, checked } = e.target || {};
    let payload = value;
    if (type === "checkbox") payload = checked;
    if (name === "tags" && newTags) payload = newTags;
    dispatch({ type: "set-field", field: name, payload });
    if (name) {
      setFieldErrors((prev) => {
        if (!prev[name]) return prev;
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reelState = state as ReelInitialStateInterface;
    updateMutation.mutate({
      videoUrl: reelState.videoUrl,
      thumbnailUrl: reelState.thumbnailUrl,
      caption: reelState.caption,
      tags: reelState.tags,
      authorId: reelState.authorId,
    });
  };

  if (isLoadingReel) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface h-full">
        <Loader />
      </div>
    );
  }

  if (reelError || !reel) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-surface">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">{t("reels.notFoundTitle")}</h2>
        <p className="text-slate-500 mt-2">{t("reels.notFoundMessage")}</p>
        <button onClick={() => navigate("/admin/reels")} className="mt-6 px-6 py-2 bg-primary text-white rounded-xl font-bold shadow-sm hover:bg-emerald-600 transition-colors">
          {t("reels.backToLibrary")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-surface">
      <div className="p-4 sm:p-6 border-b border-slate-200 bg-white shadow-sm sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => navigate("/admin/reels")} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                <Film size={24} className="text-primary" />
                {t("reels.editReel")}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">{t("reels.editSubtitle")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <form onSubmit={handleSubmit} className="max-w-7xl mx-auto pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <ReelForm state={state as ReelInitialStateInterface} handleChange={handleChange} fieldErrors={fieldErrors} tags={tagsData?.data.items || []} isLoading={isLoadingTags} />
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <Save size={14} className="text-primary" />
                    {t("reels.publishingControls")}
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-emerald-600 active:scale-[0.98] transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                  >
                    {updateMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {updateMutation.isPending ? t("common.updating") : t("common.saveChanges")}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/admin/reels")}
                    className="w-full px-6 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm"
                  >
                    {t("common.cancel")}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <Activity size={14} className="text-primary" />
                    {t("reels.contentMeta")}
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 transition-colors hover:border-slate-200 group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                        <Eye size={14} />
                      </div>
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{t("reels.visibility")}</span>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 uppercase tracking-tighter">{t("reels.public")}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 transition-colors hover:border-slate-200 group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                        <History size={14} />
                      </div>
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{t("reels.lastModified")}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase">
                      {new Date().toLocaleDateString(i18n.language === "ar" ? "ar-EG" : "en-US")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
