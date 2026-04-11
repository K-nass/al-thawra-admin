import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { usersApi, type CreateUserDto } from '@/api/users.api';
import { rolesApi } from '@/api/roles.api';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormState {
  userName: string;
  email: string;
  password: string;
  roleName: string;
}

interface FormErrors {
  userName?: string;
  email?: string;
  password?: string;
  roleName?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
  const { t } = useTranslation();

  const [form, setForm] = useState<FormState>({
    userName: '',
    email: '',
    password: '',
    roleName: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesApi.getAll({ pageSize: 90 }),
    enabled: isOpen,
  });

  const roles = rolesData?.items?.filter(r => r.name.toLowerCase() !== 'admin') ?? [];

  const { mutate: createUser, isPending } = useMutation({
    mutationFn: (data: CreateUserDto) => usersApi.create(data),
    onSuccess: () => {
      onSuccess();
      handleClose();
    },
    onError: (error: any) => {
      if (error?.response?.status === 422 && error?.response?.data?.errors) {
         const firstErrorKey = Object.keys(error.response.data.errors)[0];
         const firstErrorMessage = error.response.data.errors[firstErrorKey][0];
         setApiError(firstErrorMessage);
         return;
      }
      const message =
        error?.response?.data?.title ||
        error?.response?.data?.message ||
        t('users.errors.generic');
      setApiError(message);
    },
  });

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!form.userName.trim()) {
      newErrors.userName = t('users.validation.userNameRequired');
    } else if (form.userName.length < 3) {
      newErrors.userName = t('users.validation.userNameMinLength', 'Username must be at least 3 characters.');
    } else if (!/^[a-zA-Z0-9_-]+$/.test(form.userName)) {
      newErrors.userName = t('users.validation.userNameInvalid', 'Username can only contain letters, numbers, hyphens, and underscores.');
    }

    if (!form.email.trim()) {
      newErrors.email = t('users.validation.emailRequired');
    } else if (!EMAIL_REGEX.test(form.email)) {
      newErrors.email = t('users.validation.emailInvalid');
    }

    if (!form.password) {
      newErrors.password = t('users.validation.passwordRequired');
    } else if (form.password.length < 6) {
      newErrors.password = t('users.validation.passwordMinLength');
    } else if (!/[A-Z]/.test(form.password)) {
      newErrors.password = t('users.validation.passwordUppercase', 'Password must contain at least one uppercase letter.');
    } else if (!/[a-z]/.test(form.password)) {
      newErrors.password = t('users.validation.passwordLowercase', 'Password must contain at least one lowercase letter.');
    } else if (!/[0-9]/.test(form.password)) {
      newErrors.password = t('users.validation.passwordDigit', 'Password must contain at least one digit.');
    } else if (!/[^A-Za-z0-9]/.test(form.password)) {
      newErrors.password = t('users.validation.passwordSpecial', 'Password must contain at least one special character.');
    }

    if (!form.roleName) {
      newErrors.roleName = t('users.validation.roleRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);
    if (!validate()) return;
    createUser(form);
  }

  function handleClose() {
    setForm({ userName: '', email: '', password: '', roleName: '' });
    setErrors({});
    setApiError(null);
    onClose();
  }

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10000 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-4">
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FontAwesomeIcon icon={faXmark} className="text-xl" />
        </button>

        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">{t('users.createUser')}</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="p-6 space-y-4">
            {/* API Error */}
            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {apiError}
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('users.userName')}
              </label>
              <input
                type="text"
                value={form.userName}
                onChange={(e) => handleChange('userName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm ${
                  errors.userName ? 'border-red-400' : 'border-slate-300'
                }`}
              />
              {errors.userName && (
                <p className="mt-1 text-xs text-red-600">{errors.userName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('users.email')}
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm ${
                  errors.email ? 'border-red-400' : 'border-slate-300'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('users.password')}
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm ${
                  errors.password ? 'border-red-400' : 'border-slate-300'
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('users.role')}
              </label>
              <select
                value={form.roleName}
                onChange={(e) => handleChange('roleName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm ${
                  errors.roleName ? 'border-red-400' : 'border-slate-300'
                }`}
              >
                <option value="">{t('users.selectRole')}</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>
              {errors.roleName && (
                <p className="mt-1 text-xs text-red-600">{errors.roleName}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? t('users.creating') : t('users.createUser')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
