import { useState, useRef, useEffect, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Pencil, Plus, Minus, Trash2 as Trash, MoreVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PostActionsDropdownProps {
  postId: string;
  /** Current flag states — drives "Add to" vs "Remove from" labels */
  isSlider?: boolean;
  isFeatured?: boolean;
  isBreaking?: boolean;
  isRecommended?: boolean;
  onEdit?: (postId: string) => void;
  /** Called for both add AND remove — the mutation toggles the current value */
  onAddToSlider?: (postId: string) => void;
  onAddToFeatured?: (postId: string) => void;
  onAddToBreaking?: (postId: string) => void;
  onAddToRecommended?: (postId: string) => void;
  onDelete?: (postId: string) => void;
}

export default function PostActionsDropdown({
  postId,
  isSlider = false,
  isFeatured = false,
  isBreaking = false,
  isRecommended = false,
  onEdit,
  onAddToSlider,
  onAddToFeatured,
  onAddToBreaking,
  onAddToRecommended,
  onDelete,
}: PostActionsDropdownProps) {
  const MENU_WIDTH_PX = 260;
  const VIEWPORT_PADDING_PX = 8;
  const GAP_PX = 8;
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

  const isRtlDocument = () => {
    if (typeof document === 'undefined') return false;
    const dirAttr = document.documentElement.getAttribute('dir');
    if (dirAttr) return dirAttr.toLowerCase() === 'rtl';
    return getComputedStyle(document.documentElement).direction === 'rtl';
  };

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
    const estimatedHeight = measuredHeight || 300;

    let top = rect.bottom + GAP_PX;
    if (top + estimatedHeight > window.innerHeight - VIEWPORT_PADDING_PX) {
      const flippedTop = rect.top - estimatedHeight - GAP_PX;
      top = flippedTop >= VIEWPORT_PADDING_PX
        ? flippedTop
        : Math.max(VIEWPORT_PADDING_PX, window.innerHeight - estimatedHeight - VIEWPORT_PADDING_PX);
    }

    setMenuStyle({
      position: 'fixed',
      top,
      left,
      width,
      zIndex: 9999,
      maxHeight: 'min(70vh, 440px)',
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

  const handleAction = (callback?: (id: string) => void) => {
    if (callback) callback(postId);
    setIsOpen(false);
  };

  /**
   * A toggle row for a boolean flag.
   * - When `active = false`: "Add to …" with green Plus icon
   * - When `active = true`:  "Remove from …" with red Minus icon
   * Clicking always calls the same callback (the mutation toggles !current value).
   */
  const FlagToggleItem = ({
    active,
    addLabel,
    removeLabel,
    onClick,
  }: {
    active: boolean;
    addLabel: string;
    removeLabel: string;
    onClick?: (id: string) => void;
  }) => (
    <button
      type="button"
      onClick={() => handleAction(onClick)}
      className={`w-full px-4 py-2.5 text-start text-sm flex items-center justify-start gap-3 transition-colors duration-200 ${
        active
          ? 'text-rose-600 hover:bg-rose-50'
          : 'text-slate-700 hover:bg-slate-50'
      }`}
    >
      {active ? (
        <Minus className="w-4 h-4 text-rose-500 shrink-0" />
      ) : (
        <Plus className="w-4 h-4 text-slate-400 shrink-0" />
      )}
      <span className="font-medium">{active ? removeLabel : addLabel}</span>
    </button>
  );

  return (
    <div className="relative inline-block">
      {/* Trigger */}
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

      {/* Menu */}
      {isOpen && typeof document !== 'undefined'
        ? createPortal(
          <div
            ref={menuRef}
            style={menuStyle}
            className="bg-white rounded-xl shadow-lg ring-1 ring-slate-200 py-1.5"
            role="menu"
          >
            {/* Edit */}
            <button
              type="button"
              onClick={() => handleAction(onEdit)}
              className="w-full px-4 py-2.5 text-start text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-start gap-3 transition-colors duration-200"
            >
              <Pencil className="text-slate-500 w-4 h-4" />
              <span>{t('common.edit')}</span>
            </button>

            <div className="border-t border-slate-100 my-1" />

            {/* Slider */}
            <FlagToggleItem
              active={isSlider}
              addLabel={t('formLabels.addToSlider')}
              removeLabel={t('formLabels.removeFromSlider') || 'Remove from Slider'}
              onClick={onAddToSlider}
            />

            {/* Featured */}
            <FlagToggleItem
              active={isFeatured}
              addLabel={t('formLabels.addToFeatured')}
              removeLabel={t('formLabels.removeFromFeatured') || 'Remove from Featured'}
              onClick={onAddToFeatured}
            />

            {/* Breaking */}
            <FlagToggleItem
              active={isBreaking}
              addLabel={t('formLabels.addToBreaking')}
              removeLabel={t('formLabels.removeFromBreaking') || 'Remove from Breaking'}
              onClick={onAddToBreaking}
            />

            {/* Recommended */}
            <FlagToggleItem
              active={isRecommended}
              addLabel={t('formLabels.addToRecommended')}
              removeLabel={t('formLabels.removeFromRecommended') || 'Remove from Recommended'}
              onClick={onAddToRecommended}
            />

            <div className="border-t border-slate-100 my-1" />

            {/* Delete */}
            <button
              type="button"
              onClick={() => handleAction(onDelete)}
              className="w-full px-4 py-2.5 text-start text-sm text-red-600 hover:bg-red-50 flex items-center justify-start gap-3 transition-colors duration-200"
            >
              <Trash className="text-red-500 w-4 h-4" />
              <span>{t('common.delete')}</span>
            </button>
          </div>,
          document.body
        )
        : null}
    </div>
  );
}
