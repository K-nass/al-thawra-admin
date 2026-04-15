export interface ShardedInitialStateInterface {
  categoryId: string;
  language: "English" | "Arabic";
  title: string;
  slug: string | null;
  metaDescription: string;
  metaKeywords: string;
  optionalURL: string | null;
  scheduledAt: string | null;
  status: "Draft" | "Scheduled" | "Published";
  visibility: boolean;
  showOnlyToRegisteredUsers: boolean;
  tagIds: string[];
  addToRecommended: boolean;
}

export const shardedInitialState: ShardedInitialStateInterface = {
  categoryId: "",
  language: "Arabic",
  title: "",
  slug: null,
  metaDescription: "",
  metaKeywords: "",
  optionalURL: null,
  scheduledAt: null,
  status: "Published",
  visibility: true,
  showOnlyToRegisteredUsers: false,
  tagIds: [],
  addToRecommended: false,
};

export interface ArticleInitialStateInterface
  extends ShardedInitialStateInterface {
  addToBreaking: boolean;
  addToFeatured: boolean;
  addToSlider: boolean;
  content: string;
  imageUrl: string;
  imageDescription: string[] | null;
  additionalImageUrls: string[] | null;
  fileUrls: string[] | null | string;
}
export const articleInitialState: ArticleInitialStateInterface = {
  ...shardedInitialState,
  addToBreaking: false,
  addToFeatured: false,
  addToSlider: false,
  content: "",
  imageUrl: "",
  imageDescription: null,
  additionalImageUrls: [""],
  fileUrls: null,
};

export interface AudioInitialStateInterface extends ShardedInitialStateInterface {
  addToBreaking: boolean;
  addToFeatured: boolean;
  addToSlider: boolean;
  audioUrl: string | null;
  imageUrl: string;
  thumbnailUrl: string | null;
}
export const audioInitialState: AudioInitialStateInterface = {
  ...shardedInitialState,
  addToBreaking: false,
  addToFeatured: false,
  addToSlider: false,
  audioUrl: null,
  imageUrl: "",
  thumbnailUrl: null,
};

export interface VideoInitialStateInterface extends ShardedInitialStateInterface {
  addToBreaking: boolean;
  addToFeatured: boolean;
  addToSlider: boolean;
  content: string;
  duration: string | null;
  videoUrl: string | null;
  videoFileUrls: string[] | null;
  videoEmbedCode: string | null;
  imageUrl: string;
  videoThumbnailUrl: string;
}
export const videoInitialState: VideoInitialStateInterface = {
  ...shardedInitialState,
  addToBreaking: false,
  addToFeatured: false,
  addToSlider: false,
  content: "",
  duration: null,
  videoUrl: null,
  videoFileUrls: null,
  videoEmbedCode: null,
  imageUrl: "",
  videoThumbnailUrl: "",
};

export interface ReelInitialStateInterface {
  videoUrl: string;
  thumbnailUrl: string | null;
  caption: string | null;
  tags: string[]; // Array of tag IDs
  authorId: string | null;
}

export const reelInitialState: ReelInitialStateInterface = {
  videoUrl: "",
  thumbnailUrl: null,
  caption: null,
  tags: [],
  authorId: null,
};
