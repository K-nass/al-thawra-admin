import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { magazinesApi } from "@/api/magazines.api";
import type { GetMagazinesParams, Magazine } from "@/api/magazines.api";

export function useFetchMagazines(params: GetMagazinesParams) {
  return useQuery({
    queryKey: ["magazines", params],
    queryFn: async () => {
      return await magazinesApi.getAll(params);
    },
    retry: false,
    enabled: true,
  });
}

export function useMagazineByDate(date: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["magazine", "by-date", date],
    queryFn: async () => {
      return await magazinesApi.getByDate(date);
    },
    enabled: enabled && !!date,
    retry: false,
  });
}

export function useDeleteMagazine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (issueNumber: string) => {
      return await magazinesApi.delete(issueNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["magazines"] });
    },
  });
}
