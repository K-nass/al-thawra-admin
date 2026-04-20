import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  X,
  Upload,
  FileText,
  Image,
  Loader2,
  RotateCw,
  Trash2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";
import { useCreateMagazine, useUpdateMagazine } from "@/hooks/useFetchMagazines";
import { useToast } from "@/components/Toast/ToastContainer";
import type { Magazine } from "@/api/magazines.api";
import {
  extractApiErrorMessage,
  focusFirstErrorField,
  parseApiValidationErrors,
  type ModalFieldErrors,
} from "@/utils/apiFormErrors";

interface MagazineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
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

  const [issueNumber, setIssueNumber] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ issueNumber?: string; pdf?: string; thumbnail?: string }>({});

  const pdfUpload = useCloudinaryUpload();
  const thumbUpload = useCloudinaryUpload();

  const createMagazine = useCreateMagazine();
  const updateMagazine = useUpdateMagazine();

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const [pdfDragOver, setPdfDragOver] = useState(false);
  const [thumbDragOver, setThumbDragOver] = useState(false);
  const serverFieldAliases = {
    issuenumber: "issueNumber",
    pdfurl: "pdf",
    pdf: "pdf",
    thumbnailurl: "thumbnail",
  } as const;

  const isBusy =
    pdfUpload.isUploading ||
    thumbUpload.isUploading ||
    createMagazine.isPending ||
    updateMagazine.isPending;

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

  useEffect(() => {
    focusFirstErrorField(errors as ModalFieldErrors);
  }, [errors]);

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

  const handleThumbnailFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error(t("magazines.imageAcceptedFormats"));
        return;
      }
      setErrors((prev) => ({ ...prev, thumbnail: undefined }));

      const localPreview = URL.createObjectURL(file);
      setThumbnailPreview(localPreview);

      const result = await thumbUpload.upload(file, "Image");
      if (result?.url) {
        setThumbnailUrl(result.url);
        toast.success(t("magazines.thumbnailUploaded"));
        URL.revokeObjectURL(localPreview);
        setThumbnailPreview(result.url);
      } else {
        URL.revokeObjectURL(localPreview);
        setThumbnailPreview(thumbnailUrl);
      }
    },
    [thumbUpload, toast, t, thumbnailUrl]
  );

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
    } catch (err) {
      const parsed = parseApiValidationErrors(err, serverFieldAliases);
      if (Object.keys(parsed.fieldErrors).length > 0) {
        setErrors((prev) => ({
          ...prev,
          issueNumber: parsed.fieldErrors.issueNumber ?? prev.issueNumber,
          pdf: parsed.fieldErrors.pdf ?? prev.pdf,
          thumbnail: parsed.fieldErrors.thumbnail ?? prev.thumbnail,
        }));
        toast.error(
          parsed.messages[0] ||
            (isEditMode ? t("magazines.updateError") : t("magazines.createError")),
        );
        return;
      }

      toast.error(
        extractApiErrorMessage(
          err,
          isEditMode ? t("magazines.updateError") : t("magazines.createError"),
        ),
      );
    }
  };

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
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            className="relative bg-white rounded-[2rem] shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-8 py-5 flex items-center justify-between rounded-t-[2rem]">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                {isEditMode ? t("magazines.editMagazine") : t("magazines.createMagazine")}
              </h2>
              <button
                type="button"
                onClick={handleClose}
                disabled={isBusy}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div data-error-field={errors.issueNumber ? "issueNumber" : undefined}>
                <label
                  htmlFor="magazine-issue-number"
                  className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block"
                >
                  {t("magazines.issueNumber")} <span className="text-red-500">*</span>
                </label>
                <input
                  id="magazine-issue-number"
                  name="issueNumber"
                  type="text"
                  value={issueNumber}
                  onChange={(e) => {
                    setIssueNumber(e.target.value);
                    if (errors.issueNumber) setErrors((prev) => ({ ...prev, issueNumber: undefined }));
                  }}
                  placeholder={t("magazines.issueNumberPlaceholder")}
                  disabled={isBusy || isEditMode}
                  className={`w-full px-5 py-4 bg-slate-50 border rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-colors ${errors.issueNumber
                      ? "border-red-400 ring-2 ring-red-100"
                      : "border-slate-200 hover:border-slate-300"
                    } disabled:bg-slate-100 disabled:cursor-not-allowed`}
                />
                {errors.issueNumber && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.issueNumber}
                  </p>
                )}
              </div>

              <div data-error-field={errors.pdf ? "pdf" : undefined}>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  {t("magazines.pdfFile")} <span className="text-red-500">*</span>
                </label>

                {pdfUrl && !pdfUpload.isUploading ? (
                  <div className="border border-emerald-200 bg-emerald-50/50 rounded-2xl p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                        <FileText size={20} className="text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 truncate max-w-[200px]">
                          {pdfFileName || t("magazines.currentPdf")}
                        </p>
                        <p className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
                          <CheckCircle size={12} />
                          {t("magazines.pdfUploaded")}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => pdfInputRef.current?.click()}
                      disabled={isBusy}
                      className="px-4 py-2 text-sm font-bold text-primary bg-primary/5 border border-primary/20 rounded-xl hover:bg-primary/10 transition-colors"
                    >
                      <RotateCw size={14} className="inline me-1.5" />
                      {t("magazines.replacePdf")}
                    </button>
                  </div>
                ) : pdfUpload.isUploading ? (
                  <div className="border border-blue-200 bg-blue-50/50 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Loader2 size={20} className="text-blue-500 animate-spin" />
                      <span className="text-sm font-bold text-blue-700">
                        {t("magazines.uploadingPdf")}
                      </span>
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${pdfUpload.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-blue-500 mt-2 text-end font-bold">
                      {pdfUpload.progress}%
                    </p>
                  </div>
                ) : (
                  <div
                    onClick={() => pdfInputRef.current?.click()}
                    onDrop={(e) => handleDrop(e, "pdf")}
                    onDragOver={(e) => handleDragOver(e, "pdf")}
                    onDragLeave={(e) => handleDragLeave(e, "pdf")}
                    className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 group ${pdfDragOver
                        ? "border-primary bg-primary/5 scale-[1.01]"
                        : errors.pdf
                          ? "border-red-300 bg-red-50/30 hover:border-red-400"
                          : "border-slate-200 hover:border-primary/50 hover:bg-slate-50/50"
                      }`}
                  >
                    <div
                      className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-colors ${pdfDragOver
                          ? "bg-primary/10 text-primary"
                          : "bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary"
                        }`}
                    >
                      <Upload size={28} />
                    </div>
                    <p className="text-sm font-bold text-slate-600 mb-1">
                      {t("magazines.dragDropPdf")}
                    </p>
                    <p className="text-xs text-slate-400">{t("magazines.pdfAcceptedFormats")}</p>
                  </div>
                )}

                {errors.pdf && !pdfUpload.isUploading && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.pdf}
                  </p>
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

              <div data-error-field={errors.thumbnail ? "thumbnail" : undefined}>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  {t("magazines.thumbnailOptional")}
                </label>

                {thumbnailPreview && !thumbUpload.isUploading ? (
                  <div className="border border-slate-200 rounded-2xl p-5">
                    <div className="flex items-start gap-5">
                      <div className="w-28 h-36 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 space-y-3 pt-1">
                        <p className="text-xs text-emerald-600 flex items-center gap-1 font-bold">
                          <CheckCircle size={12} />
                          {t("magazines.thumbnailUploaded")}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => thumbInputRef.current?.click()}
                            disabled={isBusy}
                            className="px-4 py-2 text-xs font-bold text-primary bg-primary/5 border border-primary/20 rounded-xl hover:bg-primary/10 transition-colors"
                          >
                            <RotateCw size={12} className="inline me-1" />
                            {t("magazines.replaceThumbnail")}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setThumbnailUrl(null);
                              setThumbnailPreview(null);
                            }}
                            disabled={isBusy}
                            className="px-4 py-2 text-xs font-bold text-red-500 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-colors"
                          >
                            <Trash2 size={12} className="inline me-1" />
                            {t("magazines.removeThumbnail")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : thumbUpload.isUploading ? (
                  <div className="border border-blue-200 bg-blue-50/50 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Loader2 size={20} className="text-blue-500 animate-spin" />
                      <span className="text-sm font-bold text-blue-700">
                        {t("magazines.uploadingThumbnail")}
                      </span>
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${thumbUpload.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-blue-500 mt-2 text-end font-bold">
                      {thumbUpload.progress}%
                    </p>
                  </div>
                ) : (
                  <div
                    onClick={() => thumbInputRef.current?.click()}
                    onDrop={(e) => handleDrop(e, "image")}
                    onDragOver={(e) => handleDragOver(e, "image")}
                    onDragLeave={(e) => handleDragLeave(e, "image")}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 group ${thumbDragOver
                        ? "border-primary bg-primary/5 scale-[1.01]"
                        : "border-slate-200 hover:border-primary/50 hover:bg-slate-50/50"
                      }`}
                  >
                    <div
                      className={`w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center transition-colors ${thumbDragOver
                          ? "bg-primary/10 text-primary"
                          : "bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary"
                        }`}
                    >
                      <Image size={24} />
                    </div>
                    <p className="text-sm font-bold text-slate-600 mb-1">
                      {t("magazines.dragDropImage")}
                    </p>
                    <p className="text-xs text-slate-400">{t("magazines.imageAcceptedFormats")}</p>
                  </div>
                )}
                {errors.thumbnail && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.thumbnail}
                  </p>
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

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isBusy}
                  className="flex-1 px-5 py-4 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isBusy}
                  className="flex-1 px-5 py-4 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isBusy ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
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
