import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
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
    <div className="fixed inset-0 z-10000 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-sm w-full mx-4">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FontAwesomeIcon icon={faXmark} className="text-xl" />
        </button>

        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">{t('users.changeRole')}</h2>
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

            {/* Role dropdown */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('users.newRole')}
              </label>
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setRoleError(null);
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm ${
                  roleError ? 'border-red-400' : 'border-slate-300'
                }`}
              >
                <option value="">{t('users.selectRole')}</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>
              {roleError && (
                <p className="mt-1 text-xs text-red-600">{roleError}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
