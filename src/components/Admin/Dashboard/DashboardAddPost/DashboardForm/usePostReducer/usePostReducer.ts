import { useReducer } from "react";
import { postConfig, type PostType } from "./postConfig";

// A single generic reducer that works for all post types
function genericReducer(
  state: any,
  action: {
    type: string;
    field?: string;
    payload?: string | boolean | string[] | object[] | undefined;
  }
) {
  switch (action.type) {
    case "set-field":
      if (!action.field) return state;
      // Prevent undefined from overwriting existing values
      // If payload is undefined and the field exists with a non-undefined value, keep the existing value
      if (action.payload === undefined && state[action.field] !== undefined) {
        return state;
      }
      return { ...state, [action.field]: action.payload };
    default:
      return state;
  }
}

// Hook that initializes reducer based on post type
export function usePostReducer(postType: string | null) {
  const typeKey = (postType ?? "article") as PostType;

  const config = postConfig[typeKey];

  if (!config) {
    throw new Error(`Unknown post type: ${postType}`);
  }

  return useReducer(genericReducer, config.initialState);
}
