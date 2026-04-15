import * as Yup from "yup";

/**
 * Reusable validation messages for English and Arabic.
 * These are used by the schemas to provide dynamic i18n support.
 */
const messages = {
  en: {
    required: "This field is required",
    email: "Invalid email address",
    minSelect: "Please select at least one item",
  },
  ar: {
    required: "هذا الحقل مطلوب",
    email: "البريد الإلكتروني غير صالح",
    minSelect: "يرجى اختيار عنصر واحد على الأقل",
  },
};

/**
 * Returns a collection of Yup validation schemas based on the selected language.
 * 
 * @param lang - The language to use for error messages ("en" | "ar")
 * @returns An object containing validation schemas for all application DTOs.
 */
export const getValidationSchema = (lang: "en" | "ar" = "ar") => {
  const msg = messages[lang];

  return {
    /**
     * Schema for Article creation and editing.
     */
    ArticleDto: Yup.object({
      title: Yup.string().required(msg.required),
      content: Yup.string().required(msg.required),
      status: Yup.string().required(msg.required),
      language: Yup.string().required(msg.required),
    }),

    /**
     * Schema for Video content.
     */
    VideoDto: Yup.object({
      title: Yup.string().required(msg.required),
      content: Yup.string().required(msg.required),
      status: Yup.string().required(msg.required),
      language: Yup.string().required(msg.required),
    }),

    /**
     * Schema for Audio content.
     */
    AudioDto: Yup.object({
      title: Yup.string().required(msg.required),
      content: Yup.string().required(msg.required),
      audioUrl: Yup.string().required(msg.required),
      status: Yup.string().required(msg.required),
      language: Yup.string().required(msg.required),
    }),

    /**
     * Schema for Photo Galleries.
     */
    GalleryDto: Yup.object({
      title: Yup.string().required(msg.required),
      language: Yup.string().required(msg.required),
      categoryId: Yup.string().required(msg.required),
      status: Yup.string().required(msg.required),
      items: Yup.array().min(1, msg.minSelect).required(msg.required),
    }),

    /**
     * Schema for Sorted Lists (e.g., top 10 lists).
     */
    SortedListDto: Yup.object({
      title: Yup.string().required(msg.required),
      language: Yup.string().required(msg.required),
      categoryId: Yup.string().required(msg.required),
      status: Yup.string().required(msg.required),
      items: Yup.array().min(1, msg.minSelect).required(msg.required),
    }),

    /**
     * Schema for individual items within a Gallery or Sorted List.
     */
    PostItemDto: Yup.object({
      title: Yup.string().required(msg.required),
      imageUrl: Yup.string().required(msg.required),
      content: Yup.string().required(msg.required),
    }),

    /**
     * Schema for Categories.
     */
    CategoryDto: Yup.object({
      name: Yup.string().required(msg.required),
      language: Yup.string().required(msg.required),
    }),

    /**
     * Schema for Tags.
     */
    TagDto: Yup.object({
      name: Yup.string().required(msg.required),
      language: Yup.string().required(msg.required),
    }),

    /**
     * Schema for standalone Pages.
     */
    PageDto: Yup.object({
      title: Yup.string().required(msg.required),
      content: Yup.string().required(msg.required),
      language: Yup.string().required(msg.required),
      location: Yup.string().required(msg.required),
    }),

    /**
     * Schema for User profile management.
     */
    UserDto: Yup.object({
      userName: Yup.string().required(msg.required),
      email: Yup.string().email(msg.email).required(msg.required),
      role: Yup.string().required(msg.required),
    }),
  };
};
