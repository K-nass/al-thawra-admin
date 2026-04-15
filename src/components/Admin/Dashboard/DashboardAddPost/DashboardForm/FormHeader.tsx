import { useTranslation } from "react-i18next";

export default function FormHeader({ type, isEditMode = false }: { type: string | null; isEditMode?: boolean }) {
  const { t } = useTranslation();
  
  // Get translated content type name
  const getTranslatedType = (type: string | null) => {
    if (!type) return '';
    const typeKey = type.toLowerCase().replace(/\s+/g, '');
    return t(`contentTypes.${typeKey}`, type);
  };
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
      <h2 className="text-xl sm:text-2xl font-bold">
        {isEditMode ? t('post.editPost', 'Edit Post') : t('post.addPost')} {getTranslatedType(type)}
      </h2>
    </div>
  );
}
