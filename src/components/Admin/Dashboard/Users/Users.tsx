import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { usersApi, type GetUsersParams } from "@/api";
import Loader from "@/components/Common/Loader";
import UserActionsDropdown from "@/components/Common/UserActionsDropdown";
import ApiNotification from "@/components/Common/ApiNotification";
import ConfirmDialog from "@/components/ConfirmDialog/ConfirmDialog";
import CreateUserModal from "./CreateUserModal";
import ChangeRoleModal from "./ChangeRoleModal";

export default function Users() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Filters
  const [role, setRole] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [emailConfirmed, setEmailConfirmed] = useState<boolean | undefined>(undefined);
  const [searchPhrase, setSearchPhrase] = useState<string>("");
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  // UI state
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: "ban" | "activate" | "confirmEmail" | "delete" | null;
    userId: string;
    userName: string;
  }>({ isOpen: false, action: null, userId: "", userName: "" });
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [changeRoleModal, setChangeRoleModal] = useState<{
    isOpen: boolean;
    userId: string;
    currentRole: string;
  }>({ isOpen: false, userId: "", currentRole: "" });

  // Build query params
  const params: GetUsersParams = { PageNumber: pageNumber, PageSize: pageSize };
  if (role) params.Role = role;
  if (status) params.Status = status;
  if (emailConfirmed !== undefined) params.EmailConfirmed = emailConfirmed;
  if (searchPhrase) params.SearchPhrase = searchPhrase;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["users", params],
    queryFn: () => usersApi.getAll(params),
  });

  const invalidateUsers = () => queryClient.invalidateQueries({ queryKey: ["users"] });

  const showError = (error: any) => {
    const message =
      error?.response?.data?.title ||
      error?.response?.data?.message ||
      t("users.errors.generic");
    setNotification({ type: "error", message });
  };

  // Mutations
  const banMutation = useMutation({
    mutationFn: (id: string) => usersApi.ban(id),
    onSuccess: () => { setNotification({ type: "success", message: t("users.banSuccess") }); invalidateUsers(); },
    onError: showError,
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => usersApi.activate(id),
    onSuccess: () => { setNotification({ type: "success", message: t("users.activateSuccess") }); invalidateUsers(); },
    onError: showError,
  });

  const confirmEmailMutation = useMutation({
    mutationFn: (id: string) => usersApi.confirmEmail(id),
    onSuccess: () => { setNotification({ type: "success", message: t("users.confirmEmailSuccess") }); invalidateUsers(); },
    onError: showError,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => { setNotification({ type: "success", message: t("users.deleteSuccess") }); invalidateUsers(); },
    onError: showError,
  });

  // Confirm dialog handlers
  const openConfirm = (action: typeof confirmDialog["action"], userId: string, userName: string) => {
    setConfirmDialog({ isOpen: true, action, userId, userName });
  };

  const handleConfirm = () => {
    const { action, userId } = confirmDialog;
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
    if (action === "ban") banMutation.mutate(userId);
    else if (action === "activate") activateMutation.mutate(userId);
    else if (action === "confirmEmail") confirmEmailMutation.mutate(userId);
    else if (action === "delete") deleteMutation.mutate(userId);
  };

  const getConfirmTitle = () => {
    const { action, userName } = confirmDialog;
    if (action === "ban") return t("users.banConfirmTitle");
    if (action === "activate") return t("users.activateConfirmTitle");
    if (action === "confirmEmail") return t("users.confirmEmailTitle");
    return t("users.deleteConfirmTitle");
  };

  const getConfirmMessage = () => {
    const { action, userName } = confirmDialog;
    if (action === "ban") return t("users.banConfirmMessage", { userName });
    if (action === "activate") return t("users.activateConfirmMessage", { userName });
    if (action === "confirmEmail") return t("users.confirmEmailMessage", { userName });
    return t("users.deleteConfirmMessage", { userName });
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="flex-1 flex flex-col">
      {/* Notification */}
      {notification && (
        <ApiNotification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={getConfirmTitle()}
        message={getConfirmMessage()}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        confirmText={t("common.confirm", "Confirm")}
        cancelText={t("common.cancel", "Cancel")}
      />

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => { setCreateModalOpen(false); invalidateUsers(); setNotification({ type: "success", message: t("users.createSuccess") }); }}
      />

      {/* Change Role Modal */}
      <ChangeRoleModal
        isOpen={changeRoleModal.isOpen}
        userId={changeRoleModal.userId}
        currentRole={changeRoleModal.currentRole}
        onClose={() => setChangeRoleModal((prev) => ({ ...prev, isOpen: false }))}
        onSuccess={() => { setChangeRoleModal((prev) => ({ ...prev, isOpen: false })); invalidateUsers(); setNotification({ type: "success", message: t("users.changeRoleSuccess") }); }}
      />

      <div className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">{t("users.title")}</h1>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold bg-primary hover:bg-emerald-700 text-white rounded-lg shadow-md transition-all"
          >
            <span>{t("users.addUser")}</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Show */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t("common.show")}</label>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPageNumber(1); }}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                {[15, 30, 60, 90].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t("users.role")}</label>
              <select
                value={role}
                onChange={(e) => { setRole(e.target.value); setPageNumber(1); }}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="">{t("common.all")}</option>
                <option value="Admin">Admin</option>
                <option value="Moderator">Moderator</option>
                <option value="Author">Author</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t("users.status")}</label>
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPageNumber(1); }}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="">{t("common.all")}</option>
                <option value="Active">{t("users.active")}</option>
                <option value="Inactive">{t("users.inactive")}</option>
              </select>
            </div>

            {/* Email Status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t("users.emailStatus")}</label>
              <select
                value={emailConfirmed === undefined ? "" : emailConfirmed.toString()}
                onChange={(e) => { const v = e.target.value; setEmailConfirmed(v === "" ? undefined : v === "true"); setPageNumber(1); }}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="">{t("common.all")}</option>
                <option value="true">{t("users.confirmed")}</option>
                <option value="false">{t("users.pending")}</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t("common.search")}</label>
              <input
                type="text"
                value={searchPhrase}
                onChange={(e) => setSearchPhrase(e.target.value)}
                placeholder={t("common.search")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading && <Loader />}

        {/* Error */}
        {isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p className="text-sm">{t("users.errors.generic")}</p>
          </div>
        )}

        {/* Table */}
        {!isLoading && !isError && data && (
          <>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-4 text-left font-semibold text-slate-600">{t("users.userName")}</th>
                      <th className="p-4 text-left font-semibold text-slate-600">{t("users.email")}</th>
                      <th className="p-4 text-left font-semibold text-slate-600">{t("users.role")}</th>
                      <th className="p-4 text-left font-semibold text-slate-600">{t("users.status")}</th>
                      <th className="p-4 text-left font-semibold text-slate-600">{t("users.emailStatus")}</th>
                      <th className="p-4 text-left font-semibold text-slate-600">{t("post.date")}</th>
                      <th className="p-4 text-left font-semibold text-slate-600">{t("common.actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {data.items.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                          {t("users.noUsersFound")}
                        </td>
                      </tr>
                    ) : (
                      data.items.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50">
                          <td className="p-4">
                            <div className="flex items-center space-x-3 rtl:space-x-reverse">
                              {user.avatarImageUrl ? (
                                <img
                                  src={user.avatarImageUrl}
                                  alt={user.userName}
                                  className="w-10 h-10 rounded-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                    const fb = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (fb) fb.style.display = "flex";
                                  }}
                                />
                              ) : null}
                              <div
                                className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold"
                                style={{ display: user.avatarImageUrl ? "none" : "flex" }}
                              >
                                {user.userName.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-slate-800">{user.userName}</span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-600">{user.email}</td>
                          <td className="p-4">
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded">
                              {user.role}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded ${user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                              {user.isActive ? t("users.active") : t("users.inactive")}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded ${user.emailConfirmed ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                              {user.emailConfirmed ? t("users.confirmed") : t("users.pending")}
                            </span>
                          </td>
                          <td className="p-4 text-slate-600">{formatDate(user.createdAt)}</td>
                          <td className="p-4">
                            <UserActionsDropdown
                              userId={user.id}
                              userName={user.userName}
                              isActive={user.isActive}
                              emailConfirmed={user.emailConfirmed}
                              onEdit={(id) => navigate(`/admin/edit-user/${id}/${user.userName}`)}
                              onBan={(id) => openConfirm("ban", id, user.userName)}
                              onActivate={(id) => openConfirm("activate", id, user.userName)}
                              onChangeRole={(id) => setChangeRoleModal({ isOpen: true, userId: id, currentRole: user.role })}
                              onConfirmEmail={(id) => openConfirm("confirmEmail", id, user.userName)}
                              onDelete={(id) => openConfirm("delete", id, user.userName)}
                            />
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
                {data.itemsFrom}–{data.itemsTo} / {data.totalCount}
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                  disabled={pageNumber === 1}
                  className="px-3 py-1.5 text-sm bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("roles.previous")}
                </button>
                <span className="text-sm text-slate-600">
                  {data.pageNumber} / {data.totalPages}
                </span>
                <button
                  onClick={() => setPageNumber((p) => Math.min(data.totalPages, p + 1))}
                  disabled={pageNumber === data.totalPages}
                  className="px-3 py-1.5 text-sm bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("roles.next")}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
