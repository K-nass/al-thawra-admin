  import { useQuery } from "@tanstack/react-query";
  import { apiClient } from "@/api/client";

  // Removed raw axios and apiUrl references since apiClient is used
  
  interface FetchPostsParams {
  category?: string | null;
  authorName?: string | null;
  hasAuthor?: boolean;
  hasWriter?: boolean;
  status?: string | null;
  isFeatured?: boolean;
  isBreaking?: boolean;
  isSlider?: boolean;
  isRecommended?: boolean;
  language?: string | null;
  type?: string | null;
  from?: string | null;
  to?: string | null;
  pageNumber?: number;
  pageSize?: number;
  searchPhrase?: string | null;
}

export function useFetchPosts(params: FetchPostsParams = {}) {
  async function fetchPosts() {
    const {
      category,
      authorName,
      hasAuthor,
      hasWriter,
      status,
      isFeatured,
      isBreaking,
      isSlider,
      isRecommended,
      language,
      type,
      from,
      to,
      pageNumber,
      pageSize,
      searchPhrase,
    } = params;

    const queryParams = new URLSearchParams();

    // Only add parameters that have values (don't send empty strings)
    if (category && category !== "all") queryParams.append("CategorySlug", category);
    if (authorName) queryParams.append("AuthorName", authorName);
    if (hasAuthor !== undefined) queryParams.append("HasAuthor", String(hasAuthor));
    if (hasWriter !== undefined) queryParams.append("HasWriter", String(hasWriter));
    if (status) queryParams.append("Status", status);
    
    // IMPORTANT: Only send boolean flags when they are TRUE
    // If false or undefined, don't send them at all (backend will return all posts)
    if (isFeatured === true) queryParams.append("IsFeatured", "true");
    if (isBreaking === true) queryParams.append("IsBreaking", "true");
    if (isSlider === true) queryParams.append("IsSlider", "true");
    if (isRecommended === true) queryParams.append("IsRecommended", "true");
    
    if (language && language !== "all") queryParams.append("Language", language);
    if (type) queryParams.append("Type", type);
    if (from) queryParams.append("From", from);
    if (to) queryParams.append("To", to);
    
    // Direction parameter (optional)
    // queryParams.append("Direction", "");
    
    // Always include these required parameters
    queryParams.append("PageNumber", String(pageNumber || 1));
    queryParams.append("PageSize", String(pageSize || 15));
    if (searchPhrase !== null && searchPhrase !== undefined && searchPhrase !== "") {
      queryParams.append("SearchPhrase", searchPhrase);
    }

    // Use the custom apiClient to automatically attach the authorization token
    return await apiClient.get(
      `/posts/categories/articles?${queryParams.toString()}`
    );
  }

  return useQuery({
    queryKey: ["posts", params],
    queryFn: fetchPosts,
  });
}
