import { useInfiniteQuery } from "@tanstack/react-query";
import { reelsApi } from "@/api/reels.api";

export function useFetchReelsFeed(limit: number = 10) {
    return useInfiniteQuery({
        queryKey: ["reels-feed", limit],
        queryFn: ({ pageParam }) => reelsApi.getFeed({ cursor: pageParam, limit }),
        initialPageParam: "" as string,
        getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
    });
}
