import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reelsApi } from "@/api/reels.api";

export function useDeleteReel() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => reelsApi.delete(id),
        onSuccess: () => {
            // Invalidate reels feed to refresh the list
            queryClient.invalidateQueries({ queryKey: ["reelsFeed"] });
        },
    });
}
