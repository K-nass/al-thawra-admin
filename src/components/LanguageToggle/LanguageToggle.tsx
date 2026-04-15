import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  variant?: 'light' | 'dark';
  showLabel?: boolean;
}

export default function LanguageToggle({ variant = 'light', showLabel = true }: LanguageToggleProps) {
  const { language, toggleLanguage } = useLanguage();

  const styles = variant === 'light' 
    ? 'bg-white/10 hover:bg-white/20 text-white'
    : 'bg-gray-700/50 hover:bg-gray-600/50 text-slate-300 hover:text-white';

  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 ${styles}`}
      aria-label="Toggle language"
      title={!showLabel ? (language === 'en' ? 'العربية' : 'English') : undefined}
    >
      <Globe className="w-5 h-5 flex-shrink-0" />
      {showLabel && (
        <span className="font-medium whitespace-nowrap overflow-hidden">
          {language === 'en' ? 'العربية' : 'English'}
        </span>
      )}
    </button>
  );
}
