import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { writersApi, type Writer, type CreateWriterRequest } from "@/api/writers.api";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/Toast/ToastContainer";
import { X, Loader2, Image as ImageIcon, UploadCloud } from "lucide-react";
import FileModal from "../DashboardAddPost/DashboardForm/FileModal";
import type { HandleChangeType } from "../DashboardAddPost/DashboardForm/types";

interface WriterModalProps {
  isOpen: boolean;
  onClose: () => void;
  writer: Writer | null;
}

export default function WriterModal({ isOpen, onClose, writer }: WriterModalProps) {
  const { t } = useLanguage();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CreateWriterRequest>({
    name: "",
    bio: null,
    birthDate: "",
    dateOfDeath: null,
    imageUrl: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    if (writer) {
      setFormData({
        name: writer.name,
        bio: writer.bio,
        birthDate: writer.birthDate ? writer.birthDate.slice(0, 10) : "",
        dateOfDeath: writer.dateOfDeath ? writer.dateOfDeath.slice(0, 10) : null,
        imageUrl: writer.imageUrl,
      });
    } else {
      setFormData({
        name: "",
        bio: null,
        birthDate: "",
        dateOfDeath: null,
        imageUrl: null,
      });
    }
    setErrors({});
  }, [writer, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t("writers.nameRequired");
    }
    if (!formData.birthDate) {
      newErrors.birthDate = t("writers.birthDate") + " is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createMutation = useMutation({
    mutationFn: (data: CreateWriterRequest) => writersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["writers"] });
      toast.success(t("writers.createSuccess"));
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t("writers.createError"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateWriterRequest }) =>
      writersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["writers"] });
      toast.success(t("writers.updateSuccess"));
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t("writers.updateError"));
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, imageUrl: value || null });
  };

  const handleMediaSelect = (media: { url: string }) => {
    if (media.url) {
      setFormData({ ...formData, imageUrl: media.url });
      setShowImageModal(false);
      toast.success("تم اضافة الصورة بنجاح");
    } else {
      toast.error("حدث خطأ أثناء رفع الصورة");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const submitData: CreateWriterRequest = {
      name: formData.name,
      bio: formData.bio || null,
      birthDate: new Date(formData.birthDate).toISOString(),
      dateOfDeath: formData.dateOfDeath ? new Date(formData.dateOfDeath).toISOString() : null,
      imageUrl: formData.imageUrl || null,
    };

    if (writer) {
      updateMutation.mutate({ id: writer.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white rounded-t-[2rem] p-8 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {writer ? t("writers.editWriter") : t("writers.addWriter")}
            </h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              {writer ? t("writers.editSubtitle") : t("writers.createSubtitle")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                {t("writers.writerName")}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t("writers.writerNamePlaceholder")}
                className={`w-full px-4 py-3.5 bg-slate-50 border ${
                  errors.name ? "border-rose-500" : "border-slate-200"
                } rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-colors`}
              />
              {errors.name && (
                <p className="text-xs text-rose-500 mt-2 font-medium">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                {t("writers.bio")}
              </label>
              <textarea
                value={formData.bio || ""}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value || null })}
                placeholder={t("writers.bioPlaceholder")}
                rows={4}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                  {t("writers.birthDate")}
                </label>
                <div className="relative group/date">
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className={`w-full px-4 py-3.5 bg-slate-50 border ${
                      errors.birthDate ? "border-rose-500 bg-rose-50" : "border-slate-200"
                    } rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-colors text-slate-700 min-h-[50px] appearance-none`}
                  />
                </div>
                {errors.birthDate && (
                  <p className="text-xs text-rose-500 mt-2 font-medium flex items-center gap-1">
                    <X size={14} />
                    {errors.birthDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                  {t("writers.dateOfDeath")}
                </label>
                <div className="relative group/date">
                  <input
                    type="date"
                    value={formData.dateOfDeath || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfDeath: e.target.value || null })
                    }
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-colors text-slate-700 min-h-[50px] appearance-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest text-center sm:text-start">
                الصوره
              </label>
              
              <div className="flex justify-center sm:justify-start">
                <div 
                   onClick={() => setShowImageModal(true)}
                   className={`relative w-40 h-40 sm:w-48 sm:h-48 rounded-[2rem] border-2 flex flex-col items-center justify-center overflow-hidden transition-all duration-300 cursor-pointer group ${formData.imageUrl ? 'border-transparent bg-slate-100 shadow-sm ring-4 ring-slate-50' : 'border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-primary/50'}`}
                >
                    {formData.imageUrl ? (
                      <>
                        <img
                          src={formData.imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <span className="text-white text-xs font-bold flex items-center gap-1.5 bg-black/50 px-3 py-1.5 rounded-xl backdrop-blur-sm shadow-lg">
                             <UploadCloud size={16} />
                             تغيير
                          </span>
                        </div>
                        
                        {/* Delete button positioned independently */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData({ ...formData, imageUrl: null });
                            toast.success("تم إزالة الصورة");
                          }}
                          className="absolute top-2 end-2 w-8 h-8 sm:w-10 sm:h-10 bg-rose-500/90 text-white rounded-xl shadow-lg flex items-center justify-center hover:bg-rose-600 hover:scale-105 active:scale-95 transition-all z-10"
                        >
                          <X size={16} className="sm:w-5 sm:h-5 text-white" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-primary transition-colors">
                        <div className="w-14 h-14 rounded-[1rem] bg-white shadow-sm flex items-center justify-center border border-slate-100 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300">
                          <ImageIcon size={28} strokeWidth={1.5} />
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-slate-500">
                          انقر لاختيار صورة
                        </span>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3.5 text-sm font-black uppercase tracking-widest text-slate-600 hover:text-slate-900 transition-colors"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center px-6 py-3.5 bg-slate-900 text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-sm hover:bg-primary transition-colors duration-200 gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending
                ? writer
                  ? t("common.updating")
                  : t("common.creating")
                : writer
                ? t("common.save")
                : t("writers.addWriter")}
            </button>
          </div>
        </form>
      </div>

      {showImageModal && (
        <ImageUploadModal
          onClose={() => setShowImageModal(false)}
          onSelect={handleMediaSelect}
        />
      )}
    </div>
  );
}

interface ImageUploadModalProps {
  onClose: () => void;
  onSelect: (media: { url: string }) => void;
}

function ImageUploadModal({ onClose, onSelect }: ImageUploadModalProps) {
  const handleFileChange: HandleChangeType = (payload) => {
    if (payload && typeof payload === 'object' && 'target' in payload && payload.target.name === "imageUrl") {
      onSelect({ url: payload.target.value as string });
    }
  };

  return (
    <FileModal
      onClose={onClose}
      header="images"
      handleChange={handleFileChange}
    />
  );
}