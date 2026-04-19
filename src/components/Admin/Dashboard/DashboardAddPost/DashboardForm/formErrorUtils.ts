import { useEffect, useMemo, useRef } from "react";

export type FieldErrors = Record<string, string[]>;

const FIELD_ALIAS_MAP: Record<string, string> = {
  title: "title",
  content: "content",
  categoryid: "categoryId",
  language: "language",
  slug: "slug",
  optionalurl: "optionalURL",
  tagids: "tagIds",
  tags: "tags",
  metadescription: "metaDescription",
  metakeywords: "metaKeywords",
  imageurl: "imageUrl",
  thumbnailurl: "imageUrl",
  imagedescription: "imageDescription",
  additionalimageurls: "additionalImageUrls",
  files: "fileUrls",
  fileurls: "fileUrls",
  scheduledat: "scheduledAt",
  status: "status",
  writerid: "writerId",
  videourl: "videoUrl",
  audiourl: "audioUrl",
  caption: "caption",
};

const SELECTOR_ALIAS_MAP: Record<string, string[]> = {
  tagIds: ["tags"],
  fileUrls: ["files"],
  imageUrl: ["thumbnailUrl"],
};

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

export function normalizeErrorFieldName(rawField: string): string {
  const compactKey = toCompactKey(rawField);
  return FIELD_ALIAS_MAP[compactKey] ?? rawField;
}

function normalizeMessages(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item ?? "").trim())
      .filter(Boolean);
  }

  const single = String(value ?? "").trim();
  return single ? [single] : [];
}

export function normalizeErrorMap(errors: Record<string, unknown>): FieldErrors {
  const normalized: FieldErrors = {};

  Object.entries(errors).forEach(([rawField, messages]) => {
    const field = normalizeErrorFieldName(rawField);
    const normalizedMessages = normalizeMessages(messages);
    if (normalizedMessages.length === 0) return;
    normalized[field] = [...(normalized[field] ?? []), ...normalizedMessages];
  });

  return normalized;
}

export function getValidationToastMessage(
  t: (key: string, options?: Record<string, unknown>) => string,
  errors: FieldErrors,
): string {
  const messages = Object.values(errors).flat().filter(Boolean);
  if (messages.length === 0) {
    return t("validation.formHasErrors");
  }

  const summary = t("errors.validationErrors", { count: messages.length });
  return messages.length === 1 ? messages[0] : `${summary}\n${messages[0]}`;
}

export function clearFieldErrorByName(
  previous: FieldErrors,
  fieldName: string,
): FieldErrors {
  const normalizedName = normalizeErrorFieldName(fieldName);
  const next = { ...previous };

  delete next[fieldName];
  delete next[normalizedName];

  if (normalizedName === "tagIds") {
    delete next.tags;
  }

  if (normalizedName === "tags") {
    delete next.tagIds;
  }

  if (normalizedName === "fileUrls") {
    delete next.files;
  }

  if (normalizedName === "imageUrl") {
    delete next.thumbnailUrl;
  }

  return next;
}

function findErrorElement(fieldName: string): HTMLElement | null {
  const selectorKeys = [fieldName, ...(SELECTOR_ALIAS_MAP[fieldName] ?? [])];

  for (const key of selectorKeys) {
    const selectors = [
      `[data-error-field="${key}"]`,
      `[name="${key}"]`,
      `#${key}`,
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element instanceof HTMLElement) return element;
    }
  }

  return null;
}

function focusFieldWithin(target: HTMLElement) {
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  ) {
    target.focus({ preventScroll: true });
    return;
  }

  const focusable = target.querySelector<HTMLElement>(
    'input, textarea, select, [contenteditable="true"], [tabindex]:not([tabindex="-1"])',
  );
  focusable?.focus({ preventScroll: true });
}

interface UseFormErrorNavigationOptions<TTab extends string> {
  activeTab?: TTab;
  fieldErrors: FieldErrors;
  setActiveTab?: (tab: TTab) => void;
  tabByField?: Partial<Record<string, TTab>>;
}

export function useFormErrorNavigation<TTab extends string>({
  activeTab,
  fieldErrors,
  setActiveTab,
  tabByField,
}: UseFormErrorNavigationOptions<TTab>) {
  const timeoutRef = useRef<number | null>(null);
  const firstErrorField = useMemo(() => Object.keys(fieldErrors)[0], [fieldErrors]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!firstErrorField) return;

    const targetTab = tabByField?.[firstErrorField];
    if (targetTab && setActiveTab && activeTab !== targetTab) {
      setActiveTab(targetTab);
      return;
    }

    const raf = window.requestAnimationFrame(() => {
      const target = findErrorElement(firstErrorField);
      if (!target) return;

      target.scrollIntoView({ behavior: "smooth", block: "center" });
      focusFieldWithin(target);

      target.classList.add(...HIGHLIGHT_CLASSES);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        target.classList.remove(...HIGHLIGHT_CLASSES);
      }, 1500);
    });

    return () => window.cancelAnimationFrame(raf);
  }, [activeTab, firstErrorField, setActiveTab, tabByField]);
}
