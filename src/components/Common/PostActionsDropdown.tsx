import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faPencil, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

interface PostActionsDropdownProps {
  postId: string;
  onEdit?: (postId: string) => void;
  onAddToSlider?: (postId: string) => void;
  onAddToFeatured?: (postId: string) => void;
  onAddToBreaking?: (postId: string) => void;
  onAddToRecommended?: (postId: string) => void;
  onDelete?: (postId: string) => void;
}

export default function PostActionsDropdown({
  postId,
  onEdit,
  onAddToSlider,
  onAddToFeatured,
  onAddToBreaking,
  onAddToRecommended,
  onDelete,
}: PostActionsDropdownProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleAction = (callback?: (id: string) => void) => {
    if (callback) {
      callback(postId);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 px-4 py-2 text-sm font-medium bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <span>{t('common.manage')}</span>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 z-[100] py-1 top-full">
          {/* Edit */}
          <button
            onClick={() => handleAction(onEdit)}
            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-3 rtl:space-x-reverse transition-colors"
          >
            <FontAwesomeIcon icon={faPencil} className="text-slate-600 w-4" />
            <span>{t('common.edit')}</span>
          </button>

          {/* Divider */}
          <div className="border-t border-slate-200 my-1"></div>

          {/* Add to Slider */}
          <button
            onClick={() => handleAction(onAddToSlider)}
            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-3 rtl:space-x-reverse transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} className="text-slate-600 w-4" />
            <span>{t('formLabels.addToSlider')}</span>
          </button>

          {/* Add to Featured */}
          <button
            onClick={() => handleAction(onAddToFeatured)}
            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-3 rtl:space-x-reverse transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} className="text-slate-600 w-4" />
            <span>{t('formLabels.addToFeatured')}</span>
          </button>

          {/* Add to Breaking */}
          <button
            onClick={() => handleAction(onAddToBreaking)}
            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-3 rtl:space-x-reverse transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} className="text-slate-600 w-4" />
            <span>{t('formLabels.addToBreaking')}</span>
          </button>

          {/* Add to Recommended */}
          <button
            onClick={() => handleAction(onAddToRecommended)}
            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-3 rtl:space-x-reverse transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} className="text-slate-600 w-4" />
            <span>{t('formLabels.addToRecommended')}</span>
          </button>

          {/* Divider */}
          <div className="border-t border-slate-200 my-1"></div>

          {/* Delete */}
          <button
            onClick={() => handleAction(onDelete)}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 rtl:space-x-reverse transition-colors"
          >
            <FontAwesomeIcon icon={faTrash} className="text-red-600 w-4" />
            <span>{t('common.delete')}</span>
          </button>
        </div>
      )}
    </div>
  );
}
