import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";

export function useCategories() {
  const query = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiClient.get("/categories"),
  });

  return query; 
}
