import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

interface FetchPostsParams {
  category?: string | null;
  authorName?: string | null;
  hasAuthor?: boolean;
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
    if (status) queryParams.append("Status", status);
    if (isFeatured !== undefined) queryParams.append("IsFeatured", String(isFeatured));
    if (isBreaking !== undefined) queryParams.append("IsBreaking", String(isBreaking));
    if (isSlider !== undefined) queryParams.append("IsSlider", String(isSlider));
    if (isRecommended !== undefined) queryParams.append("IsRecommended", String(isRecommended));
    if (language) queryParams.append("Language", language);
    if (type) queryParams.append("Type", type);
    if (from) queryParams.append("From", from);
    if (to) queryParams.append("To", to);
    
    // Always include these required parameters
    queryParams.append("IncludeLikedByUsers", "false");
    queryParams.append("PageNumber", String(pageNumber || 1));
    queryParams.append("PageSize", String(pageSize || 15));
    if (searchPhrase !== null && searchPhrase !== undefined) {
      queryParams.append("SearchPhrase", searchPhrase);
    }

    return await axios.get(
      `${apiUrl}/posts?${queryParams.toString()}`
    );
  }

  return useQuery({
    queryKey: ["posts", params],
    queryFn: fetchPosts,
  });
}
