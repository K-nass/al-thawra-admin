import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { X, User, Mail, Lock, Shield, Loader2 } from 'lucide-react';
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
      newErrors.userName = t('users.validation.userNameMinLength');
    } else if (!/^[a-zA-Z0-9_-]+$/.test(form.userName)) {
      newErrors.userName = t('users.validation.userNameInvalid');
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
      newErrors.password = t('users.validation.passwordUppercase');
    } else if (!/[a-z]/.test(form.password)) {
      newErrors.password = t('users.validation.passwordLowercase');
    } else if (!/[0-9]/.test(form.password)) {
      newErrors.password = t('users.validation.passwordDigit');
    } else if (!/[^A-Za-z0-9]/.test(form.password)) {
      newErrors.password = t('users.validation.passwordSpecial');
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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-lg max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
               <User size={18} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">{t('users.createUser')}</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors duration-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col">
          <div className="p-6 space-y-5">
            {/* API Error */}
            {apiError && (
              <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm font-medium animate-in slide-in-from-top-2 duration-300">
                {apiError}
              </div>
            )}

            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ltr:ml-1 rtl:mr-1">
                {t('users.userName')}
              </label>
              <div className="relative">
                <User className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={form.userName}
                  onChange={(e) => handleChange('userName', e.target.value)}
                  placeholder={t('users.placeholders.userName')}
                  className={`w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-colors duration-200 ${
                    errors.userName 
                      ? 'border-red-300 focus:ring-red-100 text-red-900' 
                      : 'border-slate-200 focus:ring-primary/10 focus:border-primary'
                  }`}
                />
              </div>
              {errors.userName && (
                <p className="px-1 text-xs font-medium text-red-500">{errors.userName}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ltr:ml-1 rtl:mr-1">
                {t('users.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder={t('users.placeholders.email')}
                  className={`w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-colors duration-200 ${
                    errors.email 
                      ? 'border-red-300 focus:ring-red-100 text-red-900' 
                      : 'border-slate-200 focus:ring-primary/10 focus:border-primary'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="px-1 text-xs font-medium text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ltr:ml-1 rtl:mr-1">
                {t('users.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder={t('users.placeholders.password')}
                  className={`w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-colors duration-200 ${
                    errors.password 
                      ? 'border-red-300 focus:ring-red-100 text-red-900' 
                      : 'border-slate-200 focus:ring-primary/10 focus:border-primary'
                  }`}
                />
              </div>
              {errors.password && (
                <p className="px-1 text-xs font-medium text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ltr:ml-1 rtl:mr-1">
                {t('users.role')}
              </label>
              <div className="relative">
                <Shield className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={form.roleName}
                  onChange={(e) => handleChange('roleName', e.target.value)}
                  className={`w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-colors duration-200 appearance-none ${
                    errors.roleName 
                      ? 'border-red-300 focus:ring-red-100 text-red-900' 
                      : 'border-slate-200 focus:ring-primary/10 focus:border-primary'
                  }`}
                >
                  <option value="">{t('users.selectRole')}</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.roleName && (
                <p className="px-1 text-xs font-medium text-red-500">{errors.roleName}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-6 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors duration-200 font-semibold text-sm shadow-sm"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-emerald-600 transition-colors duration-200 font-semibold text-sm shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 size={16} className="animate-spin" />}
              {isPending ? t('users.creating') : t('users.createUser')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
