import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reelsApi, apiClient } from "@/api";
import { usePostReducer } from "../DashboardAddPost/DashboardForm/usePostReducer/usePostReducer";
import type { ReelInitialStateInterface } from "../DashboardAddPost/DashboardForm/usePostReducer/postData";
import ReelForm from "../DashboardAddPost/DashboardForm/ReelForm";
import Loader from "@/components/Common/Loader";
import ApiNotification from "@/components/Common/ApiNotification";
import type { TagInterface } from "../DashboardAddPost/DashboardForm/PostDetailsForm";


interface TagResponse {
    data: {
        items: TagInterface[];
    };
}

export default function DashboardEditReel() {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    
    const [state, dispatch] = usePostReducer("reel");
    const [notification, setNotification] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    // Fetch reel data
    const { data: reel, isLoading: isLoadingReel, error: reelError } = useQuery({
        queryKey: ["reel", id],
        queryFn: () => reelsApi.getById(id!),
        enabled: !!id,
    });

    // Populate reducer when reel data is loaded
    useEffect(() => {
        if (reel) {
            // Map API response to reducer fields
            const fieldsToSync = {
                videoUrl: reel.videoUrl,
                thumbnailUrl: reel.thumbnailUrl,
                caption: reel.caption,
                tags: reel.tags || [],
                authorId: reel.userId,
            };

            Object.entries(fieldsToSync).forEach(([key, value]) => {
                dispatch({
                    type: "set-field",
                    field: key,
                    payload: value as any,
                });
            });
        }
    }, [reel, dispatch]);

    // Fetch tags for the form
    const { data: tagsData, isLoading: isLoadingTags } = useQuery<TagResponse>({
        queryKey: ["tags"],
        queryFn: () => apiClient.get("/tags"),
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (payload: any) => reelsApi.update(id!, payload),
        onSuccess: () => {
            setNotification({ type: "success", message: t("reels.updateSuccess", "Reel updated successfully") });
            queryClient.invalidateQueries({ queryKey: ["reels"] });
            queryClient.invalidateQueries({ queryKey: ["reel", id] });
            
            // Redirect after success
            setTimeout(() => {
                navigate("/admin/reels");
            }, 1500);
        },
        onError: (error: any) => {
            const message = error?.response?.data?.title || error?.response?.data?.message || t("reels.updateError", "Failed to update reel");
            setNotification({ type: "error", message });
            
            if (error?.response?.data?.errors) {
                setFieldErrors(error.response.data.errors);
            }
        },
    });

    const handleChange = (e: any, newTags?: string[]) => {
        const { name, value, type, checked } = e.target || {};
        
        let payload = value;
        if (type === "checkbox") payload = checked;
        
        // Handle tags from ReelForm
        if (name === "tags" && newTags) {
            payload = newTags;
        }

        dispatch({
            type: "set-field",
            field: name,
            payload,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Prepare payload correctly
        const payload = {
            videoUrl: (state as ReelInitialStateInterface).videoUrl,
            thumbnailUrl: (state as ReelInitialStateInterface).thumbnailUrl,
            caption: (state as ReelInitialStateInterface).caption,
            tags: (state as ReelInitialStateInterface).tags,
            authorId: (state as ReelInitialStateInterface).authorId,
        };
        
        updateMutation.mutate(payload);
    };

    if (isLoadingReel) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (reelError) {
        return (
            <div className="flex-1 p-6 text-center">
                <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100 inline-block">
                    {t("reels.failedToLoad", "Failed to load reel data. Please try again.")}
                </div>
                <button 
                    onClick={() => navigate("/admin/reels")}
                    className="block mx-auto mt-4 text-[#13967B] font-medium"
                >
                    &larr; {t("common.backToReels", "Back to Reels")}
                </button>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {notification && (
                <ApiNotification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
            )}
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-800">{t("reels.editReel", "Edit Reel")}</h2>
                        <p className="text-sm text-gray-500">{t("reels.editDescription", "Modify your reel details and update visibility.")}</p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="grow space-y-6">
                        <ReelForm
                            state={state as ReelInitialStateInterface}
                            handleChange={handleChange}
                            fieldErrors={fieldErrors}
                            tags={tagsData?.data.items || []}
                            isLoading={isLoadingTags}
                        />
                    </div>

                    <div className="w-full lg:w-80 lg:shrink-0 space-y-6">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                            <h3 className="text-base font-semibold border-b border-slate-200 pb-3 mb-4">
                                {t("post.publish", "Publish")}
                            </h3>
                            <button
                                type="submit"
                                disabled={updateMutation.isPending}
                                className="w-full py-2 bg-[#605CA8] text-white rounded-md font-medium hover:bg-slate-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {updateMutation.isPending 
                                    ? t("common.updating", "Updating...") 
                                    : t("reels.update", "Update Reel")
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
