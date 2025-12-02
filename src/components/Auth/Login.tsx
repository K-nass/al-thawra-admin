import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { setAuthToken, setRefreshToken, setUserRole } from '@/api/client';
import { authApi, type LoginRequest } from '@/api/auth.api';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle/LanguageToggle';

export default function Login() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data: any) => {
      // Store tokens in memory - API returns accessToken and refreshToken
      const token = data?.accessToken || data?.token || data?.data?.accessToken;
      const refreshTok = data?.refreshToken || data?.data?.refreshToken;

      if (token) {
        setAuthToken(token);
      } else {
        // No token found in response
      }

      if (refreshTok) {
        setRefreshToken(refreshTok);
      } else {
        // No refresh token found in response
      }
      
      // Get user role from response and store it
      const userRole = data?.user?.role || '';
      if (userRole) {
        setUserRole(userRole);
      }
      
      setFieldErrors({});
      setNotification({
        type: 'success',
        message: t('auth.loginSuccess'),
      });
      
      // Redirect based on role after short delay
      setTimeout(() => {
        // Member and Author go to home page
        if (userRole === 'Member' || userRole === 'Author') {
          navigate('/home');
        } else {
          // Admin and other roles go to admin panel
          navigate('/admin');
        }
      }, 1000);
    },
    onError: (error: unknown) => {
      let message = 'Login failed';
      const errors: Record<string, string[]> = {};

      if (axios.isAxiosError(error)) {
        const d = error.response?.data;
        // Check for title first (general error message)
        if (d?.title) message = String(d.title);
        else if (d?.message) message = String(d.message);
        else if (d?.errors) {
          if (typeof d.errors === 'object') {
            Object.entries(d.errors).forEach(([field, messages]) => {
              // Normalize field name to lowercase for matching form fields
              const normalizedField = field.toLowerCase();
              if (Array.isArray(messages)) {
                errors[normalizedField] = messages;
              } else if (typeof messages === 'string') {
                errors[normalizedField] = [messages];
              }
            });
          }
          message = d.message || 'Validation failed';
        } else message = error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      setFieldErrors(errors);
      setNotification({ type: 'error', message });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Language Toggle */}
        <div className="flex justify-end mb-4">
          <LanguageToggle />
        </div>
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/icon.jpg" alt="Logo" className="w-20 h-20 rounded-lg shadow-lg" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">{t('app.name')}</h1>
          <p className="text-indigo-100">{t('auth.adminLogin')}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Notification */}
          {notification && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                notification.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('auth.email')}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  fieldErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                required
              />
              {fieldErrors.email && (
                <ul className="mt-1 space-y-1">
                  {fieldErrors.email.map((error, idx) => (
                    <li key={idx} className="text-sm text-red-600">• {error}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.password')}
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('auth.password')}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  fieldErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                required
              />
              {fieldErrors.password && (
                <ul className="mt-1 space-y-1">
                  {fieldErrors.password.map((error, idx) => (
                    <li key={idx} className="text-sm text-red-600">• {error}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              {mutation.isPending ? t('auth.loggingIn') : t('auth.login')}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              {t('auth.noAccount')}{' '}
              <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                {t('auth.registerHere')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
