import React from 'react';
import { type LucideIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SidebarToggleButtonProps {
  onClick: () => void;
  icon: LucideIcon;
  className?: string;
  ariaLabel?: string;
}

export default function SidebarToggleButton({
  onClick,
  icon: Icon,
  className = "",
  ariaLabel,
}: SidebarToggleButtonProps) {
  const { t } = useLanguage();

  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 ${className}`}
      aria-label={ariaLabel || t("common.toggle")}
    >
      <Icon size={20} />
    </button>
  );
}
