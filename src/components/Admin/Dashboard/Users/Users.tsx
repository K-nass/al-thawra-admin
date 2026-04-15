import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { usersApi, type GetUsersParams } from "@/api";
import Loader from "@/components/Common/Loader";
import UserActionsDropdown from "@/components/Common/UserActionsDropdown";
import ConfirmDialog from "@/components/ConfirmDialog/ConfirmDialog";
import CreateUserModal from "./CreateUserModal";
import ChangeRoleModal from "./ChangeRoleModal";
import { 
  Users as UsersIcon, 
  Plus, 
  Search, 
  Mail, 
  UserCheck, 
  UserPlus,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { useToast } from "@/components/Toast/ToastContainer";

export default function Users() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  // Filters
  const [role, setRole] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [emailConfirmed, setEmailConfirmed] = useState<boolean | undefined>(undefined);
  const [searchPhrase, setSearchPhrase] = useState<string>("");
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  // UI state
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

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["users", params],
    queryFn: () => usersApi.getAll(params),
  });

  const invalidateUsers = () => queryClient.invalidateQueries({ queryKey: ["users"] });
  const getRoleLabel = (roleName: string) => {
    const roleKey = `users.roles.${roleName.toLowerCase()}`;
    const translated = t(roleKey);
    return translated === roleKey ? roleName : translated;
  };

  // Mutations
  const banMutation = useMutation({
    mutationFn: (id: string) => usersApi.ban(id),
    onSuccess: () => { toast.success(t("users.banSuccess")); invalidateUsers(); },
    onError: (err: any) => toast.error(err?.response?.data?.message || t("users.errors.banFailed")),
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => usersApi.activate(id),
    onSuccess: () => { toast.success(t("users.activateSuccess")); invalidateUsers(); },
    onError: (err: any) => toast.error(err?.response?.data?.message || t("users.errors.activateFailed")),
  });

  const confirmEmailMutation = useMutation({
    mutationFn: (id: string) => usersApi.confirmEmail(id),
    onSuccess: () => { toast.success(t("users.confirmEmailSuccess")); invalidateUsers(); },
    onError: (err: any) => toast.error(err?.response?.data?.message || t("users.errors.confirmEmailFailed")),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => { toast.success(t("users.deleteSuccess")); invalidateUsers(); },
    onError: (err: any) => toast.error(err?.response?.data?.message || t("users.errors.deleteFailed")),
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
    const { action } = confirmDialog;
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
    new Date(dateString).toLocaleDateString(i18n.language?.startsWith("ar") ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-surface">
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-2xl shadow-sm border border-primary/20">
              <UsersIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {t("users.title")}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {t("users.subtitle")}
              </p>
            </div>
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-emerald-600 transition-colors duration-200 gap-2 group"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            {t("users.addUser")}
          </button>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="col-span-1 sm:col-span-2 relative">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{t("common.search")}</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchPhrase}
                  onChange={(e) => setSearchPhrase(e.target.value)}
                  placeholder={t("common.search")}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200"
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{t("users.role")}</label>
              <select
                value={role}
                onChange={(e) => { setRole(e.target.value); setPageNumber(1); }}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200 appearance-none"
              >
                <option value="">{t("common.all")}</option>
                <option value="Admin">{t("users.roles.admin")}</option>
                <option value="Moderator">{t("users.roles.moderator")}</option>
                <option value="Author">{t("users.roles.author")}</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{t("users.status")}</label>
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPageNumber(1); }}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200 appearance-none"
              >
                <option value="">{t("common.all")}</option>
                <option value="Active">{t("users.active")}</option>
                <option value="Inactive">{t("users.inactive")}</option>
              </select>
            </div>

            {/* Email Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{t("users.emailStatus")}</label>
              <select
                value={emailConfirmed === undefined ? "" : emailConfirmed.toString()}
                onChange={(e) => { const v = e.target.value; setEmailConfirmed(v === "" ? undefined : v === "true"); setPageNumber(1); }}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200 appearance-none"
              >
                <option value="">{t("common.all")}</option>
                <option value="true">{t("users.confirmed")}</option>
                <option value="false">{t("users.pending")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm">
            <Loader />
            <p className="mt-4 text-sm text-slate-500 animate-pulse">{t("users.loadingUsers")}</p>
          </div>
        ) : isError ? (
          <div className="p-8 bg-error-background/50 border border-error-border rounded-xl text-center">
            <h3 className="text-lg font-semibold text-error-hover mb-2">{t("users.errors.generic")}</h3>
            <p className="text-sm text-slate-600">
              {error instanceof Error ? error.message : t("users.errors.generic")}
            </p>
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <UsersIcon className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">{t("users.noUsersFound")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[240px] sm:min-w-[300px]">{t("users.userName")}</TableHead>
                  <TableHead className="min-w-[220px]">{t("users.email")}</TableHead>
                  <TableHead className="hidden md:table-cell w-[120px]">{t("users.role")}</TableHead>
                  <TableHead className="w-[120px]">{t("users.status")}</TableHead>
                  <TableHead className="hidden lg:table-cell w-[140px]">{t("users.emailStatus")}</TableHead>
                  <TableHead className="hidden lg:table-cell w-[150px]">{t("post.date")}</TableHead>
                  <TableHead className="text-right w-[120px]">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {user.avatarImageUrl ? (
                            <img
                              src={user.avatarImageUrl}
                              alt={user.userName}
                              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold border-2 border-white shadow-sm ring-1 ring-primary/20">
                              {user.userName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${user.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-slate-900 truncate">
                            {user.userName}
                          </span>
                          <span className="text-xs text-slate-500 font-medium truncate">
                            {t("users.idShort")}: {user.id.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-[14rem] sm:max-w-[18rem] md:max-w-none">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="primary" className="bg-indigo-50 text-indigo-700 border-indigo-100">
                        <ShieldCheck className="w-3 h-3" />
                        <span>{getRoleLabel(user.role)}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "success" : "error"}>
                        {user.isActive ? t("users.active") : t("users.inactive")}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant={user.emailConfirmed ? "success" : "warning"}>
                        {user.emailConfirmed ? (
                          <>
                            <UserCheck className="w-3 h-3" />
                            <span>{t("users.confirmed")}</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3 h-3" />
                            <span>{t("users.pending")}</span>
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(user.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Pagination
              pageNumber={data.pageNumber}
              totalPages={data.totalPages}
              itemsFrom={data.itemsFrom}
              itemsTo={data.itemsTo}
              totalCount={data.totalCount}
              onPageChange={setPageNumber}
            />
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={getConfirmTitle()}
        message={getConfirmMessage()}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        confirmText={t("common.confirm")}
        cancelText={t("common.cancel")}
        type={confirmDialog.action === "delete" || confirmDialog.action === "ban" ? "danger" : "info"}
      />

      <CreateUserModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => { invalidateUsers(); toast.success(t("users.createSuccess")); }}
      />

      <ChangeRoleModal
        isOpen={changeRoleModal.isOpen}
        userId={changeRoleModal.userId}
        currentRole={changeRoleModal.currentRole}
        onClose={() => setChangeRoleModal((prev) => ({ ...prev, isOpen: false }))}
        onSuccess={() => { invalidateUsers(); toast.success(t("users.changeRoleSuccess")); }}
      />
    </div>
  );
}
