import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { X, Shield, Loader2, Save } from 'lucide-react';
import { usersApi, type ChangeUserRoleDto } from '@/api/users.api';
import { rolesApi } from '@/api/roles.api';

interface ChangeRoleModalProps {
  isOpen: boolean;
  userId: string;
  currentRole: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ChangeRoleModal({
  isOpen,
  userId,
  currentRole,
  onClose,
  onSuccess,
}: ChangeRoleModalProps) {
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedRole(currentRole);
      setRoleError(null);
      setApiError(null);
    }
  }, [isOpen, currentRole]);

  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesApi.getAll({ pageSize: 90 }),
    enabled: isOpen,
  });

  const roles = rolesData?.items ?? [];

  const { mutate: changeRole, isPending } = useMutation({
    mutationFn: (data: ChangeUserRoleDto) => usersApi.changeRole(userId, data),
    onSuccess: () => {
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.title ||
        error?.response?.data?.message ||
        t('users.errors.generic');
      setApiError(message);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);
    if (!selectedRole) {
      setRoleError(t('users.validation.roleRequired'));
      return;
    }
    setRoleError(null);
    changeRole({ userId, newRoleName: selectedRole });
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
               <Shield size={18} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">{t('users.changeRole')}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="p-6 space-y-4">
            {/* API Error */}
            {apiError && (
              <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                {apiError}
              </div>
            )}

            {/* Role dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                {t('users.newRole')}
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                    setRoleError(null);
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all appearance-none ${
                    roleError 
                      ? 'border-red-300 focus:ring-red-100' 
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
              {roleError && (
                <p className="px-1 text-xs font-medium text-red-500">{roleError}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-all font-semibold text-sm shadow-sm"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-emerald-600 active:scale-[0.98] transition-all font-semibold text-sm shadow-sm shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isPending ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
