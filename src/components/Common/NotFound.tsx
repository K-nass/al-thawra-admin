import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

export default function NotFound() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-8">
          <FontAwesomeIcon 
            icon={faExclamationTriangle} 
            className="text-8xl text-amber-500 animate-pulse"
          />
        </div>

        {/* 404 Text */}
        <h1 className="text-9xl font-bold text-slate-800 mb-4">404</h1>

        {/* Title */}
        <h2 className="text-3xl font-bold text-slate-700 mb-4">
          {t('common.notFound')}
        </h2>

        {/* Message */}
        <p className="text-slate-600 mb-8 text-lg">
          {t('common.notFoundMessage')}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-slate-600 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            {t('common.goBack')}
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            {t('common.goHome')}
          </button>
        </div>
      </div>
    </div>
  );
}
