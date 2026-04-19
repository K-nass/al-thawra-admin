import axios from "axios";

export type ModalFieldErrors = Record<string, string | undefined>;

interface ValidationParseResult {
  fieldErrors: ModalFieldErrors;
  messages: string[];
}

const HIGHLIGHT_CLASSES = [
  "ring-4",
  "ring-rose-500/50",
  "ring-offset-2",
  "ring-offset-white",
  "shadow-xl",
  "shadow-rose-500/20",
  "transition-all",
  "duration-300",
];

function toCompactKey(rawField: string): string {
  return rawField
    .replace(/\[[^\]]*\]/g, "")
    .replace(/[_\-. ]/g, "")
    .toLowerCase();
}

function normalizeServerFieldName(
  rawField: string,
  aliases: Record<string, string>,
): string {
  const compact = toCompactKey(rawField);
  return aliases[compact] ?? rawField;
}

function normalizeMessages(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item ?? "").trim()).filter(Boolean);
  }

  const single = String(value ?? "").trim();
  return single ? [single] : [];
}

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseApiValidationErrors(
  error: unknown,
  aliases: Record<string, string>,
): ValidationParseResult {
  const fallback: ValidationParseResult = { fieldErrors: {}, messages: [] };
  if (!axios.isAxiosError(error)) return fallback;

  const responseData = error.response?.data;
  if (!isObjectLike(responseData)) return fallback;
  if (error.response?.status !== 422 || !isObjectLike(responseData.errors)) {
    return fallback;
  }

  const fieldErrors: ModalFieldErrors = {};
  const messages: string[] = [];

  Object.entries(responseData.errors).forEach(([rawField, value]) => {
    const normalizedField = normalizeServerFieldName(rawField, aliases);
    const normalized = normalizeMessages(value);
    if (normalized.length === 0) return;
    if (!fieldErrors[normalizedField]) {
      fieldErrors[normalizedField] = normalized[0];
    }
    messages.push(...normalized);
  });

  return { fieldErrors, messages };
}

export function extractApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { title?: string; message?: string; detail?: string }
      | undefined;
    return data?.title || data?.message || data?.detail || error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

function findErrorTarget(fieldName: string): HTMLElement | null {
  const target = document.querySelector(
    `[data-error-field="${fieldName}"], [name="${fieldName}"], #${fieldName}`,
  );
  return target instanceof HTMLElement ? target : null;
}

export function focusAndHighlightField(fieldName: string) {
  const target = findErrorTarget(fieldName);
  if (!target) return;

  target.scrollIntoView({ behavior: "smooth", block: "center" });

  const focusable =
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
      ? target
      : target.querySelector<HTMLElement>(
          'input, textarea, select, [contenteditable="true"], [tabindex]:not([tabindex="-1"])',
        );

  focusable?.focus({ preventScroll: true });

  target.classList.add(...HIGHLIGHT_CLASSES);
  window.setTimeout(() => {
    target.classList.remove(...HIGHLIGHT_CLASSES);
  }, 1500);
}

export function focusFirstErrorField(fieldErrors: ModalFieldErrors) {
  const firstField = Object.entries(fieldErrors).find(([, value]) => Boolean(value))?.[0];
  if (!firstField) return;
  window.requestAnimationFrame(() => focusAndHighlightField(firstField));
}
