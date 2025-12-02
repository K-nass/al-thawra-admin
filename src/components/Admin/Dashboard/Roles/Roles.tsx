import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import { rolesApi } from "@/api";
import { Link } from "react-router-dom";
import Loader from "@/components/Common/Loader";

export default function Roles() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(15);
  const [searchPhrase, setSearchPhrase] = useState("");
  const [deleteError, setDeleteError] = useState<string>("");
  const [roleToDelete, setRoleToDelete] = useState<{ id: string; name: string } | null>(null);

  // Fetch roles using React Query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["roles", pageNumber, pageSize, searchPhrase],
    queryFn: () => rolesApi.getAll({ pageNumber, pageSize, searchPhrase }),
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: (roleId: string) => rolesApi.delete(roleId),
    onSuccess: async () => {
      // Clear any previous errors
      setDeleteError("");
      // Refetch roles after successful deletion
      await queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data;
        const status = err.response?.status;
        
        // Handle 404 - Role not found (might have been already deleted)
        if (status === 404) {
          // Don't show error, just refresh the list since it's already gone
          queryClient.invalidateQueries({ queryKey: ["roles"] });
          setRoleToDelete(null);
        } else if (responseData?.title) {
          setDeleteError(responseData.title);
        } else if (responseData?.message) {
          setDeleteError(responseData.message);
        } else {
          setDeleteError("Failed to delete role");
        }
      } else {
        setDeleteError("An unexpected error occurred");
      }
    },
  });

  const handleDeleteRole = (roleId: string, roleName: string) => {
    setRoleToDelete({ id: roleId, name: roleName });
  };

  const confirmDelete = () => {
    if (roleToDelete) {
      deleteRoleMutation.mutate(roleToDelete.id);
      setRoleToDelete(null);
    }
  };

  const cancelDelete = () => {
    setRoleToDelete(null);
  };

  // Format permission name for display
  const formatPermission = (permission: string) => {
    return permission.replace(/([A-Z])/g, " $1").trim();
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Delete Confirmation Modal */}
      {roleToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Delete Role
            </h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete the role <span className="font-semibold">"{roleToDelete.name}"</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteRoleMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteRoleMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            {t('roles.rolesAndPermissions')}
          </h1>
          <Link to="/admin/add-role" className="bg-primary  text-sm font-medium px-4 py-2 rounded-md flex items-center shadow-sm hover:bg-emerald-700 hover:text-white">
            {t('roles.addRole')}
          </Link>
        </div>

        {/* Search Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder={t('roles.searchRoles')}
            value={searchPhrase}
            onChange={(e) => setSearchPhrase(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Delete Error Message */}
        {deleteError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{deleteError}</p>
            <button
              onClick={() => setDeleteError("")}
              className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
            >
              Dismiss
            </button>
          </div>
        )}
        {/* Loading State */}
        {isLoading && <Loader />}

        {/* Error State */}
        {isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p className="font-semibold">
              {axios.isAxiosError(error) && error.response?.status === 403 
                ? t('roles.accessDenied')
                : t('roles.errorLoadingRoles')}
            </p>
            <p className="text-sm">
              {axios.isAxiosError(error) && error.response?.status === 403
                ? t('roles.accessDeniedMessage')
                : error instanceof Error ? error.message : "An error occurred"}
            </p>
          </div>
        )}

        {/* Data Table */}
        {!isLoading && !isError && data && (
          <>
            <div className="bg-white  rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 /50">
                    <tr>
                      <th className="p-4 text-left font-semibold text-slate-600  tracking-wider">
                        {t('roles.roleName')}
                      </th>
                      <th className="p-4 text-left font-semibold text-slate-600  tracking-wider">
                        {t('roles.permissions')}
                      </th>
                      <th className="p-4 text-left font-semibold text-slate-600  tracking-wider">
                        {t('roles.options')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 ">
                    {data.items.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-slate-500">
                          {t('roles.noRolesFound')}
                        </td>
                      </tr>
                    ) : (
                      data.items.map((role) => (
                        <tr key={role.id}>
                          <td className="p-4 align-top">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-slate-800 ">
                                {role.name}
                              </span>
                              {role.isDefault && (
                                <span className="text-xs font-medium bg-slate-100  text-slate-600  px-2 py-0.5 rounded-md">
                                  {t('roles.default')}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 align-top">
                            {role.allPermissions ? (
                              <span className="inline-block bg-green-600 text-white font-bold  text-xs font-medium mr-2 mb-2 px-2.5 py-1 rounded">
                                {t('roles.allPermissions')}
                              </span>
                            ) : (
                              <div className="flex flex-wrap">
                                {role.permissions.map((permission, index) => (
                                  <span
                                    key={index}
                                    className="inline-block bg-primary  text-xs font-medium mr-2 mb-2 px-2.5 py-1 rounded"
                                  >
                                    {formatPermission(permission)}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="p-4 align-top">
                            <div className="flex items-center space-x-2">
                              <Link
                                to={`/admin/edit-role/${role.id}`}
                                className="flex items-center text-sm bg-slate-100  px-3 py-1.5 rounded-md text-slate-600  hover:bg-slate-200 transition-colors"
                              >
                                {t('common.edit')}
                              </Link>
                              {!role.isDefault && (
                                <button
                                  onClick={() => handleDeleteRole(role.id, role.name)}
                                  disabled={deleteRoleMutation.isPending}
                                  className="p-1.5 rounded-md bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  title="Delete role"
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                {t('roles.showing')} {data.itemsFrom} {t('roles.to')} {data.itemsTo} {t('roles.of')} {data.totalCount} {t('roles.rolesText')}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
                  disabled={pageNumber === 1}
                  className="px-3 py-1.5 text-sm bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('roles.previous')}
                </button>
                <span className="text-sm text-slate-600">
                  {t('roles.page')} {data.pageNumber} {t('roles.of')} {data.totalPages}
                </span>
                <button
                  onClick={() => setPageNumber((prev) => Math.min(data.totalPages, prev + 1))}
                  disabled={pageNumber === data.totalPages}
                  className="px-3 py-1.5 text-sm bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('roles.next')}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


