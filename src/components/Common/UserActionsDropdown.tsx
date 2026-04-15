import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Pencil, Trash2, Ban, Check, Shield, MailCheck, MoreVertical } from 'lucide-react';
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

const MENU_WIDTH_PX = 240;
const VIEWPORT_PADDING_PX = 8;
const GAP_PX = 8;

function isRtlDocument() {
  if (typeof document === 'undefined') return false;
  const dirAttr = document.documentElement.getAttribute('dir');
  if (dirAttr) return dirAttr.toLowerCase() === 'rtl';
  return getComputedStyle(document.documentElement).direction === 'rtl';
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({
    position: 'fixed',
    top: -9999,
    left: -9999,
    width: MENU_WIDTH_PX,
    zIndex: 9999,
  });

  const updateMenuPosition = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    const rtl = isRtlDocument();
    const width = Math.min(MENU_WIDTH_PX, window.innerWidth - VIEWPORT_PADDING_PX * 2);

    const leftUnclamped = rtl ? rect.left : rect.right - width;
    const left = Math.min(
      Math.max(leftUnclamped, VIEWPORT_PADDING_PX),
      window.innerWidth - width - VIEWPORT_PADDING_PX
    );

    const measuredHeight = menuRef.current?.offsetHeight ?? 0;
    const estimatedHeight = measuredHeight || 260;

    let top = rect.bottom + GAP_PX;
    if (top + estimatedHeight > window.innerHeight - VIEWPORT_PADDING_PX) {
      const flippedTop = rect.top - estimatedHeight - GAP_PX;
      if (flippedTop >= VIEWPORT_PADDING_PX) {
        top = flippedTop;
      } else {
        top = Math.max(VIEWPORT_PADDING_PX, window.innerHeight - estimatedHeight - VIEWPORT_PADDING_PX);
      }
    }

    setMenuStyle({
      position: 'fixed',
      top,
      left,
      width,
      zIndex: 9999,
      maxHeight: 'min(70vh, 420px)',
      overflowY: 'auto',
    });
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onScrollOrResize = () => updateMenuPosition();
    window.addEventListener('resize', onScrollOrResize);
    window.addEventListener('scroll', onScrollOrResize, true);

    const raf = requestAnimationFrame(() => updateMenuPosition());
    const timeout = window.setTimeout(() => updateMenuPosition(), 0);

    return () => {
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('scroll', onScrollOrResize, true);
      cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
    };
  }, [isOpen]);

  const handleAction = (callback: (id: string) => void) => {
    callback(userId);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      {/* Dropdown Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="inline-flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors duration-200 shadow-sm whitespace-nowrap"
      >
        <MoreVertical className="w-4 h-4" />
        <span className="hidden sm:inline">{t('common.manage')}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && typeof document !== 'undefined'
        ? createPortal(
        <div ref={menuRef} style={menuStyle} className="bg-white rounded-xl shadow-lg ring-1 ring-slate-200 py-1.5" role="menu">
          {/* Edit */}
          <button
            type="button"
            onClick={() => handleAction(onEdit)}
            className="w-full px-4 py-2.5 text-start text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-start gap-3 transition-colors duration-200"
          >
            <Pencil className="text-slate-600 w-4 h-4" />
            <span>{t('common.edit')}</span>
          </button>

          {/* Divider */}
          <div className="border-t border-slate-200 my-1"></div>

          {/* Ban — only when active */}
          {isActive && (
            <button
              type="button"
              onClick={() => handleAction(onBan)}
              className="w-full px-4 py-2.5 text-start text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-start gap-3 transition-colors duration-200"
            >
              <Ban className="text-slate-600 w-4 h-4" />
              <span>{t('users.ban')}</span>
            </button>
          )}

          {/* Activate — only when inactive */}
          {!isActive && (
            <button
              type="button"
              onClick={() => handleAction(onActivate)}
              className="w-full px-4 py-2.5 text-start text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-start gap-3 transition-colors duration-200"
            >
              <Check className="text-slate-600 w-4 h-4" />
              <span>{t('users.activate')}</span>
            </button>
          )}

          {/* Change Role */}
          <button
            type="button"
            onClick={() => handleAction(onChangeRole)}
            className="w-full px-4 py-2.5 text-start text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-start gap-3 transition-colors duration-200"
          >
            <Shield className="text-slate-600 w-4 h-4" />
            <span>{t('users.changeRole')}</span>
          </button>

          {/* Confirm Email — disabled when already confirmed */}
          <button
            type="button"
            onClick={() => !emailConfirmed && handleAction(onConfirmEmail)}
            disabled={emailConfirmed}
            className={`w-full px-4 py-2.5 text-start text-sm flex items-center justify-start gap-3 transition-colors duration-200 ${
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
            type="button"
            onClick={() => handleAction(onDelete)}
            className="w-full px-4 py-2.5 text-start text-sm text-red-600 hover:bg-red-50 flex items-center justify-start gap-3 transition-colors duration-200"
          >
            <Trash2 className="text-red-600 w-4 h-4" />
            <span>{t('common.delete')}</span>
          </button>
        </div>,
        document.body
      )
        : null}
    </div>
  );
}
