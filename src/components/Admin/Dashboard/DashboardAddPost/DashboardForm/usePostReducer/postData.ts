export interface ShardedInitialStateInterface {
  categoryId: string;
  language: "English" | "Arabic";
  title: string;
  slug: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
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
  language: "English",
  title: "",
  slug: null,
  metaDescription: null,
  metaKeywords: null,
  optionalURL: null,
  scheduledAt: null,
  status: "Draft",
  visibility: true,
  showOnlyToRegisteredUsers: true,
  tagIds: [],
  addToRecommended: true,
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
  addToBreaking: true,
  addToFeatured: true,
  addToSlider: true,
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
  addToBreaking: true,
  addToFeatured: true,
  addToSlider: true,
  audioUrl: null,
  imageUrl: "",
  thumbnailUrl: null,
};

interface Item {
  title: string;
  imageUrl: string;
  imageDescription: string;
  content: string;
}
export interface GalleryInitialStateInterface
  extends ShardedInitialStateInterface {
  imageUrl: string;
  imageDescription: string | null;
  items: Item[];
  showItemNumbersInPostDetailsPage: boolean;
}

export const galleryInitialState: GalleryInitialStateInterface = {
  ...shardedInitialState,
  imageUrl: "",
  imageDescription: null,
  items: [
    {
      title: "",
      imageUrl: "",
      imageDescription: "",
      content: "",
    },
  ],
  showItemNumbersInPostDetailsPage: true,
};

export interface SortedListInitialStateInterface
  extends ShardedInitialStateInterface {
  imageUrl: string;
  imageDescription: string | null;
  items: Item[];
  showNumbers: boolean;
}
export const sortedListInitialState: SortedListInitialStateInterface = {
  ...shardedInitialState,
  imageUrl: "",
  imageDescription: "",
  items: [
    {
      title: "",
      imageUrl: "",
      imageDescription: "",
      content: "",
    },
  ],
  showNumbers: true,
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
  addToBreaking: true,
  addToFeatured: true,
  addToSlider: true,
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
