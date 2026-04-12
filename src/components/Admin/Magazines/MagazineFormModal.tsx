import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faCloudUploadAlt,
  faFilePdf,
  faImage,
  faCheckCircle,
  faSpinner,
  faTrash,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import { AnimatePresence, motion } from "framer-motion";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";
import { useCreateMagazine, useUpdateMagazine } from "@/hooks/useFetchMagazines";
import { useToast } from "@/components/Toast/ToastContainer";
import type { Magazine } from "@/api/magazines.api";

interface MagazineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** If provided, the modal is in "edit" mode */
  magazine?: Magazine | null;
}

export default function MagazineFormModal({
  isOpen,
  onClose,
  magazine,
}: MagazineFormModalProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const isEditMode = !!magazine;

  // ────────────────────────── Form State ──────────────────────────
  const [issueNumber, setIssueNumber] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ issueNumber?: string; pdf?: string }>({});

  // ────────────────────────── Upload Hooks ──────────────────────────
  const pdfUpload = useCloudinaryUpload();
  const thumbUpload = useCloudinaryUpload();

  // ────────────────────────── Mutation Hooks ──────────────────────────
  const createMagazine = useCreateMagazine();
  const updateMagazine = useUpdateMagazine();

  // ────────────────────────── Refs ──────────────────────────
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  // ────────────────────────── Drag State ──────────────────────────
  const [pdfDragOver, setPdfDragOver] = useState(false);
  const [thumbDragOver, setThumbDragOver] = useState(false);

  // ────────────────────────── Derived State ──────────────────────────
  const isBusy =
    pdfUpload.isUploading ||
    thumbUpload.isUploading ||
    createMagazine.isPending ||
    updateMagazine.isPending;

  // ────────────────────────── Initialize on open/edit ──────────────────────────
  useEffect(() => {
    if (isOpen) {
      if (magazine) {
        setIssueNumber(magazine.issueNumber);
        setPdfUrl(magazine.pdfUrl);
        setThumbnailUrl(magazine.thumbnailUrl);
        setThumbnailPreview(magazine.thumbnailUrl);
        setPdfFileName(magazine.pdfUrl ? `Issue-${magazine.issueNumber}.pdf` : null);
      } else {
        setIssueNumber("");
        setPdfUrl("");
        setThumbnailUrl(null);
        setThumbnailPreview(null);
        setPdfFileName(null);
      }
      setErrors({});
      pdfUpload.reset();
      thumbUpload.reset();
    }
  }, [isOpen, magazine]);

  // ────────────────────────── Validation ──────────────────────────
  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!issueNumber.trim()) {
      newErrors.issueNumber = t("magazines.issueNumberRequired");
    }
    if (!pdfUrl && !pdfUpload.isUploading) {
      newErrors.pdf = t("magazines.pdfRequired");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ────────────────────────── PDF Upload Handler ──────────────────────────
  const handlePdfFile = useCallback(
    async (file: File) => {
      if (file.type !== "application/pdf") {
        toast.error(t("magazines.selectPdfFile"));
        return;
      }
      setErrors((prev) => ({ ...prev, pdf: undefined }));
      setPdfFileName(file.name);

      const result = await pdfUpload.upload(file, "Magazine");
      if (result?.url) {
        setPdfUrl(result.url);
        toast.success(t("magazines.pdfUploaded"));
      }
    },
    [pdfUpload, toast, t]
  );

  // ────────────────────────── Thumbnail Upload Handler ──────────────────────────
  const handleThumbnailFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error(t("magazines.imageAcceptedFormats"));
        return;
      }

      // Show local preview immediately
      const localPreview = URL.createObjectURL(file);
      setThumbnailPreview(localPreview);

      const result = await thumbUpload.upload(file, "Image");
      if (result?.url) {
        setThumbnailUrl(result.url);
        toast.success(t("magazines.thumbnailUploaded"));
        // Revoke local preview, use the cloudinary URL
        URL.revokeObjectURL(localPreview);
        setThumbnailPreview(result.url);
      } else {
        // Upload failed, clear preview
        URL.revokeObjectURL(localPreview);
        setThumbnailPreview(thumbnailUrl); // Revert to original
      }
    },
    [thumbUpload, toast, t, thumbnailUrl]
  );

  // ────────────────────────── Drop Handlers ──────────────────────────
  const handleDrop = useCallback(
    (e: React.DragEvent, type: "pdf" | "image") => {
      e.preventDefault();
      e.stopPropagation();
      if (type === "pdf") setPdfDragOver(false);
      else setThumbDragOver(false);

      const file = e.dataTransfer.files?.[0];
      if (!file) return;

      if (type === "pdf") handlePdfFile(file);
      else handleThumbnailFile(file);
    },
    [handlePdfFile, handleThumbnailFile]
  );

  const handleDragOver = (e: React.DragEvent, type: "pdf" | "image") => {
    e.preventDefault();
    e.stopPropagation();
    if (type === "pdf") setPdfDragOver(true);
    else setThumbDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent, type: "pdf" | "image") => {
    e.preventDefault();
    e.stopPropagation();
    if (type === "pdf") setPdfDragOver(false);
    else setThumbDragOver(false);
  };

  // ────────────────────────── Submit ──────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      issueNumber: issueNumber.trim(),
      pdfUrl,
      thumbnailUrl: thumbnailUrl ?? null,
    };

    try {
      if (isEditMode) {
        await updateMagazine.mutateAsync(payload);
        toast.success(t("magazines.updateSuccess"));
      } else {
        await createMagazine.mutateAsync(payload);
        toast.success(t("magazines.createSuccess"));
      }
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.title ||
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        (isEditMode ? t("magazines.updateError") : t("magazines.createError"));
      toast.error(msg);
    }
  };

  // ────────────────────────── Close handler ──────────────────────────
  const handleClose = () => {
    if (isBusy) return;
    pdfUpload.reset();
    thumbUpload.reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">
                {isEditMode ? t("magazines.editMagazine") : t("magazines.createMagazine")}
              </h2>
              <button
                type="button"
                onClick={handleClose}
                disabled={isBusy}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faXmark} className="text-xl" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* ── Issue Number ── */}
              <div>
                <label
                  htmlFor="magazine-issue-number"
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                  {t("magazines.issueNumber")} <span className="text-red-500">*</span>
                </label>
                <input
                  id="magazine-issue-number"
                  type="text"
                  value={issueNumber}
                  onChange={(e) => {
                    setIssueNumber(e.target.value);
                    if (errors.issueNumber) setErrors((prev) => ({ ...prev, issueNumber: undefined }));
                  }}
                  placeholder={t("magazines.issueNumberPlaceholder")}
                  disabled={isBusy || isEditMode}
                  className={`w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#13967B]/30 focus:border-[#13967B] disabled:bg-gray-50 disabled:cursor-not-allowed ${errors.issueNumber
                      ? "border-red-400 ring-2 ring-red-100"
                      : "border-gray-200 hover:border-gray-300"
                    }`}
                />
                {errors.issueNumber && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    {errors.issueNumber}
                  </p>
                )}
              </div>

              {/* ── PDF Upload Zone ── */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {t("magazines.pdfFile")} <span className="text-red-500">*</span>
                </label>

                {/* Uploaded State */}
                {pdfUrl && !pdfUpload.isUploading ? (
                  <div className="border border-green-200 bg-green-50/50 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <FontAwesomeIcon icon={faFilePdf} className="text-red-500 text-lg" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 truncate max-w-[280px]">
                          {pdfFileName || t("magazines.currentPdf")}
                        </p>
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <FontAwesomeIcon icon={faCheckCircle} />
                          {t("magazines.pdfUploaded")}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => pdfInputRef.current?.click()}
                      disabled={isBusy}
                      className="px-3 py-1.5 text-sm font-medium text-[#13967B] bg-white border border-[#13967B]/30 rounded-lg hover:bg-[#13967B]/5 transition-colors disabled:opacity-50"
                    >
                      <FontAwesomeIcon icon={faRotateRight} className="me-1.5" />
                      {t("magazines.replacePdf")}
                    </button>
                  </div>
                ) : pdfUpload.isUploading ? (
                  /* Uploading State */
                  <div className="border border-blue-200 bg-blue-50/50 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <FontAwesomeIcon
                        icon={faSpinner}
                        className="text-blue-500 animate-spin text-lg"
                      />
                      <span className="text-sm font-medium text-blue-700">
                        {t("magazines.uploadingPdf")}
                      </span>
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${pdfUpload.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-blue-500 mt-1.5 text-end">
                      {pdfUpload.progress}%
                    </p>
                  </div>
                ) : (
                  /* Drop Zone */
                  <div
                    onClick={() => pdfInputRef.current?.click()}
                    onDrop={(e) => handleDrop(e, "pdf")}
                    onDragOver={(e) => handleDragOver(e, "pdf")}
                    onDragLeave={(e) => handleDragLeave(e, "pdf")}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 group ${pdfDragOver
                        ? "border-[#13967B] bg-[#13967B]/5 scale-[1.01]"
                        : errors.pdf
                          ? "border-red-300 bg-red-50/30 hover:border-red-400"
                          : "border-gray-200 hover:border-[#13967B]/50 hover:bg-gray-50/50"
                      }`}
                  >
                    <div
                      className={`w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center transition-colors ${pdfDragOver
                          ? "bg-[#13967B]/10 text-[#13967B]"
                          : "bg-gray-100 text-gray-400 group-hover:bg-[#13967B]/10 group-hover:text-[#13967B]"
                        }`}
                    >
                      <FontAwesomeIcon icon={faCloudUploadAlt} className="text-2xl" />
                    </div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {t("magazines.dragDropPdf")}
                    </p>
                    <p className="text-xs text-gray-400">{t("magazines.pdfAcceptedFormats")}</p>
                  </div>
                )}

                {errors.pdf && !pdfUpload.isUploading && (
                  <p className="mt-1.5 text-sm text-red-500">{errors.pdf}</p>
                )}

                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePdfFile(file);
                    e.target.value = "";
                  }}
                />
              </div>

              {/* ── Thumbnail Upload Zone ── */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {t("magazines.thumbnailOptional")}
                </label>

                {/* Preview State */}
                {thumbnailPreview && !thumbUpload.isUploading ? (
                  <div className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-24 h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 space-y-2 pt-1">
                        <p className="text-xs text-green-600 flex items-center gap-1 font-medium">
                          <FontAwesomeIcon icon={faCheckCircle} />
                          {t("magazines.thumbnailUploaded")}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => thumbInputRef.current?.click()}
                            disabled={isBusy}
                            className="px-3 py-1.5 text-xs font-medium text-[#13967B] bg-[#13967B]/5 border border-[#13967B]/20 rounded-lg hover:bg-[#13967B]/10 transition-colors disabled:opacity-50"
                          >
                            <FontAwesomeIcon icon={faRotateRight} className="me-1" />
                            {t("magazines.replaceThumbnail")}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setThumbnailUrl(null);
                              setThumbnailPreview(null);
                            }}
                            disabled={isBusy}
                            className="px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            <FontAwesomeIcon icon={faTrash} className="me-1" />
                            {t("magazines.removeThumbnail")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : thumbUpload.isUploading ? (
                  /* Uploading State */
                  <div className="border border-blue-200 bg-blue-50/50 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <FontAwesomeIcon
                        icon={faSpinner}
                        className="text-blue-500 animate-spin text-lg"
                      />
                      <span className="text-sm font-medium text-blue-700">
                        {t("magazines.uploadingThumbnail")}
                      </span>
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${thumbUpload.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-blue-500 mt-1.5 text-end">
                      {thumbUpload.progress}%
                    </p>
                  </div>
                ) : (
                  /* Drop Zone */
                  <div
                    onClick={() => thumbInputRef.current?.click()}
                    onDrop={(e) => handleDrop(e, "image")}
                    onDragOver={(e) => handleDragOver(e, "image")}
                    onDragLeave={(e) => handleDragLeave(e, "image")}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 group ${thumbDragOver
                        ? "border-[#13967B] bg-[#13967B]/5 scale-[1.01]"
                        : "border-gray-200 hover:border-[#13967B]/50 hover:bg-gray-50/50"
                      }`}
                  >
                    <div
                      className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center transition-colors ${thumbDragOver
                          ? "bg-[#13967B]/10 text-[#13967B]"
                          : "bg-gray-100 text-gray-400 group-hover:bg-[#13967B]/10 group-hover:text-[#13967B]"
                        }`}
                    >
                      <FontAwesomeIcon icon={faImage} className="text-xl" />
                    </div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {t("magazines.dragDropImage")}
                    </p>
                    <p className="text-xs text-gray-400">{t("magazines.imageAcceptedFormats")}</p>
                  </div>
                )}

                <input
                  ref={thumbInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleThumbnailFile(file);
                    e.target.value = "";
                  }}
                />
              </div>

              {/* ── Actions ── */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isBusy}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isBusy}
                  className="flex-1 px-4 py-3 bg-[#13967B] text-white rounded-xl font-medium hover:bg-[#0e7a64] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#13967B]/20 hover:shadow-xl hover:shadow-[#13967B]/30"
                >
                  {isBusy ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                      {pdfUpload.isUploading || thumbUpload.isUploading
                        ? t("common.uploading")
                        : t("magazines.saving")}
                    </>
                  ) : isEditMode ? (
                    t("magazines.update")
                  ) : (
                    t("magazines.create")
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
