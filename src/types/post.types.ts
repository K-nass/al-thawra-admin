// Post related types
export interface Post {
  id: string | number;
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  author: string;
  authorId?: string | number;
  featuredImage?: string;
  additionalImages?: string[];
  tags?: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  views?: number;
  likes?: number;
}

export interface CreatePostDto {
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  author: string;
  authorId?: string | number;
  featuredImage?: string;
  additionalImages?: string[];
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  language: "English" | "Arabic";
}

export interface UpdatePostDto extends Partial<CreatePostDto> {
  id: string | number;
}

export interface PostCategory {
  id: string | number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
}

export type ContentType = 'article' | 'video' | 'podcast';

export interface PostFormData {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  author: string;
  featuredImage: string;
  additionalImages: string[];
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  contentType: ContentType;
}

export interface ValidationError {
  field: string;
  messages: string[];
}

export interface ApiErrorResponse {
  status: number;
  title?: string;
  message?: string;
  errors?: Record<string, string[]>;
}
