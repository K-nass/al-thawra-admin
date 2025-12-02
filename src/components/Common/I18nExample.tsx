import { useTranslation } from 'react-i18next';
import { Globe, Settings, LogOut, Home } from 'lucide-react';

/**
 * Example component showing how to use i18next translations with Lucide icons
 * 
 * Usage:
 * - Import useTranslation hook from react-i18next
 * - Use t('key.path') to get translations
 * - Combine with Lucide icons for a modern UI
 */
export default function I18nExample() {
  const { t, i18n } = useTranslation();

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">{t('app.name')}</h2>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Home className="w-5 h-5" />
          <span>{t('dashboard.home')}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          <span>{t('common.search')}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          <span>{t('common.filter')}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <LogOut className="w-5 h-5" />
          <span>{t('dashboard.logout')}</span>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        Current language: {i18n.language}
      </div>
    </div>
  );
}
