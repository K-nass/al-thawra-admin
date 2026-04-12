export interface Tag {
  id: string;
  name: string;
  language: "English" | "Arabic" | string;
  postsCount: number;
}

export interface TagPaginationResponse {
  pageSize: number;
  pageNumber: number;
  totalCount: number;
  totalPages: number;
  itemsFrom: number;
  itemsTo: number;
  items: Tag[];
}

export interface GetTagsParams {
  Language?: string;
  SortBy?: string;
  PageNumber?: number;
  PageSize?: number;
  SearchPhrase?: string;
}

export interface CreateTagDto {
  name: string;
  language: "English" | "Arabic" | string;
}

export interface CreateTagsRequest {
  tags: CreateTagDto[];
}

export interface UpdateTagRequest {
  tagId: string;
  name: string;
  language: "English" | "Arabic" | string;
}
