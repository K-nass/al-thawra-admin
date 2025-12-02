import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pagesApi } from "@/api/pages.api";
import type { GetPagesParams, CreatePageRequest, Page } from "@/api/pages.api";


export function useFetchPages(params: GetPagesParams) {
  return useQuery({
    queryKey: ["pages", params],
    queryFn: async () => {
      return await pagesApi.getAll(params);
    },
    retry: false,
    enabled: true,
  });
}

export function usePage(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["page", id],
    queryFn: async () => {
      return await pagesApi.getById(id);
    },
    enabled: enabled && !!id,
    retry: false,
  });
}

export function usePageBySlug(slug: string, language?: "English" | "Arabic", enabled: boolean = true) {
  return useQuery({
    queryKey: ["page", "slug", slug, language],
    queryFn: async () => {
      return await pagesApi.getBySlug(slug, language);
    },
    enabled: enabled && !!slug,
    retry: false,
  });
}

export function useCreatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePageRequest) => {
      return await pagesApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
  });
}

export function useUpdatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CreatePageRequest }) => {
      return await pagesApi.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      queryClient.invalidateQueries({ queryKey: ["page", variables.id] });
    },
  });
}

export function useDeletePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await pagesApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
  });
}

