import { 
  articleInitialState, 
  audioInitialState, 
  galleryInitialState, 
  sortedListInitialState, 
  videoInitialState
} from "./postData";

export type PostType =
  | "article"
  | "gallery"
  | "video"
  | "audio"
  | "sorted-list"
  | "table-of-contents";

interface PostConfig {
  endpoint: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialState: any;
}

export const postConfig: Record<PostType, PostConfig> = {
  article: {
    endpoint: "articles",
    initialState: articleInitialState,
  },
  gallery: {
    endpoint: "galleries",
    initialState: galleryInitialState,
  },
  video: {
    endpoint: "videos",
    initialState: videoInitialState,
  },
  audio: {
    endpoint: "audios",
    initialState: audioInitialState,
  },
  "sorted-list": {
    endpoint: "sorted-lists",
    initialState: sortedListInitialState,
  },
  "table-of-contents": {
    endpoint: "table-of-contents",
    initialState: {},
  },
};
