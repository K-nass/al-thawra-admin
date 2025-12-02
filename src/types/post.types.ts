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

export type ContentType = 'article' | 'video' | 'podcast' | 'gallery';

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
