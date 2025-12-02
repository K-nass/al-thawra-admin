import { useNavigate } from "react-router-dom";
import { useLogout } from "@/hooks/useLogout";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle/LanguageToggle";

export default function Home() {
  const navigate = useNavigate();
  const { logout, isLoading } = useLogout();
  const { t } = useLanguage();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-primary">Al-Qabas CMS</h1>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageToggle />
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? t('common.loading') : t('auth.logout')}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('common.welcome')} to Al-Qabas CMS
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Your content management platform
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Create Content
              </h3>
              <p className="text-gray-600">
                Write and publish articles, videos, and more
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                View Analytics
              </h3>
              <p className="text-gray-600">
                Track your content performance and engagement
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Manage Posts
              </h3>
              <p className="text-gray-600">
                Edit and organize your published content
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-12">
            <button
              onClick={() => navigate('/admin')}
              className="px-8 py-3 bg-primary text-white text-lg font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-md"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-600">
          <p>&copy; 2025 Al-Qabas CMS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
