import type { ChangeEvent } from "react";

export type HandleChangeType = (
  e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | {
    target: {
      name: string;
      value: string | string[];
      type: string;
    };
  },
  newTags?: string[]
) => void;

// Add these types to your existing types file
export type ValidationErrors = {
  [key: string]: string[];
};

export type ApiValidationError = {
  type: string;
  title: string;
  status: number;
  errors: ValidationErrors;
};

export function isValidUrl(url: unknown): boolean {
  if (typeof url !== 'string' || !url) return false;
  if (url.startsWith('blob:') || url.startsWith('data:')) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}