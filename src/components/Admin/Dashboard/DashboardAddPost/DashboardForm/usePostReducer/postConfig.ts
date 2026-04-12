import {
  articleInitialState,
  audioInitialState,
  videoInitialState,
  reelInitialState
} from "./postData";

export type PostType =
  | "article"
  | "video"
  | "audio"
  | "reel";

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
  video: {
    endpoint: "videos",
    initialState: videoInitialState,
  },
  audio: {
    endpoint: "audios",
    initialState: audioInitialState,
  },
  reel: {
    endpoint: "reels",
    initialState: reelInitialState,
  },
};
