import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Pencil, Trash2, Ban, Check, Shield, MailCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UserActionsDropdownProps {
  userId: string;
  userName: string;
  isActive: boolean;
  emailConfirmed: boolean;
  onEdit: (userId: string) => void;
  onBan: (userId: string) => void;
  onActivate: (userId: string) => void;
  onChangeRole: (userId: string) => void;
  onConfirmEmail: (userId: string) => void;
  onDelete: (userId: string) => void;
}

export default function UserActionsDropdown({
  userId,
  isActive,
  emailConfirmed,
  onEdit,
  onBan,
  onActivate,
  onChangeRole,
  onConfirmEmail,
  onDelete,
}: UserActionsDropdownProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleAction = (callback: (id: string) => void) => {
    callback(userId);
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
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 z-100 py-1 top-full">
          {/* Edit */}
          <button
            onClick={() => handleAction(onEdit)}
            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-3 rtl:space-x-reverse transition-colors"
          >
            <Pencil className="text-slate-600 w-4 h-4" />
            <span>{t('common.edit')}</span>
          </button>

          {/* Divider */}
          <div className="border-t border-slate-200 my-1"></div>

          {/* Ban — only when active */}
          {isActive && (
            <button
              onClick={() => handleAction(onBan)}
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-3 rtl:space-x-reverse transition-colors"
            >
              <Ban className="text-slate-600 w-4 h-4" />
              <span>{t('users.ban')}</span>
            </button>
          )}

          {/* Activate — only when inactive */}
          {!isActive && (
            <button
              onClick={() => handleAction(onActivate)}
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-3 rtl:space-x-reverse transition-colors"
            >
              <Check className="text-slate-600 w-4 h-4" />
              <span>{t('users.activate')}</span>
            </button>
          )}

          {/* Change Role */}
          <button
            onClick={() => handleAction(onChangeRole)}
            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-3 rtl:space-x-reverse transition-colors"
          >
            <Shield className="text-slate-600 w-4 h-4" />
            <span>{t('users.changeRole')}</span>
          </button>

          {/* Confirm Email — disabled when already confirmed */}
          <button
            onClick={() => !emailConfirmed && handleAction(onConfirmEmail)}
            disabled={emailConfirmed}
            className={`w-full px-4 py-2 text-left text-sm flex items-center space-x-3 rtl:space-x-reverse transition-colors ${
              emailConfirmed
                ? 'text-slate-400 cursor-not-allowed'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <MailCheck className={`w-4 h-4 ${emailConfirmed ? 'text-slate-400' : 'text-slate-600'}`} />
            <span>{t('users.confirmEmail')}</span>
          </button>

          {/* Divider */}
          <div className="border-t border-slate-200 my-1"></div>

          {/* Delete */}
          <button
            onClick={() => handleAction(onDelete)}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 rtl:space-x-reverse transition-colors"
          >
            <Trash2 className="text-red-600 w-4 h-4" />
            <span>{t('common.delete')}</span>
          </button>
        </div>
      )}
    </div>
  );
}
